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

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

interface ApifyWebhookPayload {
  eventType: string;
  eventData: {
    actorRunId: string;
    defaultDatasetId: string;
  };
}

/**
 * POST /api/instagram/webhook?igHandle=X&mode=Y&secret=Z[&creatorId=ID]
 *
 * Called by Apify when an Instagram scraper run succeeds.
 * Fetches dataset, merges into Supabase, updates last_synced_at.
 */
export async function POST(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  // Verify webhook secret
  const secret = req.nextUrl.searchParams.get("secret");
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const igHandle = req.nextUrl.searchParams.get("igHandle");
  const mode = req.nextUrl.searchParams.get("mode");
  const creatorId = req.nextUrl.searchParams.get("creatorId");

  if (!igHandle || !mode) {
    return NextResponse.json({ error: "igHandle and mode are required query params" }, { status: 400 });
  }

  let body: ApifyWebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.eventType !== "ACTOR.RUN.SUCCEEDED") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const datasetId = body.eventData?.defaultDatasetId;
  if (!datasetId) {
    return NextResponse.json({ error: "Missing defaultDatasetId in payload" }, { status: 400 });
  }

  try {
    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}&limit=200`,
      { cache: "no-store" }
    );
    if (!itemsRes.ok) {
      return NextResponse.json({ error: `Apify dataset error: ${itemsRes.status}` }, { status: 502 });
    }

    const rawItems: Record<string, unknown>[] = await itemsRes.json();

    // Detect if this is a profile-details run (resultsType: "details")
    const isProfileRun =
      rawItems.length > 0 && rawItems[0] && "followersCount" in rawItems[0] && !("shortCode" in rawItems[0]);

    if (isProfileRun) {
      // Profile-only run — just update igAuthorMeta
      const profileItem = rawItems[0];
      let igAuthorMeta: IgAuthorMeta = {
        avatar: (profileItem.profilePicUrl as string) ?? "",
        fullName: (profileItem.fullName as string) ?? "",
        username: (profileItem.username as string) ?? "",
        biography: (profileItem.biography as string) ?? "",
        followersCount: (profileItem.followersCount as number) ?? 0,
        followsCount: (profileItem.followsCount as number) ?? 0,
        postsCount: (profileItem.postsCount as number) ?? 0,
        verified: (profileItem.verified as boolean) ?? false,
      };

      const existing = await getInstagramStoreData(igHandle);
      if (!existing?.igAuthorMeta && igAuthorMeta.avatar) {
        const persistedAvatar = await persistAvatar(igAuthorMeta.avatar, `instagram_${igHandle}`);
        igAuthorMeta = { ...igAuthorMeta, avatar: persistedAvatar };
      }

      if (existing) {
        await setInstagramStoreData(igHandle, { ...existing, igAuthorMeta: existing.igAuthorMeta ?? igAuthorMeta });
      }

      return NextResponse.json({ ok: true, igHandle, type: "profile", followersCount: igAuthorMeta.followersCount });
    }

    // Posts run
    const mapped = rawItems
      .map(mapApifyItem)
      .filter(Boolean) as NonNullable<ReturnType<typeof mapApifyItem>>[];

    const existing = await getInstagramStoreData(igHandle);

    let updated;
    if (mode === "new-posts") {
      updated = mergeNewPosts(existing, mapped);
    } else {
      updated = mergeRefreshCounts(existing, mapped);
    }

    await setInstagramStoreData(igHandle, updated);

    // Update last_synced_at in ugc_creators if we have a creatorId
    if (creatorId && SUPABASE_URL && SUPABASE_KEY) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/ugc_creators?id=eq.${creatorId}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ last_synced_at: new Date().toISOString() }),
        }
      );
    }

    return NextResponse.json({
      ok: true,
      igHandle,
      mode,
      postsProcessed: mapped.length,
      totalPosts: updated.posts.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
