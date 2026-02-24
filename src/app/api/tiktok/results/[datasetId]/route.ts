import { NextRequest, NextResponse } from "next/server";
import { getCachedData, setCachedData, TikTokVideo } from "@/lib/tiktok-cache";

export const dynamic = "force-dynamic";

// GET /api/tiktok/results/[datasetId]?handle=... — fetches dataset items and persists to Supabase cache
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const { datasetId } = await params;
  const handle = req.nextUrl.searchParams.get("handle");

  try {
    const res = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}&limit=100`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Apify error: ${res.status}` }, { status: 502 });
    }

    const items: TikTokVideo[] = await res.json();
    const lastFetched = Date.now();

    // Persist to Supabase cache if handle is known
    if (handle) {
      const existing = await getCachedData(handle);
      await setCachedData(handle, {
        ...(existing ?? {}),
        datasetId,
        status: "succeeded",
        data: items,
        lastFetched,
      });
    }

    return NextResponse.json({ items, lastFetched });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
