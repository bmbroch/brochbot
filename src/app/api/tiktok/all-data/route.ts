import { NextResponse } from "next/server";
import { TikTokStoreData } from "@/lib/tiktok-store";
import { InstagramStoreData } from "@/lib/instagram-store";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

export interface AllCreatorData {
  tiktok: Record<string, TikTokStoreData>;   // handle → store data
  instagram: Record<string, InstagramStoreData>; // igHandle → store data
}

// GET /api/tiktok/all-data — bulk fetch all TikTok + Instagram creator data in two Supabase queries
// Optional ?org_id= to scope to a specific org's creators
export async function GET(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ tiktok: {}, instagram: {} });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id");

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };

  try {
    if (orgId) {
      // Fetch org's creator handles from Supabase
      const creatorsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/ugc_creators?org_id=eq.${orgId}&select=tiktok_handle,ig_handle`,
        { headers, cache: "no-store" }
      );
      const creators: Array<{ tiktok_handle: string | null; ig_handle: string | null }> =
        creatorsRes.ok ? await creatorsRes.json() : [];

      const ttHandles = creators
        .map((c) => c.tiktok_handle)
        .filter((h): h is string => !!h);
      const igHandles = creators
        .map((c) => c.ig_handle)
        .filter((h): h is string => !!h);

      if (ttHandles.length === 0 && igHandles.length === 0) {
        return NextResponse.json({ tiktok: {}, instagram: {} });
      }

      const ttKeys = ttHandles.map((h) => `tiktok_videos_${h}`).join(",");
      const igKeys = igHandles.map((h) => `instagram_posts_${h}`).join(",");

      const [ttRes, igRes] = await Promise.all([
        ttHandles.length > 0
          ? fetch(
              `${SUPABASE_URL}/rest/v1/mc_realtime?key=in.(${ttKeys})&select=key,data`,
              { headers, cache: "no-store" }
            )
          : Promise.resolve(null),
        igHandles.length > 0
          ? fetch(
              `${SUPABASE_URL}/rest/v1/mc_realtime?key=in.(${igKeys})&select=key,data`,
              { headers, cache: "no-store" }
            )
          : Promise.resolve(null),
      ]);

      const [ttRows, igRows]: [
        Array<{ key: string; data: TikTokStoreData }>,
        Array<{ key: string; data: InstagramStoreData }>
      ] = await Promise.all([
        ttRes && ttRes.ok ? ttRes.json() : Promise.resolve([]),
        igRes && igRes.ok ? igRes.json() : Promise.resolve([]),
      ]);

      const tiktok: Record<string, TikTokStoreData> = {};
      for (const row of ttRows) {
        const handle = row.key.replace(/^tiktok_videos_/, "");
        tiktok[handle] = row.data;
      }

      const instagram: Record<string, InstagramStoreData> = {};
      for (const row of igRows) {
        const igHandle = row.key.replace(/^instagram_posts_/, "");
        instagram[igHandle] = row.data;
      }

      return NextResponse.json({ tiktok, instagram });
    }

    // No org_id — fall back to fetching all (backward compat)
    const [ttRes, igRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/mc_realtime?key=like.tiktok_videos_%25&select=key,data`,
        { headers, cache: "no-store" }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/mc_realtime?key=like.instagram_posts_%25&select=key,data`,
        { headers, cache: "no-store" }
      ),
    ]);

    const [ttRows, igRows]: [
      Array<{ key: string; data: TikTokStoreData }>,
      Array<{ key: string; data: InstagramStoreData }>
    ] = await Promise.all([
      ttRes.ok ? ttRes.json() : Promise.resolve([]),
      igRes.ok ? igRes.json() : Promise.resolve([]),
    ]);

    // Convert rows to handle-keyed maps
    // key format: "tiktok_videos_<handle>" → handle = key.slice("tiktok_videos_".length)
    const tiktok: Record<string, TikTokStoreData> = {};
    for (const row of ttRows) {
      const handle = row.key.replace(/^tiktok_videos_/, "");
      tiktok[handle] = row.data;
    }

    const instagram: Record<string, InstagramStoreData> = {};
    for (const row of igRows) {
      const igHandle = row.key.replace(/^instagram_posts_/, "");
      instagram[igHandle] = row.data;
    }

    return NextResponse.json({ tiktok, instagram });
  } catch (err) {
    console.error("all-data fetch failed:", err);
    return NextResponse.json({ tiktok: {}, instagram: {} });
  }
}
