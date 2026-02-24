import { NextRequest, NextResponse } from "next/server";
import {
  getStoreData,
  setStoreData,
  mapApifyItem,
  mergeNewPosts,
  mergeRefreshCounts,
} from "@/lib/tiktok-store";

export const dynamic = "force-dynamic";

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

      // Merge into Supabase
      const existing = await getStoreData(handle);

      let updated;
      if (mode === "new-posts") {
        updated = mergeNewPosts(existing, mapped);
      } else {
        updated = mergeRefreshCounts(existing, mapped);
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
