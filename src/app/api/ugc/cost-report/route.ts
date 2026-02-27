import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const APIFY_KEY = process.env.APIFY_API_KEY!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const DEVIN_GROUP_ID = "-5191880198";

/** Fetch Apify run cost. Returns null if lookup fails. */
async function fetchApifyCost(runId: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.usageTotalUsd ?? null;
  } catch {
    return null;
  }
}

/** Run async tasks in batches of `concurrency` at a time */
async function batchAll<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

/** Send a message to a Telegram chat */
async function sendTelegram(chatId: string, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // best-effort
  }
}

interface SyncLogRow {
  id?: string;
  creator_id?: string | null;
  handle: string;
  platform: "tiktok" | "instagram";
  mode: "new-posts" | "refresh-counts" | "first-fetch" | "avatar-refresh";
  status: "succeeded" | "failed";
  posts_processed: number;
  total_posts: number;
  run_id: string | null;
  error?: string | null;
  synced_at: string;
}

/** Key = "handle::platform" */
interface CreatorPlatformEntry {
  handle: string;
  platform: string;
  newPosts: number;           // posts_processed from new-posts row
  updated: number;            // posts_processed from refresh-counts row
  cost: number;               // summed usageTotalUsd
  costUnknown: boolean;       // true if any run_id lookup failed
  succeeded: number;          // count of succeeded rows
  failed: number;             // count of failed rows
}

/**
 * GET /api/ugc/cost-report
 *
 * Vercel Cron: "0 13 * * *" (daily 1 PM UTC / 3 PM Namibia)
 *
 * 1. Fetches ugc_sync_log rows from last 24h
 * 2. Looks up Apify run costs for each run_id (batched, max 20 concurrent)
 * 3. Aggregates per creator+platform: new posts, metrics updated, cost
 * 4. Sends formatted report to Telegram Devin group
 * 5. Returns JSON summary
 */
