import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/instagram/run — body: { igHandle, mode: "new-posts" | "refresh-counts", firstFetch?: boolean }
export async function POST(req: NextRequest) {
  const APIFY_KEY = process.env.APIFY_API_KEY;
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  let body: { igHandle?: string; mode?: string; firstFetch?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { igHandle, mode, firstFetch } = body;
  if (!igHandle) return NextResponse.json({ error: "igHandle is required" }, { status: 400 });
  if (mode !== "new-posts" && mode !== "refresh-counts") {
    return NextResponse.json({ error: "mode must be new-posts or refresh-counts" }, { status: 400 });
  }

  const resultsLimit = firstFetch ? 100 : mode === "new-posts" ? 20 : 50;

  const postsInput = {
    directUrls: [`https://www.instagram.com/${igHandle}/`],
    resultsType: "posts",
    resultsLimit,
  };

  const profileInput = {
    directUrls: [`https://www.instagram.com/${igHandle}/`],
    resultsType: "details",
    resultsLimit: 1,
  };

  try {
    if (firstFetch) {
      // Fire posts run and profile run in parallel
      const [postsRes, profileRes] = await Promise.all([
        fetch(
          `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postsInput),
          }
        ),
        fetch(
          `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileInput),
          }
        ),
      ]);

      if (!postsRes.ok) {
        const text = await postsRes.text();
        return NextResponse.json({ error: `Apify posts run error: ${postsRes.status} ${text}` }, { status: 502 });
      }
      if (!profileRes.ok) {
        const text = await profileRes.text();
        return NextResponse.json({ error: `Apify profile run error: ${profileRes.status} ${text}` }, { status: 502 });
      }

      const postsJson = await postsRes.json();
      const profileJson = await profileRes.json();

      const runId: string = postsJson?.data?.id;
      const datasetId: string = postsJson?.data?.defaultDatasetId;
      const profileRunId: string = profileJson?.data?.id;
      const profileDatasetId: string = profileJson?.data?.defaultDatasetId;

      return NextResponse.json({ runId, datasetId, profileRunId, profileDatasetId });
    } else {
      // Non-firstFetch: posts run only
      const res = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postsInput),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: `Apify error: ${res.status} ${text}` }, { status: 502 });
      }

      const json = await res.json();
      const runId: string = json?.data?.id;
      const datasetId: string = json?.data?.defaultDatasetId;

      return NextResponse.json({ runId, datasetId });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
