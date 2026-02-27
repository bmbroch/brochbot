// TikTok Supabase store — new architecture (two-button system)

export interface TikTokVideo {
  id: string;
  caption: string;
  postedAt: string; // ISO string
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  url: string;
}

export interface TikTokAuthorMeta {
  avatar: string;
  nickName: string;
  signature: string;
  fans: number;
  heart: number;
  video: number;
  verified: boolean;
  following: number;
  profileUrl: string;
}

export interface TikTokStoreData {
  videos: TikTokVideo[];
  authorMeta?: TikTokAuthorMeta;
  lastNewPostsSync: string | null; // ISO string
  lastCountsRefresh: string | null; // ISO string
}

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

function storeKey(handle: string): string {
  return `tiktok_videos_${handle}`;
}

export async function getStoreData(handle: string): Promise<TikTokStoreData | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.${encodeURIComponent(storeKey(handle))}&select=data`,
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
    return rows?.[0]?.data ?? null;
  } catch {
    return null;
  }
}

export async function setStoreData(handle: string, data: TikTokStoreData): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
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
        key: storeKey(handle),
        data: data,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {
    // best-effort
  }
}

// Map a raw Apify item to our TikTokVideo shape
export function mapApifyItem(item: Record<string, unknown>): TikTokVideo | null {
  // Extract video ID from the item or from the URL
  const id =
    (item.id as string) ||
    (item.videoId as string) ||
    extractIdFromUrl((item.webVideoUrl as string) ?? "");

  if (!id) return null;

  return {
    id,
    caption: ((item.text ?? item.caption) as string) ?? "",
    postedAt: ((item.createTimeISO ?? item.postedAt ?? item.createTime) as string) ?? new Date().toISOString(),
    views: ((item.playCount ?? item.views) as number) ?? 0,
    likes: ((item.diggCount ?? item.likes) as number) ?? 0,
    comments: ((item.commentCount ?? item.comments) as number) ?? 0,
    shares: ((item.shareCount ?? item.shares) as number) ?? 0,
    saves: (item.collectCount as number) ?? 0,
    url: ((item.webVideoUrl ?? item.videoUrl ?? item.url) as string) ?? "",
  };
}

function extractIdFromUrl(url: string): string {
  const match = url.match(/video\/(\d+)/);
  return match?.[1] ?? "";
}

// Merge new-posts results into existing store
export function mergeNewPosts(
  existing: TikTokStoreData | null,
  newItems: TikTokVideo[]
): TikTokStoreData {
  const store = existing ?? { videos: [], lastNewPostsSync: null, lastCountsRefresh: null };
  const existingIds = new Set(store.videos.map((v) => v.id));

  const added = newItems.filter((v) => !existingIds.has(v.id));

  return {
    ...store,
    videos: [...store.videos, ...added],
    lastNewPostsSync: new Date().toISOString(),
  };
}

// Merge refresh-counts results into existing store
export function mergeRefreshCounts(
  existing: TikTokStoreData | null,
  refreshedItems: TikTokVideo[]
): TikTokStoreData {
  const store = existing ?? { videos: [], lastNewPostsSync: null, lastCountsRefresh: null };
  const refreshMap = new Map(refreshedItems.map((v) => [v.id, v]));

  const existingIds = new Set(store.videos.map((v) => v.id));

  const updated = store.videos.map((v) => {
    const fresh = refreshMap.get(v.id);
    if (!fresh) return v;
    return {
      ...v,
      views: fresh.views,
      likes: fresh.likes,
      comments: fresh.comments,
      shares: fresh.shares,
      saves: fresh.saves,
    };
  });

  // Also insert any posts from the refresh that aren't already stored
  const netNew = refreshedItems.filter((v) => !existingIds.has(v.id));

  return {
    ...store,
    videos: [...updated, ...netNew],
    lastCountsRefresh: new Date().toISOString(),
  };
}
