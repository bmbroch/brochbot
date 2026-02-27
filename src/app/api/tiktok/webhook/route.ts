import { NextRequest, NextResponse } from "next/server";
import {
  getStoreData,
  setStoreData,
  mapApifyItem,
  mergeNewPosts,
  mergeRefreshCounts,
} from "@/lib/tiktok-store";
import { persistAvatar } from "@/lib/avatar-persist";
import { writeSyncLog } from "@/lib/sync-log";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

// Apify webhook payload shape (default format)
interface ApifyWebhookPayload {
  eventType: string;
  eventData: {
    actorRunId: string;
    defaultDatasetId?: string; // NOT present in real Apify payloads — use resource instead
  };
  resource?: {
    id: string;
    defaultDatasetId: string;
  };
}

/**
 * POST /api/tiktok/webhook?handle=X&mode=Y&secret=Z[&creatorId=ID]
 *
 * Called by Apify when a TikTok scraper run succeeds.
 * Fetches dataset, merges into Supabase, updates last_synced_at.
 */
export async function POST(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  // Verify webhook secret
  const secret = req.nextUrl.searchParams.get("secret");
  const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET;
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const handle = req.nextUrl.searchParams.get("handle");
  const mode = req.nextUrl.searchParams.get("mode");
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const forceAvatarRefresh = req.nextUrl.searchParams.get("forceAvatarRefresh") === "true";

  if (!handle || !mode) {
    return NextResponse.json({ error: "handle and mode are required query params" }, { status: 400 });
  }

  let body: ApifyWebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only process SUCCEEDED events
  if (body.eventType !== "ACTOR.RUN.SUCCEEDED") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Apify puts defaultDatasetId in resource (not eventData) in real webhook calls
  const datasetId = body.resource?.defaultDatasetId || body.eventData?.defaultDatasetId;
  if (!datasetId) {
    return NextResponse.json({ error: "Missing defaultDatasetId in payload" }, { status: 400 });
  }

  try {
    // Fetch dataset items from Apify
    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}&limit=200`,
      { cache: "no-store" }
    );
    if (!itemsRes.ok) {
      return NextResponse.json({ error: `Apify dataset error: ${itemsRes.status}` }, { status: 502 });
    }

    const rawItems: Record<string, unknown>[] = await itemsRes.json();
    const mapped = rawItems.map(mapApifyItem).filter(Boolean) as NonNullable<ReturnType<typeof mapApifyItem>>[];

    // Extract authorMeta from first item
    const firstItem = rawItems[0];
    const rawAuthor = firstItem?.authorMeta as Record<string, unknown> | undefined;
    let authorMeta = rawAuthor
      ? {
          avatar: (rawAuthor.avatar as string) ?? "",
          nickName: (rawAuthor.nickName as string) ?? "",
          signature: (rawAuthor.signature as string) ?? "",
          fans: (rawAuthor.fans as number) ?? 0,
          heart: (rawAuthor.heart as number) ?? 0,
          video: (rawAuthor.video as number) ?? 0,
          verified: (rawAuthor.verified as boolean) ?? false,
          following: (rawAuthor.following as number) ?? 0,
          profileUrl: (rawAuthor.profileUrl as string) ?? "",
        }
      : undefined;

    // Merge into Supabase
    const existing = await getStoreData(handle);

    let updated;
    if (mode === "new-posts") {
      updated = mergeNewPosts(existing, mapped);
    } else {
      updated = mergeRefreshCounts(existing, mapped);
    }

    // Avatar persistence:
    // - forceAvatarRefresh=true → always re-persist (used by refresh-avatars endpoint)
    // - first fetch (no existing authorMeta) → persist
    // - routine sync → keep stored authorMeta (don't overwrite with expiring CDN URL)
    if (forceAvatarRefresh && authorMeta?.avatar) {
      const persistedAvatar = await persistAvatar(authorMeta.avatar, `tiktok_${handle}`);
      authorMeta = { ...authorMeta, avatar: persistedAvatar };
      updated = { ...updated, authorMeta };
    } else if (existing?.authorMeta) {
      updated = { ...updated, authorMeta: existing.authorMeta };
    } else if (authorMeta?.avatar) {
      const persistedAvatar = await persistAvatar(authorMeta.avatar, `tiktok_${handle}`);
      authorMeta = { ...authorMeta, avatar: persistedAvatar };
      updated = { ...updated, authorMeta };
    }

    await setStoreData(handle, updated);

    // Update last_synced_at and total_posts in ugc_creators if we have a creatorId
    if (creatorId && SUPABASE_URL && SUPABASE_KEY) {
      const totalPosts = updated.videos.length;
      await fetch(
        `${SUPABASE_URL}/rest/v1/ugc_creators?id=eq.${creatorId}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ last_synced_at: new Date().toISOString(), total_posts: totalPosts }),
        }
      );
    }

    // Log the sync event
    await writeSyncLog({
      creator_id: creatorId,
      handle,
      platform: "tiktok",
      mode: forceAvatarRefresh ? "avatar-refresh" : (mode as "new-posts" | "refresh-counts"),
      status: "succeeded",
      posts_processed: mapped.length,
      total_posts: updated.videos.length,
      run_id: body.resource?.id || body.eventData?.actorRunId,
    });

    return NextResponse.json({
      ok: true,
      handle,
      mode,
      videosProcessed: mapped.length,
      totalVideos: updated.videos.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
