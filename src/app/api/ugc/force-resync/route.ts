import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";
const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || "";

/**
 * POST /api/ugc/force-resync
 *
 * Body: { creatorId: string, tiktokHandle?: string, igHandle?: string }
 *
 * Fires a first-fetch re-scrape for a creator on demand (Type 4 re-sync).
 * Same as the initial activation flow but without changing creator status.
 * Webhook URLs are built server-side so APIFY_WEBHOOK_SECRET never touches
 * the frontend.
 */
export async function POST(req: NextRequest) {
  let body: { creatorId?: string; tiktokHandle?: string; igHandle?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { creatorId, tiktokHandle, igHandle } = body;

  if (!creatorId) {
    return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
  }

  if (!tiktokHandle && !igHandle) {
    return NextResponse.json({ error: "At least one of tiktokHandle or igHandle is required" }, { status: 400 });
  }

  const secretParam = WEBHOOK_SECRET ? `&secret=${encodeURIComponent(WEBHOOK_SECRET)}` : "";
  const runsStarted: Array<{ platform: string; runId?: string; error?: string }> = [];

  // ── TikTok first-fetch ──────────────────────────────────────────────────────
  if (tiktokHandle) {
    const webhookUrl =
      `${BASE_URL}/api/tiktok/webhook` +
      `?handle=${encodeURIComponent(tiktokHandle)}` +
      `&mode=new-posts` +
      `&creatorId=${creatorId}` +
      secretParam;

    try {
      const runRes = await fetch(`${BASE_URL}/api/tiktok/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: tiktokHandle,
          mode: "new-posts",
          firstFetch: true,
          webhookUrl,
        }),
      });
      const { runId, error } = await runRes.json();
      runsStarted.push({ platform: "tiktok", runId, error });
    } catch (err) {
      runsStarted.push({ platform: "tiktok", error: String(err) });
    }
  }

  // ── Instagram first-fetch ───────────────────────────────────────────────────
  if (igHandle) {
    const webhookUrl =
      `${BASE_URL}/api/instagram/webhook` +
      `?igHandle=${encodeURIComponent(igHandle)}` +
      `&mode=new-posts` +
      `&creatorId=${creatorId}` +
      secretParam;

    try {
      const runRes = await fetch(`${BASE_URL}/api/instagram/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          igHandle,
          mode: "new-posts",
          firstFetch: true,
          webhookUrl,
        }),
      });
      const { runId, error } = await runRes.json();
      runsStarted.push({ platform: "instagram", runId, error });
    } catch (err) {
      runsStarted.push({ platform: "instagram", error: String(err) });
    }
  }

  const successCount = runsStarted.filter((r) => r.runId && !r.error).length;
  const errorCount = runsStarted.filter((r) => r.error).length;

  if (successCount === 0 && errorCount > 0) {
    return NextResponse.json(
      { error: "Failed to start re-sync runs", details: runsStarted },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Re-sync started — ${successCount} run(s) fired`,
    runsStarted: successCount,
    errors: errorCount,
    details: runsStarted,
  });
}
