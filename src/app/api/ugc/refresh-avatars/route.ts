import { NextRequest, NextResponse } from "next/server";
import { TIKTOK_CREATORS } from "@/lib/tiktok-creators";
import { persistAvatar } from "@/lib/avatar-persist";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const APIFY_KEY = process.env.APIFY_API_KEY!;

/**
 * POST /api/ugc/refresh-avatars
 *
 * For each creator:
 *   1. Runs a 1-result TikTok scrape to get fresh authorMeta (fresh signed URL)
 *   2. Persists the avatar to Supabase Storage (ugc-assets bucket)
 *   3. Updates the stored authorMeta.avatar in mc_realtime
 *
 * Cost: ~$0.01/creator = ~$0.08 total for 8 creators
 *
 * Requires: Supabase Storage bucket "ugc-assets" (Public: ON) to be created first.
 */
export async function POST(req: NextRequest) {
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  // Optional: restrict to specific handles
  let handles: string[] | null = null;
  try {
    const body = await req.json();
    if (Array.isArray(body.handles)) handles = body.handles;
  } catch {
    // no body = refresh all
  }

  const creators = handles
    ? TIKTOK_CREATORS.filter((c) => handles!.includes(c.handle))
    : TIKTOK_CREATORS;

  const results: Array<{ handle: string; success: boolean; avatarUrl?: string; error?: string }> = [];

  for (const creator of creators) {
    try {
      // 1. Start a 1-result scrape to get fresh authorMeta
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=${APIFY_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profiles: [`https://www.tiktok.com/@${creator.handle}`],
            resultsPerPage: 1,
          }),
        }
      );

      if (!runRes.ok) {
        results.push({ handle: creator.handle, success: false, error: `Apify start failed: ${runRes.status}` });
        continue;
      }

      const runJson = await runRes.json();
      const runId: string = runJson?.data?.id;
      const datasetId: string = runJson?.data?.defaultDatasetId;

      if (!runId) {
        results.push({ handle: creator.handle, success: false, error: "No runId returned" });
        continue;
      }

      // 2. Poll until complete (max 60s)
      let status = "RUNNING";
      let attempts = 0;
      let finalDatasetId = datasetId;

      while ((status === "RUNNING" || status === "READY") && attempts < 20) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_KEY}`,
          { cache: "no-store" }
        );
        const statusJson = await statusRes.json();
        status = statusJson?.data?.status;
        finalDatasetId = statusJson?.data?.defaultDatasetId ?? finalDatasetId;
        attempts++;
      }

      if (status !== "SUCCEEDED") {
        results.push({ handle: creator.handle, success: false, error: `Run ended with status: ${status}` });
        continue;
      }

      // 3. Fetch the result to get authorMeta
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${finalDatasetId}/items?token=${APIFY_KEY}&limit=1`,
        { cache: "no-store" }
      );
      const items: Record<string, unknown>[] = await itemsRes.json();

      const rawAuthor = items[0]?.authorMeta as Record<string, unknown> | undefined;
      const freshAvatarUrl = rawAuthor?.avatar as string | undefined;

      if (!freshAvatarUrl) {
        results.push({ handle: creator.handle, success: false, error: "No avatar in authorMeta" });
        continue;
      }

      // 4. Persist to Supabase Storage
      const persistedUrl = await persistAvatar(freshAvatarUrl, `tiktok_${creator.handle}`);

      // 5. Update stored authorMeta in mc_realtime
      const storeKey = `tiktok_videos_${creator.handle}`;
      const existingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.${encodeURIComponent(storeKey)}&select=data`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: "no-store" }
      );
      const existingRows = await existingRes.json();
      const existingData = existingRows?.[0]?.data;

      if (existingData) {
        const updatedData = {
          ...existingData,
          authorMeta: {
            ...(existingData.authorMeta ?? {}),
            ...(rawAuthor
              ? {
                  nickName: rawAuthor.nickName ?? existingData.authorMeta?.nickName ?? "",
                  signature: rawAuthor.signature ?? existingData.authorMeta?.signature ?? "",
                  fans: rawAuthor.fans ?? existingData.authorMeta?.fans ?? 0,
                  heart: rawAuthor.heart ?? existingData.authorMeta?.heart ?? 0,
                  video: rawAuthor.video ?? existingData.authorMeta?.video ?? 0,
                  verified: rawAuthor.verified ?? existingData.authorMeta?.verified ?? false,
                  following: rawAuthor.following ?? existingData.authorMeta?.following ?? 0,
                }
              : {}),
            avatar: persistedUrl, // always overwrite with fresh persisted URL
          },
        };

        await fetch(`${SUPABASE_URL}/rest/v1/mc_realtime`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            key: storeKey,
            data: updatedData,
            updated_at: new Date().toISOString(),
          }),
        });
      }

      results.push({
        handle: creator.handle,
        success: true,
        avatarUrl: persistedUrl,
      });

      // Small delay between creators to avoid rate limits
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      results.push({ handle: creator.handle, success: false, error: String(err) });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  return NextResponse.json({
    message: `Refreshed ${succeeded}/${results.length} avatars`,
    results,
  });
}
