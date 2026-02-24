import { NextRequest, NextResponse } from "next/server";
import { tiktokCache } from "@/lib/tiktok-cache";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const { runId } = await params;

  try {
    const res = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_KEY}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Apify error: ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const status: string = json?.data?.status; // RUNNING | SUCCEEDED | FAILED
    const defaultDatasetId: string = json?.data?.defaultDatasetId;

    // Update any matching cache entry
    Array.from(tiktokCache.entries()).forEach(([handle, entry]) => {
      if (entry.runId === runId) {
        if (status === "SUCCEEDED") {
          tiktokCache.set(handle, { ...entry, status: "succeeded", datasetId: defaultDatasetId });
        } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
          tiktokCache.set(handle, { ...entry, status: "failed" });
        }
      }
    });

    return NextResponse.json({ status, defaultDatasetId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
