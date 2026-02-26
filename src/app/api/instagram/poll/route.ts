import { NextRequest, NextResponse } from "next/server";
import {
  getInstagramStoreData,
  setInstagramStoreData,
  mapApifyItem,
  mergeNewPosts,
  mergeRefreshCounts,
  IgAuthorMeta,
} from "@/lib/instagram-store";
import { persistAvatar } from "@/lib/avatar-persist";

export const dynamic = "force-dynamic";

// GET /api/instagram/poll?runId={runId}&igHandle={igHandle}&mode={mode}[&profileRunId={...}&profileDatasetId={...}]
export async function GET(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const runId = req.nextUrl.searchParams.get("runId");
  const igHandle = req.nextUrl.searchParams.get("igHandle");
  const mode = req.nextUrl.searchParams.get("mode");
  const profileRunId = req.nextUrl.searchParams.get("profileRunId");
  const profileDatasetId = req.nextUrl.searchParams.get("profileDatasetId");

  if (!runId || !igHandle || !mode) {
    return NextResponse.json({ error: "runId, igHandle, and mode are required" }, { status: 400 });
  }

  try {
    // Check posts run status
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_KEY}`,
      { cache: "no-store" }
    );

    if (!statusRes.ok) {
      return NextResponse.json({ error: `Apify error: ${statusRes.status}` }, { status: 502 });
    }

    const statusJson = await statusRes.json();
    const status: string = statusJson?.data?.status;
    const datasetId: string = statusJson?.data?.defaultDatasetId;

    if (status === "RUNNING" || status === "READY") {
      return NextResponse.json({ status: "RUNNING" });
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      return NextResponse.json({ status: "FAILED" });
    }

    if (status === "SUCCEEDED") {
      // Fetch posts dataset items
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}&limit=200`,
        { cache: "no-store" }
      );

      if (!itemsRes.ok) {
        return NextResponse.json({ error: `Apify dataset error: ${itemsRes.status}` }, { status: 502 });
      }

      const rawItems: Record<string, unknown>[] = await itemsRes.json();
      const mapped = rawItems
        .map(mapApifyItem)
        .filter(Boolean) as NonNullable<ReturnType<typeof mapApifyItem>>[];

      // Resolve profile meta if profileRunId is provided
      let igAuthorMeta: IgAuthorMeta | undefined;

      if (profileRunId) {
        try {
          // Poll profile run status
          const profileStatusRes = await fetch(
            `https://api.apify.com/v2/actor-runs/${profileRunId}?token=${APIFY_KEY}`,
            { cache: "no-store" }
          );

          if (profileStatusRes.ok) {
            const profileStatusJson = await profileStatusRes.json();
            const profileStatus: string = profileStatusJson?.data?.status;
            const resolvedProfileDatasetId: string =
              profileDatasetId ?? profileStatusJson?.data?.defaultDatasetId;

            if (profileStatus === "SUCCEEDED" && resolvedProfileDatasetId) {
              const profileItemsRes = await fetch(
                `https://api.apify.com/v2/datasets/${resolvedProfileDatasetId}/items?token=${APIFY_KEY}&limit=1`,
                { cache: "no-store" }
              );

              if (profileItemsRes.ok) {
                const profileItems: Record<string, unknown>[] = await profileItemsRes.json();
                if (profileItems.length > 0) {
                  const profileItem = profileItems[0];
                  igAuthorMeta = {
                    avatar: (profileItem.profilePicUrl as string) ?? "",
                    fullName: (profileItem.fullName as string) ?? "",
                    username: (profileItem.username as string) ?? "",
                    biography: (profileItem.biography as string) ?? "",
                    followersCount: (profileItem.followersCount as number) ?? 0,
                    followsCount: (profileItem.followsCount as number) ?? 0,
                    postsCount: (profileItem.postsCount as number) ?? 0,
                    verified: (profileItem.verified as boolean) ?? false,
                  };
                }
              }
            }
          }
        } catch {
          // profile meta is best-effort; don't fail the whole poll
        }
      }

      // Merge into Supabase
      const existing = await getInstagramStoreData(igHandle);

      // On first fetch (no existing meta), persist the avatar to Supabase Storage
      if (!existing?.igAuthorMeta && igAuthorMeta?.avatar) {
        const persistedAvatar = await persistAvatar(igAuthorMeta.avatar, `instagram_${igHandle}`);
        igAuthorMeta = { ...igAuthorMeta, avatar: persistedAvatar };
      }

      let updated;
      if (mode === "new-posts") {
        updated = mergeNewPosts(existing, mapped, igAuthorMeta);
      } else {
        updated = mergeRefreshCounts(existing, mapped, igAuthorMeta);
      }

      await setInstagramStoreData(igHandle, updated);

      return NextResponse.json({ status: "DONE", posts: updated.posts, data: updated });
    }

    // Unknown status — treat as still running
    return NextResponse.json({ status: "RUNNING" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
