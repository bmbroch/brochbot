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

  const { handle, mode, firstFetch, webhookUrl, smartDays, postUrls } = body as {
    handle?: string;
    mode?: string;
    firstFetch?: boolean;
    webhookUrl?: string; // if provided, Apify will POST to this URL on completion
    smartDays?: number;
    postUrls?: string[];
  };
  if (!handle) return NextResponse.json({ error: "handle is required" }, { status: 400 });
  if (mode !== "new-posts" && mode !== "refresh-counts") {
    return NextResponse.json({ error: "mode must be new-posts or refresh-counts" }, { status: 400 });
  }

  const isNewPosts = mode === "new-posts";

  // Build apifyInput based on mode:
  // - refresh-counts + postUrls: URL-based (cheaper, no profile crawl)
  // - everything else: profile-based
  const apifyInput: Record<string, unknown> = {};

  if (mode === "refresh-counts" && postUrls && postUrls.length > 0) {
    // URL-based: pass specific post URLs directly (cheaper, no profile crawl)
    apifyInput.postURLs = postUrls.slice(0, 100); // cap at 100 URLs per run
  } else {
    // Profile-based fallback
    apifyInput.profiles = [`https://www.tiktok.com/@${handle}`];
    apifyInput.resultsPerPage = firstFetch ? 100 : isNewPosts ? 30 : 50;
    if (!firstFetch) {
      apifyInput.scrapeLastNDays = isNewPosts ? (smartDays ?? 30) : 60;
    }
  }

  try {
    // Start the Apify run (no inline webhooks — registered separately below)
    const res = await fetch(
      `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/runs?token=${APIFY_KEY}&memory=512`,
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

    // Register webhook via Apify Webhooks API (correct endpoint: POST /v2/webhooks with condition filter)
    if (webhookUrl && runId) {
      await fetch(
        `https://api.apify.com/v2/webhooks?token=${APIFY_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED"],
            condition: { actorRunId: runId },
            requestUrl: webhookUrl,
            isAdHoc: true,
          }),
        }
      ).catch(() => {}); // best-effort — sync-check cron is backstop
    }

    return NextResponse.json({ runId, datasetId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
