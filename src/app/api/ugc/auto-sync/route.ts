import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://brochbot.com";

export async function GET(req: NextRequest) {
  // Verify this is a Vercel Cron call (optional auth header in production)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon... 6=Sat
  const isWeeklyRefreshDay = dayOfWeek === 1; // Monday = Refresh Counts day

  // 1. Fetch all active creators from ugc_creators table
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?status=eq.active&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const creators = await creatorsRes.json();

  if (!Array.isArray(creators) || creators.length === 0) {
    return NextResponse.json({ message: "No active creators", synced: 0 });
  }

  const results = [];

  for (const creator of creators) {
    try {
      // Always run New Posts (daily — cheap, catches new content)
      if (creator.tiktok_handle) {
        const runRes = await fetch(`${BASE_URL}/api/tiktok/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: creator.tiktok_handle,
            mode: "new-posts",
            firstFetch: false,
          }),
        });
        const { runId } = await runRes.json();
        results.push({ creator: creator.name, platform: "tiktok", mode: "new-posts", runId });
      }

      // On Mondays, also run Refresh Counts (weekly — updates view counts)
      if (isWeeklyRefreshDay && creator.tiktok_handle) {
        const runRes = await fetch(`${BASE_URL}/api/tiktok/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: creator.tiktok_handle,
            mode: "refresh-counts",
            firstFetch: false,
          }),
        });
        const { runId } = await runRes.json();
        results.push({ creator: creator.name, platform: "tiktok", mode: "refresh-counts", runId });
      }

      // Update last_synced_at in ugc_creators
      await fetch(
        `${SUPABASE_URL}/rest/v1/ugc_creators?id=eq.${creator.id}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ last_synced_at: now.toISOString() }),
        }
      );
    } catch (err) {
      results.push({ creator: creator.name, error: String(err) });
    }
  }

  return NextResponse.json({
    message: `Synced ${creators.length} active creators`,
    mode: isWeeklyRefreshDay ? "new-posts + refresh-counts" : "new-posts only",
    results,
  });
}
