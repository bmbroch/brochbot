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
  lastFetched?: number;
}

// Server-side in-memory cache keyed by handle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
if (!g.__tiktokCache) {
  g.__tiktokCache = new Map<string, TikTokCacheEntry>();
}

export const tiktokCache: Map<string, TikTokCacheEntry> = g.__tiktokCache;
