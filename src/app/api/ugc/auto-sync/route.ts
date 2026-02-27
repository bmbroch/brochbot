import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";
const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || "";

async function getStoredPostUrls(tiktokHandle: string | null, igHandle: string | null): Promise<{ ttUrls: string[]; igUrls: string[] }> {
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
  const ttUrls: string[] = [];
  const igUrls: string[] = [];

  if (tiktokHandle) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.tiktok_videos_${encodeURIComponent(tiktokHandle)}&select=data`, { headers });
    if (res.ok) {
      const rows = await res.json();
      const videos = rows?.[0]?.data?.videos ?? [];
      // Sort newest first, take top 100
      const sorted = [...videos].sort((a, b) =>
        new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime()
      );
      ttUrls.push(...sorted.slice(0, 100).map((v: { url: string }) => v.url).filter(Boolean));
    }
  }

  if (igHandle) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.instagram_posts_${encodeURIComponent(igHandle)}&select=data`, { headers });
    if (res.ok) {
      const rows = await res.json();
      const posts = rows?.[0]?.data?.posts ?? [];
      // Sort newest first, take top 100
      const sorted = [...posts].sort((a, b) =>
        new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime()
      );
      igUrls.push(...sorted.slice(0, 100).map((p: { url: string }) => p.url).filter(Boolean));
    }
  }

  return { ttUrls, igUrls };
}

/**
 * GET /api/ugc/auto-sync
 *
 * Vercel Cron: "0 * * * *" (every hour UTC)
 *
 * Flow:
 *   1. Determine current UTC hour
 *   2. Fetch active creators whose sync_hour matches the current hour
 *   3. For each creator, fire TWO runs per platform with webhook URLs:
 *      - new-posts: catches new content since last sync (smart window, mergeNewPosts)
 *      - refresh-counts: updates views/likes/comments on ALL stored posts via direct URLs
 *   4. Return immediately — Apify will POST to our webhooks when each run completes
 *   5. Webhooks (/api/tiktok/webhook, /api/instagram/webhook) handle saving data
 *      and updating last_synced_at in ugc_creators
 *
 * Staggering: each creator (or org) has a sync_hour (0–23 UTC).
 * This allows multiple customers' creators to be spread across hours
 * so we never hammer Apify with hundreds of concurrent runs at once.
 */
function daysSinceSync(lastSyncedAt: string | null): number {
  if (!lastSyncedAt) return 30; // never synced — use full window
  const hours = (Date.now() - new Date(lastSyncedAt).getTime()) / 3600000;
  const days = Math.ceil(hours / 24);
  return Math.min(30, Math.max(1, days)); // clamp 1–30
}

export async function GET(req: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentHour = now.getUTCHours();

  // 1. Fetch active creators scheduled for this hour
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?status=eq.active&sync_hour=eq.${currentHour}&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const creators = await creatorsRes.json();

  if (!Array.isArray(creators) || creators.length === 0) {
    return NextResponse.json({ message: `No active creators scheduled for hour ${currentHour} UTC`, synced: 0 });
  }

  const secretParam = WEBHOOK_SECRET ? `&secret=${encodeURIComponent(WEBHOOK_SECRET)}` : "";
  const runsStarted: Array<{ creator: string; platform: string; mode: string; runId?: string; error?: string }> = [];

  // 2. Fire all runs with webhooks — parallel per creator
  await Promise.all(
    creators.map(async (creator: { id: string; name: string; tiktok_handle?: string; ig_handle?: string; last_synced_at?: string | null }) => {
      const smartDays = daysSinceSync(creator.last_synced_at ?? null);

      // ── Run 1: new-posts — catch new content since last sync ──

      // TikTok new-posts
      if (creator.tiktok_handle) {
        const ttWebhookUrl =
          `${BASE_URL}/api/tiktok/webhook` +
          `?handle=${encodeURIComponent(creator.tiktok_handle)}` +
          `&mode=new-posts` +
          `&creatorId=${creator.id}` +
          secretParam;

        try {
          const runRes = await fetch(`${BASE_URL}/api/tiktok/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: creator.tiktok_handle,
              mode: "new-posts",
              firstFetch: false,
              smartDays,
              webhookUrl: ttWebhookUrl,
            }),
          });
          const { runId, error } = await runRes.json();
          runsStarted.push({ creator: creator.name, platform: "tiktok", mode: "new-posts", runId, error });
        } catch (err) {
          runsStarted.push({ creator: creator.name, platform: "tiktok", mode: "new-posts", error: String(err) });
        }
      }

      // Instagram new-posts
      if (creator.ig_handle) {
        const igWebhookUrl =
          `${BASE_URL}/api/instagram/webhook` +
          `?igHandle=${encodeURIComponent(creator.ig_handle)}` +
          `&mode=new-posts` +
          `&creatorId=${creator.id}` +
          secretParam;

        try {
          const runRes = await fetch(`${BASE_URL}/api/instagram/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              igHandle: creator.ig_handle,
              mode: "new-posts",
              firstFetch: false,
              smartDays,
              webhookUrl: igWebhookUrl,
            }),
          });
          const { runId, error } = await runRes.json();
          runsStarted.push({ creator: creator.name, platform: "instagram", mode: "new-posts", runId, error });
        } catch (err) {
          runsStarted.push({ creator: creator.name, platform: "instagram", mode: "new-posts", error: String(err) });
        }
      }

      // ── Run 2: refresh-counts — update metrics on ALL stored posts via direct URLs ──
      const { ttUrls, igUrls } = await getStoredPostUrls(creator.tiktok_handle ?? null, creator.ig_handle ?? null);

      // TikTok refresh-counts (URL-based — postURLs hits specific posts directly)
      if (creator.tiktok_handle && ttUrls.length > 0) {
        const ttRefreshWebhook =
          `${BASE_URL}/api/tiktok/webhook` +
          `?handle=${encodeURIComponent(creator.tiktok_handle)}` +
          `&mode=refresh-counts` +
          `&creatorId=${creator.id}` +
          secretParam;
        fetch(`${BASE_URL}/api/tiktok/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: creator.tiktok_handle, mode: "refresh-counts", postUrls: ttUrls, webhookUrl: ttRefreshWebhook }),
        }).catch(() => {});
      }

      // Instagram refresh-counts (URL-based — directUrls hits specific post URLs directly)
      if (creator.ig_handle && igUrls.length > 0) {
        const igRefreshWebhook =
          `${BASE_URL}/api/instagram/webhook` +
          `?igHandle=${encodeURIComponent(creator.ig_handle)}` +
          `&mode=refresh-counts` +
          `&creatorId=${creator.id}` +
          secretParam;
        fetch(`${BASE_URL}/api/instagram/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ igHandle: creator.ig_handle, mode: "refresh-counts", postUrls: igUrls, webhookUrl: igRefreshWebhook }),
        }).catch(() => {});
      }
    })
  );

  const successCount = runsStarted.filter((r) => r.runId && !r.error).length;
  const errorCount = runsStarted.filter((r) => r.error).length;

  return NextResponse.json({
    message: `Fired ${successCount} Apify runs with webhooks`,
    hour: currentHour,
    creators: creators.length,
    runsStarted: successCount,
    errors: errorCount,
    details: runsStarted,
  });
}
