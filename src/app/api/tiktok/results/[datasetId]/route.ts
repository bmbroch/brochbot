import { NextRequest, NextResponse } from "next/server";
import { tiktokCache, TikTokVideo } from "@/lib/tiktok-cache";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const { datasetId } = await params;

  try {
    const res = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}&limit=100`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Apify error: ${res.status}` }, { status: 502 });
    }

    const items: TikTokVideo[] = await res.json();

    // Store in cache for matching entry
    for (const [handle, entry] of tiktokCache.entries()) {
      if (entry.datasetId === datasetId) {
        tiktokCache.set(handle, {
          ...entry,
          status: "succeeded",
          data: items,
          lastFetched: Date.now(),
        });
        break;
      }
    }

    return NextResponse.json({ items, lastFetched: Date.now() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
