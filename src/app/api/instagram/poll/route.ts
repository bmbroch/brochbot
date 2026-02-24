import { NextRequest, NextResponse } from "next/server";
import {
  getInstagramStoreData,
  setInstagramStoreData,
  mapApifyItem,
  mergeNewPosts,
  mergeRefreshCounts,
} from "@/lib/instagram-store";

export const dynamic = "force-dynamic";

// GET /api/instagram/poll?runId={runId}&igHandle={igHandle}&mode={mode}
export async function GET(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const runId = req.nextUrl.searchParams.get("runId");
  const igHandle = req.nextUrl.searchParams.get("igHandle");
  const mode = req.nextUrl.searchParams.get("mode");

  if (!runId || !igHandle || !mode) {
    return NextResponse.json({ error: "runId, igHandle, and mode are required" }, { status: 400 });
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

      // Merge into Supabase
      const existing = await getInstagramStoreData(igHandle);

      let updated;
      if (mode === "new-posts") {
        updated = mergeNewPosts(existing, mapped);
      } else {
        updated = mergeRefreshCounts(existing, mapped);
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
