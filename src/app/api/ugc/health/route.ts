import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.brochbot.com";
const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || "";

type HealthStatus = "healthy" | "stale" | "critical" | "never" | "inactive";

interface CreatorHealth {
  id: string;
  name: string;
  tiktok_handle: string | null;
  ig_handle: string | null;
  status: string;
  health: HealthStatus;
  lastSyncedAt: string | null;
  lastSyncAge: string | null; // human-readable
  ttLastSync: string | null;
  igLastSync: string | null;
  ttPosts: number;
  igPosts: number;
  issues: string[];
}

function hoursAgo(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

function formatAge(iso: string | null): string | null {
  if (!iso) return null;
  const h = hoursAgo(iso);
  if (h < 1) return "just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function computeHealth(status: string, lastSyncedAt: string | null, issues: string[]): HealthStatus {
  if (status === "archived") return "inactive";
  if (!lastSyncedAt) return "never";
  const h = hoursAgo(lastSyncedAt);
  // Active creators sync daily — stale after 36h, critical after 72h
  if (status === "active") {
    if (h <= 36) return "healthy";
    if (h <= 72) return "stale";
    return "critical";
  }
  // Monitoring creators sync weekly — stale after 9d, critical after 21d
  if (h <= 216) return "healthy";  // 9 days
  if (h <= 504) return "stale";    // 21 days
  return "critical";
}

/**
 * GET /api/ugc/health
 *
 * Returns health status for all creators.
 * Query params:
 *   ?remediate=true  — auto-trigger new-posts sync for stale/critical active creators
 *   ?creator=ID      — health for a single creator
 */
export async function GET(req: NextRequest) {
  const remediate = req.nextUrl.searchParams.get("remediate") === "true";
  const filterCreator = req.nextUrl.searchParams.get("creator");
  const orgId = req.nextUrl.searchParams.get("org_id");

  // 1. Fetch all creators
  const creatorsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_creators?order=name.asc${filterCreator ? `&id=eq.${filterCreator}` : ""}${orgId ? `&org_id=eq.${orgId}` : ""}`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: "no-store" }
  );
  const creators = await creatorsRes.json();
  if (!Array.isArray(creators)) return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 });

  // 2. Fetch last sync per creator+platform from ugc_sync_log
  const logRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ugc_sync_log?status=eq.succeeded&order=synced_at.desc&limit=500`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: "no-store" }
  );
  const logs: Array<{ creator_id: string; handle: string; platform: string; synced_at: string; posts_processed: number; total_posts: number }> = await logRes.json() ?? [];

  // Build last-sync map: creatorId:platform → most recent entry
  const lastSyncMap: Record<string, typeof logs[0]> = {};
  for (const log of logs) {
    const key = `${log.creator_id}:${log.platform}`;
    if (!lastSyncMap[key]) lastSyncMap[key] = log; // already sorted desc
  }

  // 3. Compute health per creator
  const remediated: string[] = [];
  const secretParam = WEBHOOK_SECRET ? `&secret=${encodeURIComponent(WEBHOOK_SECRET)}` : "";

  const health: CreatorHealth[] = await Promise.all(creators.map(async (c: {
    id: string; name: string; tiktok_handle: string | null; ig_handle: string | null;
    status: string; last_synced_at: string | null;
  }) => {
    const ttLog = lastSyncMap[`${c.id}:tiktok`];
    const igLog = lastSyncMap[`${c.id}:instagram`];
    const issues: string[] = [];

    // Determine effective last sync (most recent across platforms)
    const ttSyncedAt = ttLog?.synced_at ?? null;
    const igSyncedAt = igLog?.synced_at ?? null;
    const lastSyncedAt = [ttSyncedAt, igSyncedAt]
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ?? null;

    if (c.tiktok_handle && !ttLog) issues.push("TikTok never synced");
    if (c.ig_handle && !igLog) issues.push("Instagram never synced");
    if (c.tiktok_handle && ttLog && hoursAgo(ttLog.synced_at) > 48) issues.push(`TikTok last synced ${formatAge(ttLog.synced_at)}`);
    if (c.ig_handle && igLog && hoursAgo(igLog.synced_at) > 48) issues.push(`Instagram last synced ${formatAge(igLog.synced_at)}`);

    const healthStatus = computeHealth(c.status, lastSyncedAt, issues);

    // Auto-remediate: fire new-posts for stale/critical active creators
    // Must await — Vercel kills unawaited fetches when the response is returned
    if (remediate && c.status === "active" && (healthStatus === "stale" || healthStatus === "critical" || healthStatus === "never")) {
      const remediatePromises: Promise<unknown>[] = [];
      if (c.tiktok_handle) {
        const ttWebhook = `${BASE_URL}/api/tiktok/webhook?handle=${encodeURIComponent(c.tiktok_handle)}&mode=new-posts&creatorId=${c.id}${secretParam}`;
        remediatePromises.push(
          fetch(`${BASE_URL}/api/tiktok/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle: c.tiktok_handle, mode: "new-posts", firstFetch: !ttLog, webhookUrl: ttWebhook }),
          }).catch(() => {})
        );
      }
      if (c.ig_handle) {
        const igWebhook = `${BASE_URL}/api/instagram/webhook?igHandle=${encodeURIComponent(c.ig_handle)}&mode=new-posts&creatorId=${c.id}${secretParam}`;
        remediatePromises.push(
          fetch(`${BASE_URL}/api/instagram/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ igHandle: c.ig_handle, mode: "new-posts", firstFetch: !igLog, webhookUrl: igWebhook }),
          }).catch(() => {})
        );
      }
      await Promise.all(remediatePromises);
      remediated.push(c.name);
    }

    return {
      id: c.id,
      name: c.name,
      tiktok_handle: c.tiktok_handle,
      ig_handle: c.ig_handle,
      status: c.status,
      health: healthStatus,
      lastSyncedAt,
      lastSyncAge: formatAge(lastSyncedAt),
      ttLastSync: formatAge(ttSyncedAt),
      igLastSync: formatAge(igSyncedAt),
      ttPosts: ttLog?.total_posts ?? 0,
      igPosts: igLog?.total_posts ?? 0,
      issues,
    };
  }));

  const summary = {
    total: health.length,
    healthy: health.filter((c) => c.health === "healthy").length,
    stale: health.filter((c) => c.health === "stale").length,
    critical: health.filter((c) => c.health === "critical" || c.health === "never").length,
    inactive: health.filter((c) => c.health === "inactive").length,
  };

  return NextResponse.json({
    summary,
    creators: health,
    ...(remediate ? { remediated } : {}),
  });
}
