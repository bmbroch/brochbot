import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const STORE_KEY = "ugc_settings";

const DEFAULT_SETTINGS: UGCSettings = {
  defaultSyncHour: 8,
  videosPerCreator: 100,
  refreshFrequency: "daily",
  orgName: "My Workspace",
};

export interface UGCSettings {
  defaultSyncHour: number;      // 0–23 UTC
  videosPerCreator: number;     // max videos to track per creator
  refreshFrequency: "daily" | "twice_daily";
  orgName: string;
}

async function readSettings(): Promise<UGCSettings> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.${STORE_KEY}&select=data`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: "no-store" }
    );
    const rows = await res.json();
    return { ...DEFAULT_SETTINGS, ...(rows?.[0]?.data ?? {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(settings: UGCSettings): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/mc_realtime`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ key: STORE_KEY, data: settings, updated_at: new Date().toISOString() }),
  });
}

// GET /api/ugc/settings
export async function GET() {
  return NextResponse.json(await readSettings());
}

// PATCH /api/ugc/settings — partial update
export async function PATCH(req: NextRequest) {
  try {
    const current = await readSettings();
    const patch = await req.json();
    const updated = { ...current, ...patch };
    await writeSettings(updated);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
