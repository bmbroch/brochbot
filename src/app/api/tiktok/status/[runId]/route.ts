import { NextRequest, NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/tiktok-cache";

export const dynamic = "force-dynamic";

// GET /api/tiktok/status/[runId]?handle=... — checks Apify run status and updates Supabase cache
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  const { runId } = await params;
  const handle = req.nextUrl.searchParams.get("handle");

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

    // Update Supabase cache if handle is known
    if (handle) {
      const cached = await getCachedData(handle);
      if (cached?.runId === runId) {
        if (status === "SUCCEEDED") {
          await setCachedData(handle, { ...cached, status: "succeeded", datasetId: defaultDatasetId });
        } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
          await setCachedData(handle, { ...cached, status: "failed" });
        }
      }
    }

    return NextResponse.json({ status, defaultDatasetId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
