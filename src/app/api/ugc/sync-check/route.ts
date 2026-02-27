import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

/**
 * GET /api/ugc/sync-check
 *
 * Self-healing sync checker. Runs every hour via Vercel cron.
 *
 * Flow:
 *   1. Fetch all active creators from Supabase
 *   2. For each creator, check ugc_sync_log for a successful sync in the last 40 hours
 *   3. If no successful sync found: fire fresh new-posts runs for each platform the creator has
 *   4. Return a summary of what was triggered
 */
export async function GET(req: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch all active creators
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?status=eq.active&select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: "no-store",
    }
  );

  if (!creatorsRes.ok) {
    return NextResponse.json({ error: "Failed to fetch creators" }, { status: 502 });
  }

  const creators: Array<{
    id: string;
    tiktok_handle?: string;
    ig_handle?: string;
    [key: string]: unknown;
  }> = await creatorsRes.json();

  if (!creators.length) {
    return NextResponse.json({ message: "No active creators found", triggered: [], checkedAt: new Date().toISOString() });
  }

  // 2. Fetch recent successful syncs from ugc_sync_log (last 40 hours)
  const cutoffIso = new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString();
  const logRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_sync_log?status=eq.success&synced_at=gte.${encodeURIComponent(cutoffIso)}&select=creator_id,platform,synced_at`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: "no-store",
    }
  );

  const recentLogs: Array<{ creator_id: string; platform: string; synced_at: string }> = logRes.ok
    ? await logRes.json()
    : [];

  // Build a set of creator IDs that have a recent successful sync
  const recentlySynced = new Set(recentLogs.map((r) => r.creator_id));

  // 3. For each creator without a recent sync, fire new-posts runs
  const triggered: Array<{ creatorId: string; platform: string; handle: string }> = [];
  const errors: Array<{ creatorId: string; platform: string; error: string }> = [];

  await Promise.all(
    creators.map(async (creator) => {
      if (recentlySynced.has(creator.id)) return; // already synced recently

      const tasks: Array<Promise<void>> = [];

      // TikTok
      if (creator.tiktok_handle) {
        const handle = creator.tiktok_handle as string;
        const webhookUrl = `${BASE_URL}/api/tiktok/webhook?handle=${encodeURIComponent(handle)}&mode=new-posts&creatorId=${creator.id}&secret=${WEBHOOK_SECRET}`;
        tasks.push(
          fetch(`${BASE_URL}/api/tiktok/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle, mode: "new-posts", webhookUrl }),
          })
            .then(async (res) => {
              if (res.ok) {
                triggered.push({ creatorId: creator.id, platform: "tiktok", handle });
              } else {
                const text = await res.text();
                errors.push({ creatorId: creator.id, platform: "tiktok", error: `HTTP ${res.status}: ${text.slice(0, 100)}` });
              }
            })
            .catch((err) => {
              errors.push({ creatorId: creator.id, platform: "tiktok", error: String(err) });
            })
        );
      }

      // Instagram
      if (creator.ig_handle) {
        const igHandle = creator.ig_handle as string;
        const webhookUrl = `${BASE_URL}/api/instagram/webhook?igHandle=${encodeURIComponent(igHandle)}&mode=new-posts&creatorId=${creator.id}&secret=${WEBHOOK_SECRET}`;
        tasks.push(
          fetch(`${BASE_URL}/api/instagram/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ igHandle, mode: "new-posts", webhookUrl }),
          })
            .then(async (res) => {
              if (res.ok) {
                triggered.push({ creatorId: creator.id, platform: "instagram", handle: igHandle });
              } else {
                const text = await res.text();
                errors.push({ creatorId: creator.id, platform: "instagram", error: `HTTP ${res.status}: ${text.slice(0, 100)}` });
              }
            })
            .catch((err) => {
              errors.push({ creatorId: creator.id, platform: "instagram", error: String(err) });
            })
        );
      }

      await Promise.all(tasks);
    })
  );

  return NextResponse.json({
    message: triggered.length > 0
      ? `Triggered ${triggered.length} new-posts run(s) for stale creators`
      : "All active creators synced recently — nothing to trigger",
    triggered,
    errors,
    checkedAt: new Date().toISOString(),
  });
}
