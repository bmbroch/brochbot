/**
 * Writes an entry to ugc_sync_log after every Apify webhook completes.
 * Used by /api/tiktok/webhook and /api/instagram/webhook.
 */

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

export interface SyncLogEntry {
  creator_id?: string | null;
  handle: string;
  platform: "tiktok" | "instagram";
  mode: "new-posts" | "refresh-counts" | "first-fetch" | "avatar-refresh";
  status: "succeeded" | "failed";
  posts_processed?: number;
  total_posts?: number;
  run_id?: string;
  error?: string;
}

export async function writeSyncLog(entry: SyncLogEntry): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/ugc_sync_log`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        creator_id: entry.creator_id ?? null,
        handle: entry.handle,
        platform: entry.platform,
        mode: entry.mode,
        status: entry.status,
        posts_processed: entry.posts_processed ?? 0,
        total_posts: entry.total_posts ?? 0,
        run_id: entry.run_id ?? null,
        error: entry.error ?? null,
      }),
    });
  } catch {
    // best-effort — never let logging break the main flow
  }
}
