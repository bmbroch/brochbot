import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim())
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Store org name in mc_realtime table (key: "ugc_org", data: { name, createdAt })
  // Temporary solution until proper orgs table is set up
  const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
  const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/mc_realtime`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      key: "ugc_org",
      data: { name: name.trim(), createdAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Supabase error:", response.status, text);
    return NextResponse.json({ error: "Failed to save organization" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
