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

  // Fetch organization settings to get plan
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
  const planLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.basic;

  // Fetch total_posts from all non-archived creators in this org
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?org_id=eq.${orgId}&status=neq.archived&select=total_posts`,
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    }
  );
  const creators = await creatorsRes.json();
  const totalPosts = Array.isArray(creators)
    ? creators.reduce((sum: number, c: { total_posts: number | null }) => sum + (c.total_posts ?? 0), 0)
    : 0;

  return NextResponse.json({ totalPosts, planLimit, plan });
}
