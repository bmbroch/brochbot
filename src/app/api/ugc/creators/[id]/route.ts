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

// PATCH /api/ugc/creators/[id] — update creator
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, status, sync_hour, tiktok_handle, ig_handle } = body;

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (tiktok_handle !== undefined) patch.tiktok_handle = tiktok_handle;
    if (ig_handle !== undefined) patch.ig_handle = ig_handle;
    if (status !== undefined) {
      patch.status = status;
      // Auto-clear sync_hour when status changes away from active
      if (status !== "active" && sync_hour === undefined) {
        patch.sync_hour = null;
      }
    }
    if (sync_hour !== undefined) patch.sync_hour = sync_hour;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ugc_creators?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { ...sbHeaders(), Prefer: "return=representation" },
        body: JSON.stringify(patch),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/ugc/creators/[id] — delete creator
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ugc_creators?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: sbHeaders(),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
