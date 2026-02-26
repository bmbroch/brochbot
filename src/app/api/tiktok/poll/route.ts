import { NextRequest, NextResponse } from "next/server";
import {
  getStoreData,
  setStoreData,
  mapApifyItem,
  mergeNewPosts,
  mergeRefreshCounts,
} from "@/lib/tiktok-store";

export const dynamic = "force-dynamic";

// NOTE: Requires Supabase Storage bucket "ugc-assets" with public read access.
// To create: Dashboard → Storage → New bucket → name: ugc-assets → Public: ON
async function persistAvatar(avatarUrl: string, handle: string): Promise<string> {
  try {
    // Fetch the image while the signed URL is still fresh
    const imgRes = await fetch(avatarUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
    });
    if (!imgRes.ok) return avatarUrl; // fallback to original if fetch fails

    const buffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const fileName = `avatars/tiktok_${handle}.${ext}`;

    // Upload to Supabase Storage bucket "ugc-assets"
    const uploadRes = await fetch(
      `${process.env.SUPABASE_CLC_URL}/storage/v1/object/ugc-assets/${fileName}`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_CLC_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_CLC_KEY}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: buffer,
      }
    );

    if (uploadRes.ok) {
      // Return the permanent public URL
      return `${process.env.SUPABASE_CLC_URL}/storage/v1/object/public/ugc-assets/${fileName}`;
    }
    return avatarUrl; // fallback
  } catch {
    return avatarUrl; // fallback
  }
}

// GET /api/tiktok/poll?runId={runId}&handle={handle}&mode={mode}
export async function GET(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const runId = req.nextUrl.searchParams.get("runId");
  const handle = req.nextUrl.searchParams.get("handle");
  const mode = req.nextUrl.searchParams.get("mode");

  if (!runId || !handle || !mode) {
    return NextResponse.json({ error: "runId, handle, and mode are required" }, { status: 400 });
  }

  try {
    // Check run status
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
      // Fetch dataset items
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}&limit=100`,
        { cache: "no-store" }
      );

      if (!itemsRes.ok) {
        return NextResponse.json({ error: `Apify dataset error: ${itemsRes.status}` }, { status: 502 });
      }

      const rawItems: Record<string, unknown>[] = await itemsRes.json();
      const mapped = rawItems.map(mapApifyItem).filter(Boolean) as NonNullable<ReturnType<typeof mapApifyItem>>[];

      // Extract authorMeta from the first item
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

      // Prefer stored authorMeta — only set on first fetch, don't overwrite on routine syncs
      if (existing?.authorMeta) {
        updated = { ...updated, authorMeta: existing.authorMeta };
      } else if (authorMeta) {
        // First fetch: persist the avatar to Supabase Storage so it never expires
        if (authorMeta.avatar) {
          const persistedAvatar = await persistAvatar(authorMeta.avatar, handle);
          authorMeta = { ...authorMeta, avatar: persistedAvatar };
        }
        updated = { ...updated, authorMeta };
      }

      await setStoreData(handle, updated);

      return NextResponse.json({ status: "DONE", videos: updated.videos, data: updated });
    }

    // Unknown status — treat as still running
    return NextResponse.json({ status: "RUNNING" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
