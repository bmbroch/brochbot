import { NextRequest, NextResponse } from "next/server";
import { TIKTOK_CREATORS } from "@/lib/tiktok-creators";

export const dynamic = "force-dynamic";

const APIFY_KEY = process.env.APIFY_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";
const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || "";

/**
 * POST /api/ugc/refresh-avatars
 *
 * Fires a 1-result TikTok scrape per creator with a webhook registered.
 * Returns immediately — safe to close the page right away.
 * When each Apify run finishes, /api/tiktok/webhook handles:
 *   - downloading the fresh avatar
 *   - persisting to Supabase Storage (permanent URL, never expires)
 *   - updating the stored authorMeta
 *
 * Optional body: { handles: ["sell.with.nick", ...] } to refresh specific creators only.
 */
export async function POST(req: NextRequest) {
  if (!APIFY_KEY) {
    return NextResponse.json({ error: "APIFY_API_KEY not configured" }, { status: 500 });
  }

  let handles: string[] | null = null;
  try {
    const body = await req.json();
    if (Array.isArray(body.handles)) handles = body.handles;
  } catch {
    // no body = refresh all
  }

  // Only process creators with a TikTok handle
  const allCreators = handles
    ? TIKTOK_CREATORS.filter((c) => c.handle && handles!.includes(c.handle))
    : TIKTOK_CREATORS;
  const creators = allCreators.filter((c): c is typeof c & { handle: string } => c.handle !== null);

  const secretParam = WEBHOOK_SECRET ? `&secret=${encodeURIComponent(WEBHOOK_SECRET)}` : "";
  const fired: Array<{ handle: string; runId?: string; error?: string }> = [];

  for (const creator of creators) {
    const handle = creator.handle;

    // Webhook URL — forceAvatarRefresh=true so the handler always re-persists the avatar
    const webhookUrl =
      `${BASE_URL}/api/tiktok/webhook` +
      `?handle=${encodeURIComponent(handle)}` +
      `&mode=new-posts` +
      `&forceAvatarRefresh=true` +
      secretParam;

    try {
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=${APIFY_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profiles: [`https://www.tiktok.com/@${handle}`],
            resultsPerPage: 1,
            webhooks: [{ eventTypes: ["ACTOR.RUN.SUCCEEDED"], requestUrl: webhookUrl }],
          }),
        }
      );

      if (!runRes.ok) {
        fired.push({ handle, error: `Apify start failed: ${runRes.status}` });
        continue;
      }

      const runJson = await runRes.json();
      fired.push({ handle, runId: runJson?.data?.id });
    } catch (err) {
      fired.push({ handle, error: String(err) });
    }
  }

  const started = fired.filter((r) => r.runId).length;

  return NextResponse.json({
    message: `Started ${started}/${creators.length} avatar refresh runs — photos will update automatically in 1–2 min`,
    runs: fired,
  });
}
