import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/tiktok/run — body: { handle, mode: "new-posts" | "refresh-counts" }
export async function POST(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  let body: { handle?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { handle, mode, firstFetch, webhookUrl } = body as {
    handle?: string;
    mode?: string;
    firstFetch?: boolean;
    webhookUrl?: string; // if provided, Apify will POST to this URL on completion
  };
  if (!handle) return NextResponse.json({ error: "handle is required" }, { status: 400 });
  if (mode !== "new-posts" && mode !== "refresh-counts") {
    return NextResponse.json({ error: "mode must be new-posts or refresh-counts" }, { status: 400 });
  }

  const isNewPosts = mode === "new-posts";

  // First fetch: grab full history (no day limit, max results)
  // New posts: last 7 days only (cheap, incremental)
  // Refresh counts: last 60 days to update view numbers
  const apifyInput: Record<string, unknown> = {
    profiles: [`https://www.tiktok.com/@${handle}`],
    resultsPerPage: firstFetch ? 100 : isNewPosts ? 20 : 50,
  };
  if (!firstFetch) {
    apifyInput.scrapeLastNDays = isNewPosts ? 7 : 60;
  }

  try {
    // Start the Apify run (no inline webhooks — registered separately below)
    const res = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=${APIFY_KEY}&memory=512`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apifyInput),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Apify error: ${res.status} ${text}` }, { status: 502 });
    }

    const json = await res.json();
    const runId: string = json?.data?.id;
    const datasetId: string = json?.data?.defaultDatasetId;

    // Register webhook via Apify Webhooks API (more reliable than inline input webhooks)
    if (webhookUrl && runId) {
      await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/webhooks?token=${APIFY_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED"],
            requestUrl: webhookUrl,
          }),
        }
      ).catch(() => {}); // best-effort — sync-check cron is backstop
    }

    return NextResponse.json({ runId, datasetId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
