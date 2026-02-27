import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

const PLAN_LIMITS: Record<string, number> = {
  basic: 500,
  growth: 2000,
  pro: 10000,
};

/**
 * GET /api/ugc/usage?org_id=X
 * Returns { totalPosts: number, planLimit: number, plan: string }
 */
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json({ error: "org_id is required" }, { status: 400 });
  }

  // 1. Fetch organization settings to get plan
  const orgRes = await fetch(
    `${SUPABASE_URL}/rest/v1/organizations?id=eq.${orgId}&select=settings`,
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    }
  );
  const orgRows = await orgRes.json();
  const settings = orgRows?.[0]?.settings ?? {};
  const plan: string = settings?.plan ?? "basic";
  const planLimit = settings?.planLimit ?? PLAN_LIMITS[plan] ?? PLAN_LIMITS.basic;

  // 2. Fetch all non-archived creators for this org (just need their IDs)
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?org_id=eq.${orgId}&status=neq.archived&select=id`,
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    }
  );
  const creators = await creatorsRes.json();
  if (!Array.isArray(creators) || creators.length === 0) {
    return NextResponse.json({ totalPosts: 0, planLimit, plan });
  }

  const creatorIds = creators.map((c: { id: string }) => c.id);

  // 3. Fetch all succeeded sync log entries for these creators, newest first
  //    We'll keep only the most recent entry per (creator_id, platform)
  const logRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_sync_log?creator_id=in.(${creatorIds.join(",")})&status=eq.succeeded&order=synced_at.desc&limit=2000&select=creator_id,platform,total_posts`,
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    }
  );
  const logs = await logRes.json();
  if (!Array.isArray(logs)) {
    return NextResponse.json({ totalPosts: 0, planLimit, plan });
  }

  // 4. Keep most recent entry per (creator_id, platform), then sum total_posts
  const seen = new Set<string>();
  let totalPosts = 0;
  for (const entry of logs as { creator_id: string; platform: string; total_posts: number | null }[]) {
    const key = `${entry.creator_id}:${entry.platform}`;
    if (!seen.has(key)) {
      seen.add(key);
      totalPosts += entry.total_posts ?? 0;
    }
  }

  return NextResponse.json({ totalPosts, planLimit, plan });
}
