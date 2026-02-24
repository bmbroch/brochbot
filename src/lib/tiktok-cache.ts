export interface TikTokVideo {
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  createTimeISO: string;
  webVideoUrl: string;
  text: string;
}

export interface TikTokCacheEntry {
  runId?: string;
  datasetId?: string;
  status: "idle" | "running" | "succeeded" | "failed";
  data?: TikTokVideo[];
  lastFetched?: number; // unix ms
}

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

export async function getCachedData(handle: string): Promise<TikTokCacheEntry | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const key = `tiktok_cache_${handle}`;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.${encodeURIComponent(key)}&select=value`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function setCachedData(handle: string, data: TikTokCacheEntry): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const key = `tiktok_cache_${handle}`;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mc_realtime`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        key,
        value: data,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {
    // best-effort — don't crash the route if Supabase write fails
  }
}