export async function GET(req: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Fetch sync log rows from last 24h ──────────────────────────────────
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const logRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_sync_log?synced_at=gte.${encodeURIComponent(cutoff)}&order=synced_at.asc&limit=500&select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: "no-store",
    }
  );

  if (!logRes.ok) {
    const text = await logRes.text();
    return NextResponse.json({ error: `Supabase error: ${text}` }, { status: 502 });
  }

  const logs: SyncLogRow[] = await logRes.json();

  // Filter to only new-posts and refresh-counts modes (skip avatar-refresh, first-fetch for cost)
  const relevant = logs.filter(
    (r) => r.mode === "new-posts" || r.mode === "refresh-counts"
  );

  // ── 2. Fetch Apify costs for all run_ids (batch, max 20 concurrent) ───────
  const runIds = Array.from(new Set(relevant.map((r) => r.run_id).filter((id): id is string => !!id)));

  const costMap = new Map<string, number | null>();
  await batchAll(runIds, 20, async (runId) => {
    const cost = await fetchApifyCost(runId);
    costMap.set(runId, cost);
  });

  // ── 3. Aggregate per creator+platform ────────────────────────────────────
  const entryMap = new Map<string, CreatorPlatformEntry>();

  for (const row of relevant) {
    const platformLabel = row.platform === "tiktok" ? "TT" : "IG";
    const key = `${row.handle}::${row.platform}`;

    if (!entryMap.has(key)) {
      entryMap.set(key, {
        handle: row.handle,
        platform: platformLabel,
        newPosts: 0,
        updated: 0,
        cost: 0,
        costUnknown: false,
        succeeded: 0,
        failed: 0,
      });
    }

    const entry = entryMap.get(key)!;

    // Track success/fail
    if (row.status === "succeeded") {
      entry.succeeded++;
    } else {
      entry.failed++;
    }

    // Merge posts data by mode
    if (row.mode === "new-posts") {
      entry.newPosts += row.posts_processed ?? 0;
    } else if (row.mode === "refresh-counts") {
      entry.updated += row.posts_processed ?? 0;
    }

    // Add cost
    if (row.run_id) {
      const cost = costMap.get(row.run_id);
      if (cost === null) {
        entry.costUnknown = true;
      } else if (cost !== undefined) {
        entry.cost += cost;
      }
    }
  }

  // Sort: TikTok before Instagram, alphabetically by handle within each
  const entries = Array.from(entryMap.values()).sort((a, b) => {
    const platOrder = { TT: 0, IG: 1 };
    if (platOrder[a.platform as "TT" | "IG"] !== platOrder[b.platform as "TT" | "IG"]) {
      return platOrder[a.platform as "TT" | "IG"] - platOrder[b.platform as "TT" | "IG"];
    }
    return a.handle.localeCompare(b.handle);
  });

  // ── 4. Build totals ───────────────────────────────────────────────────────
  const totalSucceeded = relevant.filter((r) => r.status === "succeeded").length;
  const totalFailed = relevant.filter((r) => r.status === "failed").length;
  const totalRuns = totalSucceeded + totalFailed;
  const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
  const totalNewPosts = entries.reduce((sum, e) => sum + e.newPosts, 0);
  const totalUpdated = entries.reduce((sum, e) => sum + e.updated, 0);
  const projectedMonthly = totalCost * 30;

  const failedEntries = entries.filter((e) => e.failed > 0);

  // ── 5. Format report ──────────────────────────────────────────────────────
  const today = new Date();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateLabel = `${monthNames[today.getUTCMonth()]} ${today.getUTCDate()}`;

  // Build table lines — pad columns for readability
  // Format: handle+platform | New Posts | Updated | Cost
  const COL_HANDLE = 24; // handle + platform label
  const COL_NEW    = 11; // "+N" right-padded
  const COL_UPD    = 10; // "N" right-padded

  function padRight(s: string, n: number) { return s.padEnd(n, " "); }
  function padLeft(s: string, n: number)  { return s.padStart(n, " "); }

  const headerLine =
    padRight("", COL_HANDLE) +
    padLeft("New Posts", COL_NEW) +
    padLeft("Updated", COL_UPD) +
    "   Cost";

  const tableLines = entries.map((e) => {
    const label = `${e.handle} ${e.platform}`;
    const costStr = e.costUnknown
      ? "?"
      : `$${e.cost.toFixed(4)}`;
    return (
      padRight(label, COL_HANDLE) +
      padLeft(`+${e.newPosts}`, COL_NEW) +
      padLeft(`${e.updated}`, COL_UPD) +
      `   ${costStr}`
    );
  });

  const successLine =
    totalFailed === 0
      ? `✅ ${totalSucceeded}/${totalRuns} runs succeeded`
      : `⚠️ ${totalSucceeded}/${totalRuns} succeeded, ${totalFailed} failed`;

  const failedLine =
    failedEntries.length === 0
      ? "⚠️ Failed runs: none"
      : `⚠️ Failed runs: ${failedEntries.map((e) => `${e.handle} ${e.platform}`).join(", ")}`;

  const report = [
    `📊 UGC Daily Cost Report — ${dateLabel}`,
    "",
    successLine,
    "",
    `<pre>${headerLine}\n${tableLines.join("\n")}</pre>`,
    `💰 Total today: $${totalCost.toFixed(2)}`,
    `📈 Projected monthly: $${projectedMonthly.toFixed(2)}`,
    `🆕 New posts today: ${totalNewPosts}`,
    `🔄 Metrics updated: ${totalUpdated} posts`,
    "",
    failedLine,
  ].join("\n");

  // ── 6. Send to Telegram ───────────────────────────────────────────────────
  await sendTelegram(DEVIN_GROUP_ID, report);

  return NextResponse.json({
    reportedAt: new Date().toISOString(),
    dateLabel,
    totalRuns,
    totalSucceeded,
    totalFailed,
    totalNewPosts,
    totalUpdated,
    totalCostUsd: totalCost,
    projectedMonthlyCostUsd: projectedMonthly,
    creators: entries,
  });
}
