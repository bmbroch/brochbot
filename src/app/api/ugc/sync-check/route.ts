import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const APIFY_KEY = process.env.APIFY_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";

const ACTORS = [
  { id: "clockworks~tiktok-scraper", platform: "tiktok" },
  { id: "apify~instagram-scraper",   platform: "instagram" },
];

/**
 * GET /api/ugc/sync-check
 *
 * Self-healing sync checker. Runs every hour via Vercel cron.
 *
 * Flow:
 *   1. Fetch last 50 succeeded runs from each Apify actor (last 24h)
 *   2. Check ugc_sync_log for each run_id — if missing, data wasn't saved
 *   3. For each unsaved run: fetch the webhook URL from run input, replay it
 *
 * This removes all dependency on Apify auto-firing webhooks.
 */
export async function GET(req: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const replayed: Array<{ runId: string; platform: string; handle: string; mode: string }> = [];
  const errors: Array<{ runId: string; error: string }> = [];

  for (const actor of ACTORS) {
    // 1. Fetch last 50 SUCCEEDED runs in the last 24h
    const runsRes = await fetch(
      `https://api.apify.com/v2/acts/${actor.id}/runs?token=${APIFY_KEY}&status=SUCCEEDED&limit=50&desc=1`,
      { cache: "no-store" }
    );
    if (!runsRes.ok) continue;

    const { data } = await runsRes.json();
    const runs: Array<{ id: string; startedAt: string; finishedAt: string; defaultDatasetId: string; defaultKeyValueStoreId: string }> = data?.items ?? [];

    // Filter to last 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const recentRuns = runs.filter((r) => new Date(r.startedAt).getTime() > cutoff);

    if (recentRuns.length === 0) continue;

    // 2. Check which run_ids are already in ugc_sync_log
    const runIds = recentRuns.map((r) => r.id);
    const logRes = await fetch(
      `${SUPABASE_URL}/rest/v1/ugc_sync_log?run_id=in.(${runIds.join(",")})&select=run_id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const logRows: Array<{ run_id: string }> = logRes.ok ? await logRes.json() : [];
    const savedRunIds = new Set(logRows.map((r) => r.run_id));

    // 3. For each unsaved run, replay the webhook
    const unsaved = recentRuns.filter((r) => !savedRunIds.has(r.id));

    await Promise.all(
      unsaved.map(async (run) => {
        try {
          // Fetch run input to get the registered webhook URL
          const inputRes = await fetch(
            `https://api.apify.com/v2/key-value-stores/${run.defaultKeyValueStoreId}/records/INPUT?token=${APIFY_KEY}`,
            { cache: "no-store" }
          );
          if (!inputRes.ok) return;

          const input = await inputRes.json();
          const webhookUrl: string = input?.webhooks?.[0]?.requestUrl;
          if (!webhookUrl) return; // run wasn't started by us

          // Parse handle, mode, creatorId from webhook URL
          const url = new URL(webhookUrl);
          const handle = url.searchParams.get("handle") || url.searchParams.get("igHandle");
          const mode = url.searchParams.get("mode");
          if (!handle || !mode) return;

          // Build replay endpoint from webhook URL path
          const replayUrl = `${BASE_URL}${url.pathname}${url.search}`;

          // Replay with correct Apify payload format
          const res = await fetch(replayUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "ACTOR.RUN.SUCCEEDED",
              eventData: { actorRunId: run.id },
              resource: {
                id: run.id,
                defaultDatasetId: run.defaultDatasetId,
                status: "SUCCEEDED",
              },
            }),
          });

          if (res.ok) {
            replayed.push({ runId: run.id, platform: actor.platform, handle, mode });
          } else {
            const text = await res.text();
            errors.push({ runId: run.id, error: `Webhook returned ${res.status}: ${text.slice(0, 100)}` });
          }
        } catch (err) {
          errors.push({ runId: run.id, error: String(err) });
        }
      })
    );
  }

  return NextResponse.json({
    message: replayed.length > 0
      ? `Replayed ${replayed.length} missed webhook(s)`
      : "All runs accounted for — nothing to replay",
    replayed,
    errors,
    checkedAt: new Date().toISOString(),
  });
}
