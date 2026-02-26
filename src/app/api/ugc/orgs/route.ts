import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

function headers() {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };
}

// GET /api/ugc/orgs — list all organizations
export async function GET() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/organizations?order=created_at.asc`, { headers: headers() });
  const orgs = await res.json();
  return NextResponse.json(orgs);
}

// POST /api/ugc/orgs — create a new organization
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, sync_hour = 8 } = body;
  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/organizations`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({ name: name.trim(), slug, sync_hour }),
  });

  if (!res.ok) {
    const err = await res.text();
    // Slug conflict — append random suffix
    if (err.includes("unique")) {
      const slugUniq = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      const retry = await fetch(`${SUPABASE_URL}/rest/v1/organizations`, {
        method: "POST",
        headers: { ...headers(), Prefer: "return=representation" },
        body: JSON.stringify({ name: name.trim(), slug: slugUniq, sync_hour }),
      });
      const org = await retry.json();
      return NextResponse.json(Array.isArray(org) ? org[0] : org);
    }
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const org = await res.json();
  return NextResponse.json(Array.isArray(org) ? org[0] : org);
}
