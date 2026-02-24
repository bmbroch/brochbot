import { NextRequest, NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/tiktok-cache";

export const dynamic = "force-dynamic";

// GET /api/tiktok/run?handle=... — reads cached state from Supabase
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  const cached = await getCachedData(handle);
  if (!cached) {
    return NextResponse.json({ status: "idle", data: null, lastFetched: null });
  }

  return NextResponse.json({
    status: cached.status,
    runId: cached.runId,
    datasetId: cached.datasetId,
    data: cached.data ?? null,
    lastFetched: cached.lastFetched ?? null,
  });
}

// POST /api/tiktok/run — starts a new Apify scrape (manual refresh only)
export async function POST(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  let body: { handle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { handle } = body;
  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  // If a run is already in progress, return the existing runId
  const cached = await getCachedData(handle);
  if (cached?.status === "running" && cached.runId) {
    return NextResponse.json({ runId: cached.runId, datasetId: cached.datasetId, status: "running" });
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=${APIFY_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profiles: [`https://www.tiktok.com/@${handle}`],
          resultsPerPage: 50,
          scrapeLastNDays: 90,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Apify error: ${res.status} ${text}` }, { status: 502 });
    }

    const json = await res.json();
    const runId: string = json?.data?.id;
    const datasetId: string = json?.data?.defaultDatasetId;

    await setCachedData(handle, { runId, datasetId, status: "running" });

    return NextResponse.json({ runId, datasetId, status: "running" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
