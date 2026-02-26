// Instagram Supabase store — mirrors tiktok-store.ts

export interface IgAuthorMeta {
  avatar: string;        // profilePicUrl
  fullName: string;
  username: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  verified: boolean;
}

export interface InstagramPost {
  id: string;
  shortCode: string;
  caption: string;
  postedAt: string; // ISO string from timestamp
  views: number;    // videoViewCount || videoPlayCount || 0
  likes: number;
  comments: number;
  url: string;
  type: string;     // "Video" | "Image" | "Sidecar"
  thumbnail: string; // displayUrl
}

export interface InstagramStoreData {
  posts: InstagramPost[];
  lastNewPostsSync: string | null;
  lastCountsRefresh: string | null;
  igAuthorMeta?: IgAuthorMeta;
}

const SUPABASE_URL = process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = process.env.SUPABASE_CLC_KEY!;

function storeKey(igHandle: string): string {
  return `instagram_posts_${igHandle}`;
}

export async function getInstagramStoreData(igHandle: string): Promise<InstagramStoreData | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mc_realtime?key=eq.${encodeURIComponent(storeKey(igHandle))}&select=data`,
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

export async function setInstagramStoreData(igHandle: string, data: InstagramStoreData): Promise<void> {
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
        key: storeKey(igHandle),
        data: data,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {
    // best-effort
  }
}

// Map a raw Apify instagram-scraper item to our InstagramPost shape
export function mapApifyItem(item: Record<string, unknown>): InstagramPost | null {
  const id = (item.id as string) ?? "";
  if (!id) return null;

  return {
    id,
    shortCode: (item.shortCode as string) ?? "",
    caption: (item.caption as string) ?? "",
    postedAt: (item.timestamp as string) ?? new Date().toISOString(),
    views: ((item.videoViewCount as number) || (item.videoPlayCount as number) || 0),
    likes: (item.likesCount as number) ?? 0,
    comments: (item.commentsCount as number) ?? 0,
    url: (item.url as string) ?? "",
    type: (item.type as string) ?? "",
    thumbnail: (item.displayUrl as string) ?? "",
  };
}

// Merge new-posts results into existing store (add new by id, preserve existing)
export function mergeNewPosts(
  existing: InstagramStoreData | null,
  newItems: InstagramPost[],
  igAuthorMeta?: IgAuthorMeta
): InstagramStoreData {
  const store = existing ?? { posts: [], lastNewPostsSync: null, lastCountsRefresh: null };
  const existingIds = new Set(store.posts.map((p) => p.id));
  const added = newItems.filter((p) => !existingIds.has(p.id));

  return {
    ...store,
    posts: [...store.posts, ...added],
    lastNewPostsSync: new Date().toISOString(),
    igAuthorMeta: igAuthorMeta ?? store.igAuthorMeta,
  };
}

// Merge refresh-counts results — update views/likes/comments on existing posts
export function mergeRefreshCounts(
  existing: InstagramStoreData | null,
  refreshed: InstagramPost[],
  igAuthorMeta?: IgAuthorMeta
): InstagramStoreData {
  const store = existing ?? { posts: [], lastNewPostsSync: null, lastCountsRefresh: null };
  const refreshMap = new Map(refreshed.map((p) => [p.id, p]));

  const existingIds = new Set(store.posts.map((p) => p.id));

  const updated = store.posts.map((p) => {
    const fresh = refreshMap.get(p.id);
    if (!fresh) return p;
    return {
      ...p,
      views: fresh.views,
      likes: fresh.likes,
      comments: fresh.comments,
    };
  });

  // Also insert any posts from the refresh that aren't already stored
  const netNew = refreshed.filter((p) => !existingIds.has(p.id));

  return {
    ...store,
    posts: [...updated, ...netNew],
    lastCountsRefresh: new Date().toISOString(),
    igAuthorMeta: igAuthorMeta ?? store.igAuthorMeta,
  };
}
