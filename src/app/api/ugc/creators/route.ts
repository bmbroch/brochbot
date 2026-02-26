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

// GET /api/ugc/creators?org_id=X — list creators (optionally filtered by org)
export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get("org_id");
    const filter = orgId ? `&org_id=eq.${orgId}` : "";
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ugc_creators?order=created_at.asc${filter}`,
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";
const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || "";

// POST /api/ugc/creators — insert new creator + auto-trigger first fetch
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tiktok_handle, ig_handle, status, sync_hour, org_id } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const payload = {
      name,
      tiktok_handle: tiktok_handle || null,
      ig_handle: ig_handle || null,
      status: status || "active",
      sync_hour: status === "active" ? (sync_hour ?? 8) : null,
      org_id: org_id || null,
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
    const created = Array.isArray(data) ? data[0] : data;

    // Auto-trigger first fetch (fire-and-forget via webhooks)
    const secretParam = WEBHOOK_SECRET ? `&secret=${encodeURIComponent(WEBHOOK_SECRET)}` : "";

    if (created.tiktok_handle) {
      const ttWebhook = `${BASE_URL}/api/tiktok/webhook?handle=${encodeURIComponent(created.tiktok_handle)}&mode=new-posts&creatorId=${created.id}${secretParam}`;
      fetch(`${BASE_URL}/api/tiktok/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: created.tiktok_handle, mode: "new-posts", firstFetch: true, webhookUrl: ttWebhook }),
      }).catch(() => {});
    }

    if (created.ig_handle) {
      const igWebhook = `${BASE_URL}/api/instagram/webhook?igHandle=${encodeURIComponent(created.ig_handle)}&mode=new-posts&creatorId=${created.id}${secretParam}`;
      fetch(`${BASE_URL}/api/instagram/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igHandle: created.ig_handle, mode: "new-posts", firstFetch: true, webhookUrl: igWebhook }),
      }).catch(() => {});
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
