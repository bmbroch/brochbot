import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const STORE_KEY = "ugc_settings";

const DEFAULT_SETTINGS: UGCSettings = {
  defaultSyncHour: 8,
  syncTimeLocal: 8,
  syncTimezone: "UTC",
  videosPerCreator: 100,
  refreshFrequency: "daily",
  orgName: "My Workspace",
};

export interface UGCSettings {
  defaultSyncHour: number;      // 0–23 UTC (computed from syncTimeLocal + syncTimezone)
  syncTimeLocal: number;        // 0–23 in the selected timezone (display value)
  syncTimezone: string;         // IANA timezone string e.g. "America/New_York"
  videosPerCreator: number;     // max videos to track per creator
  refreshFrequency: "daily" | "twice_daily";
  orgName: string;
}

// ─── Global fallback (mc_realtime key) ────────────────────────────────────────

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

// ─── Org-scoped settings (organizations.settings JSONB) ───────────────────────

async function readOrgSettings(orgId: string): Promise<UGCSettings & { _orgRow?: Record<string, unknown> }> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/organizations?id=eq.${orgId}&select=id,name,slug,sync_hour,settings`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: "no-store" }
    );
    const rows = await res.json();
    const org = rows?.[0];
    if (!org) return { ...DEFAULT_SETTINGS };
    const merged: UGCSettings & { _orgRow?: Record<string, unknown> } = {
      ...DEFAULT_SETTINGS,
      orgName: org.name ?? DEFAULT_SETTINGS.orgName,
      defaultSyncHour: org.sync_hour ?? DEFAULT_SETTINGS.defaultSyncHour,
      ...(org.settings ?? {}),
      _orgRow: org,
    };
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeOrgSettings(
  orgId: string,
  patch: Partial<UGCSettings>,
  currentSettings: Record<string, unknown>
): Promise<void> {
  // Strip non-settings fields before storing in JSONB
  const { orgName: _orgName, defaultSyncHour: _syncHour, ...settingsPatch } = patch as Record<string, unknown>;

  // Merge new settings into existing JSONB (excluding top-level org fields)
  const newSettings = { ...currentSettings, ...settingsPatch };

  // Build org row updates
  const orgUpdate: Record<string, unknown> = { settings: newSettings };
  if (patch.defaultSyncHour !== undefined) orgUpdate.sync_hour = patch.defaultSyncHour;
  if (patch.orgName !== undefined) orgUpdate.name = patch.orgName;

  await fetch(`${SUPABASE_URL}/rest/v1/organizations?id=eq.${orgId}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(orgUpdate),
  });
}

// GET /api/ugc/settings[?org_id=X]
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");
  if (orgId) {
    const settings = await readOrgSettings(orgId);
    // Strip internal _orgRow before returning
    const { _orgRow: _, ...out } = settings;
    return NextResponse.json(out);
  }
  return NextResponse.json(await readSettings());
}

// PATCH /api/ugc/settings[?org_id=X] — partial update
export async function PATCH(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");

  try {
    const patch = await req.json();

    if (orgId) {
      // Org-scoped path
      const current = await readOrgSettings(orgId);
      const { _orgRow, ...currentClean } = current;
      const orgRow = (_orgRow ?? {}) as Record<string, unknown>;
      const existingSettings = (orgRow.settings ?? {}) as Record<string, unknown>;

      await writeOrgSettings(orgId, patch, existingSettings);

      // Propagate new sync hour to all active creators in this org
      if (patch.defaultSyncHour !== undefined && patch.defaultSyncHour !== currentClean.defaultSyncHour) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/ugc_creators?status=eq.active&org_id=eq.${orgId}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ sync_hour: patch.defaultSyncHour }),
          }
        );
      }

      // Re-read and return fresh merged settings
      const updated = await readOrgSettings(orgId);
      const { _orgRow: _2, ...updatedClean } = updated;
      return NextResponse.json(updatedClean);
    }

    // Global fallback path
    const current = await readSettings();
    const updated = { ...current, ...patch };
    await writeSettings(updated);

    // Propagate new sync hour to all active creators
    if (patch.defaultSyncHour !== undefined && patch.defaultSyncHour !== current.defaultSyncHour) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/ugc_creators?status=eq.active`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ sync_hour: updated.defaultSyncHour }),
        }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
