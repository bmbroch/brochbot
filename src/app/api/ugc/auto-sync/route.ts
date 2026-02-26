import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://brochbot.com";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

/**
 * GET /api/ugc/auto-sync
 *
 * Vercel Cron: "0 8 * * *" (8 AM UTC daily)
 *
 * Flow:
 *   1. Fetch all active creators from ugc_creators
 *   2. For each creator, start TikTok + Instagram Apify runs WITH webhook URLs registered
 *   3. Return immediately — Apify will POST to our webhooks when each run completes
 *   4. Webhooks (/api/tiktok/webhook, /api/instagram/webhook) handle saving data
 *      and updating last_synced_at in ugc_creators
 *
 * On Mondays: also fires "refresh-counts" runs to update view counts on older posts.
 */
export async function GET(req: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon
  const isMonday = dayOfWeek === 1;

  // 1. Fetch active creators
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?status=eq.active&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const creators = await creatorsRes.json();

  if (!Array.isArray(creators) || creators.length === 0) {
    return NextResponse.json({ message: "No active creators", synced: 0 });
  }

  const secretParam = WEBHOOK_SECRET ? `&secret=${encodeURIComponent(WEBHOOK_SECRET)}` : "";
  const runsStarted: Array<{ creator: string; platform: string; mode: string; runId?: string; error?: string }> = [];

  // 2. Fire all runs with webhooks — parallel per creator
  await Promise.all(
    creators.map(async (creator: { id: string; name: string; tiktok_handle?: string; ig_handle?: string }) => {
      const modesForCreator: Array<{ mode: "new-posts" | "refresh-counts" }> = [
        { mode: "new-posts" },
        ...(isMonday ? [{ mode: "refresh-counts" as const }] : []),
      ];

      for (const { mode } of modesForCreator) {
        // TikTok
        if (creator.tiktok_handle) {
          const ttWebhookUrl =
            `${BASE_URL}/api/tiktok/webhook` +
            `?handle=${encodeURIComponent(creator.tiktok_handle)}` +
            `&mode=${mode}` +
            `&creatorId=${creator.id}` +
            secretParam;

          try {
            const runRes = await fetch(`${BASE_URL}/api/tiktok/run`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                handle: creator.tiktok_handle,
                mode,
                firstFetch: false,
                webhookUrl: ttWebhookUrl,
              }),
            });
            const { runId, error } = await runRes.json();
            runsStarted.push({ creator: creator.name, platform: "tiktok", mode, runId, error });
          } catch (err) {
            runsStarted.push({ creator: creator.name, platform: "tiktok", mode, error: String(err) });
          }
        }

        // Instagram
        if (creator.ig_handle) {
          const igWebhookUrl =
            `${BASE_URL}/api/instagram/webhook` +
            `?igHandle=${encodeURIComponent(creator.ig_handle)}` +
            `&mode=${mode}` +
            `&creatorId=${creator.id}` +
            secretParam;

          try {
            const runRes = await fetch(`${BASE_URL}/api/instagram/run`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                igHandle: creator.ig_handle,
                mode,
                firstFetch: false,
                webhookUrl: igWebhookUrl,
              }),
            });
            const { runId, error } = await runRes.json();
            runsStarted.push({ creator: creator.name, platform: "instagram", mode, runId, error });
          } catch (err) {
            runsStarted.push({ creator: creator.name, platform: "instagram", mode, error: String(err) });
          }
        }
      }
    })
  );

  const successCount = runsStarted.filter((r) => r.runId && !r.error).length;
  const errorCount = runsStarted.filter((r) => r.error).length;

  return NextResponse.json({
    message: `Fired ${successCount} Apify runs with webhooks`,
    mode: isMonday ? "new-posts + refresh-counts" : "new-posts only",
    creators: creators.length,
    runsStarted: successCount,
    errors: errorCount,
    details: runsStarted,
  });
}
