import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

function sbHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

// GET /api/ugc/creators — list all creators
export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ugc_creators?order=created_at.asc`,
      { headers: sbHeaders() }
    );
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/ugc/creators — insert new creator
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tiktok_handle, ig_handle, status, sync_hour } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const payload = {
      name,
      tiktok_handle: tiktok_handle || null,
      ig_handle: ig_handle || null,
      status: status || "active",
      sync_hour: status === "active" ? (sync_hour ?? 8) : null,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/ugc_creators`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
