"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Shell from "@/components/Shell";
import { useTheme } from "@/components/ThemeProvider";
import { creatorColors } from "@/lib/data-provider";
import { TIKTOK_CREATORS } from "@/lib/tiktok-creators";
import { TikTokStoreData, TikTokVideo, TikTokAuthorMeta } from "@/lib/tiktok-store";
import { InstagramStoreData, InstagramPost, IgAuthorMeta } from "@/lib/instagram-store";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Search, RefreshCw, ExternalLink, Loader2, Music, Camera } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type LoadState = "loading" | "idle" | "done" | "error";
type ButtonMode = "new-posts" | "refresh-counts";
type RunState = "idle" | "running" | "done" | "error";
type Platform = "tiktok" | "instagram";
type DateRange = "7D" | "30D" | "90D" | "All";
type OverviewPlatform = "All" | "TikTok" | "Instagram";

interface PostDetail {
  date: string | null;
  platform: "tiktok" | "instagram";
  views: number;
  url: string;
  title: null;
}

interface CreatorData {
  name: string;
  startDate: string;
  ttViews: number;
  igViews: number;
  posts: number;
  avgPerPost: number;
  earnings: number;
  paymentCount: number;
  lastPaidAt: string | null;
  posts_detail: PostDetail[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function truncate(str: string, len: number): string {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function getCutoff(range: DateRange): Date | null {
  if (range === "All") return null;
  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildTsMap(
  creator: CreatorData,
  cutoff: Date | null
): Record<string, { ttViews: number; igViews: number }> {
  const map: Record<string, { ttViews: number; igViews: number }> = {};
  creator.posts_detail.forEach((p) => {
    if (!p.date) return;
    if (cutoff && new Date(p.date) < cutoff) return;
    if (!map[p.date]) map[p.date] = { ttViews: 0, igViews: 0 };
    if (p.platform === "tiktok") map[p.date].ttViews += p.views;
    else map[p.date].igViews += p.views;
  });
  return map;
}

function cpmColor(cpm: number): string {
  if (cpm < 3) return "text-green-500 dark:text-green-400";
  if (cpm <= 10) return "text-yellow-500 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

// Map from TIKTOK_CREATORS handle → creator-data.json key
// "Flo" creator has handle that maps to "sophie" key
function getCreatorDataKey(handle: string): string {
  const creator = TIKTOK_CREATORS.find((c) => c.handle === handle);
  if (!creator) return "";
  const name = creator.name.toLowerCase();
  // "Flo" maps to "sophie" in creator-data.json
  if (name === "flo") return "sophie";
  return name;
}

// ─── Stat Cards ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-5 flex flex-col gap-1 hover:border-gray-300 dark:hover:border-[#333] transition-colors">
      <p className="text-xs text-gray-400 dark:text-white/40 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Custom Tooltips ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  videos,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  videos?: TikTokVideo[];
}) {
  if (!active || !payload?.length) return null;
  const caption = videos?.find((v) => shortDate(v.postedAt) === label)?.caption;
  return (
    <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] px-3 py-2 text-xs shadow-xl max-w-[200px]">
      <p className="text-gray-400 dark:text-white/50 mb-1">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{fmt(payload[0].value)} views</p>
      {caption && (
        <p className="text-gray-400 dark:text-white/40 mt-1 leading-relaxed">
          {truncate(caption, 60)}
        </p>
      )}
    </div>
  );
}

function IgTooltip({
  active,
  payload,
  label,
  posts,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  posts?: InstagramPost[];
}) {
  if (!active || !payload?.length) return null;
  const caption = posts?.find((p) => shortDate(p.postedAt) === label)?.caption;
  return (
    <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] px-3 py-2 text-xs shadow-xl max-w-[200px]">
      <p className="text-gray-400 dark:text-white/50 mb-1">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{fmt(payload[0].value)} views</p>
      {caption && (
        <p className="text-gray-400 dark:text-white/40 mt-1 leading-relaxed">
          {truncate(caption, 60)}
        </p>
      )}
    </div>
  );
}

// ─── Profile Headers ───────────────────────────────────────────────────────────

function ProfileHeader({ meta }: { meta: TikTokAuthorMeta }) {
  const initials = meta.nickName ? meta.nickName.slice(0, 2).toUpperCase() : "?";
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-5 mb-4 flex items-center gap-5">
      {meta.avatar ? (
        <img
          src={`/api/proxy-image?url=${encodeURIComponent(meta.avatar)}`}
          alt={meta.nickName}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-blue-500 text-white font-bold text-lg ring-2 ring-white/10">
          {initials}
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {meta.nickName || "Unknown"}
          </span>
          {meta.verified && (
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-blue-500 flex-shrink-0">
              <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.15" />
              <path d="M7 12.5l3.5 3.5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {meta.signature && (
          <p className="text-sm text-gray-500 dark:text-white/50 max-w-md line-clamp-2 leading-snug">
            {meta.signature}
          </p>
        )}
        <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
          {fmt(meta.fans)} Followers · {fmt(meta.heart)} Likes · {meta.video} Videos
        </p>
      </div>
    </div>
  );
}

function IgProfileHeader({ meta }: { meta: IgAuthorMeta }) {
  const initials = meta.fullName
    ? meta.fullName.slice(0, 2).toUpperCase()
    : meta.username
    ? meta.username.slice(0, 2).toUpperCase()
    : "?";
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-5 mb-4 flex items-center gap-5">
      {meta.avatar ? (
        <img
          src={`/api/proxy-image?url=${encodeURIComponent(meta.avatar)}`}
          alt={meta.fullName || meta.username}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-lg ring-2 ring-white/10">
          {initials}
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {meta.fullName || meta.username || "Unknown"}
          </span>
          {meta.verified && (
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-blue-500 flex-shrink-0">
              <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.15" />
              <path d="M7 12.5l3.5 3.5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {meta.username && (
          <p className="text-sm text-gray-400 dark:text-white/40">@{meta.username}</p>
        )}
        {meta.biography && (
          <p className="text-sm text-gray-500 dark:text-white/50 max-w-md line-clamp-2 leading-snug">
            {meta.biography}
          </p>
        )}
        <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
          {fmt(meta.followersCount)} Followers · {fmt(meta.postsCount)} Posts
        </p>
      </div>
    </div>
  );
}

// ─── Platform Toggle ───────────────────────────────────────────────────────────

function PlatformToggle({ platform, onChange }: { platform: Platform; onChange: (p: Platform) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#222]">
      <button
        onClick={() => onChange("tiktok")}
        className={[
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          platform === "tiktok"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/80",
        ].join(" ")}
      >
        <Music size={13} />
        TikTok
      </button>
      <button
        onClick={() => onChange("instagram")}
        className={[
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          platform === "instagram"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/80",
        ].join(" ")}
      >
        <Camera size={13} />
        Instagram
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;

const pillBase = "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer";
const pillActive = "bg-[var(--text-primary)] text-[var(--bg-primary)]";
const pillInactive = "border border-[var(--border-medium)] text-[var(--text-muted)] hover:border-[var(--border-strong)]";

export default function UGCPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── Overview (creator-data.json) state ─────────────────────────────────────
  const [creatorsMap, setCreatorsMap] = useState<Record<string, CreatorData> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [enabledCreators, setEnabledCreators] = useState<Record<string, boolean>>({});
  const [dateRange, setDateRange] = useState<DateRange>("All");
  const [overviewPlatform, setOverviewPlatform] = useState<OverviewPlatform>("All");

  // ── Per-creator (Apify/Supabase) state ─────────────────────────────────────
  const [activeHandle, setActiveHandle] = useState<string>("sell.with.nick");
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [storeData, setStoreData] = useState<TikTokStoreData | null>(null);
  const [igLoadState, setIgLoadState] = useState<LoadState>("loading");
  const [igStoreData, setIgStoreData] = useState<InstagramStoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newPostsState, setNewPostsState] = useState<RunState>("idle");
  const [refreshState, setRefreshState] = useState<RunState>("idle");

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const activeCreator = TIKTOK_CREATORS.find((c) => c.handle === activeHandle);
  const activeIgHandle = activeCreator?.igHandle ?? null;

  // ── Load overview data ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/creator-data.json")
      .then((r) => r.json())
      .then((data: Record<string, CreatorData | string>) => {
        const { lastUpdated: lu, ...rest } = data as Record<string, CreatorData & { lastUpdated?: string }>;
        const map = rest as Record<string, CreatorData>;
        setCreatorsMap(map);
        setLastUpdated(lu as unknown as string ?? null);
        const enabled: Record<string, boolean> = {};
        Object.values(map).forEach((c) => { enabled[c.name] = true; });
        setEnabledCreators(enabled);
      })
      .catch((err) => console.error("Failed to load creator-data.json", err));
  }, []);

  const allCreators = useMemo<CreatorData[]>(
    () => (creatorsMap ? Object.values(creatorsMap) : []),
    [creatorsMap]
  );

  const cutoff = useMemo(() => getCutoff(dateRange), [dateRange]);

  // Overview computed stats
  const overviewStats = useMemo(() => {
    if (!creatorsMap) return { totalViews: 0, totalPosts: 0, totalEarnings: 0, avgCpm: 0, activeCount: 0 };
    const creators = Object.values(creatorsMap);
    const totalTT = creators.reduce((s, c) => s + c.ttViews, 0);
    const totalIG = creators.reduce((s, c) => s + c.igViews, 0);
    const totalViews = overviewPlatform === "TikTok" ? totalTT : overviewPlatform === "Instagram" ? totalIG : totalTT + totalIG;
    const totalPosts = creators.reduce((s, c) => s + c.posts, 0);
    const totalEarnings = creators.reduce((s, c) => s + c.earnings, 0);
    const allViews = totalTT + totalIG;
    const avgCpm = allViews > 0 ? (totalEarnings / allViews) * 1000 : 0;
    return { totalViews, totalPosts, totalEarnings, avgCpm, activeCount: creators.length };
  }, [creatorsMap, overviewPlatform]);

  // Line chart data
  const lineChartData = useMemo(() => {
    const tsMaps: Record<string, Record<string, { ttViews: number; igViews: number }>> = {};
    const allDates = new Set<string>();
    allCreators.forEach((c) => {
      if (!enabledCreators[c.name]) return;
      const m = buildTsMap(c, cutoff);
      tsMaps[c.name] = m;
      Object.keys(m).forEach((d) => allDates.add(d));
    });
    const dates = Array.from(allDates).sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = { date: date.slice(5) };
      allCreators.forEach((c) => {
        if (!enabledCreators[c.name]) return;
        const d = tsMaps[c.name]?.[date];
        if (d) {
          point[c.name] =
            overviewPlatform === "TikTok"
              ? d.ttViews
              : overviewPlatform === "Instagram"
              ? d.igViews
              : d.ttViews + d.igViews;
        }
      });
      return point;
    });
  }, [allCreators, enabledCreators, cutoff, overviewPlatform]);

  // Bar chart data
  const barData = useMemo(
    () =>
      allCreators.map((c) => ({
        name: c.name,
        TikTok: c.ttViews,
        Instagram: c.igViews,
      })),
    [allCreators]
  );

  const toggleCreator = (name: string) =>
    setEnabledCreators((prev) => ({ ...prev, [name]: !prev[name] }));

  // ── Earnings row for active creator ────────────────────────────────────────
  const activeCreatorData = useMemo(() => {
    if (!creatorsMap) return null;
    const key = getCreatorDataKey(activeHandle);
    return creatorsMap[key] ?? null;
  }, [creatorsMap, activeHandle]);

  const earningsRow = useMemo(() => {
    if (!activeCreatorData || !activeCreatorData.earnings) return null;
    const totalViews = activeCreatorData.ttViews + activeCreatorData.igViews;
    const cpm = totalViews > 0 ? (activeCreatorData.earnings / totalViews) * 1000 : null;
    const lastPaid = activeCreatorData.lastPaidAt
      ? new Date(activeCreatorData.lastPaidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : null;
    return { earnings: activeCreatorData.earnings, cpm, payments: activeCreatorData.paymentCount, lastPaid };
  }, [activeCreatorData]);

  // ── Apify / Supabase loading ────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const loadTikTokData = useCallback(
    async (handle: string) => {
      stopPolling();
      setStoreData(null);
      setError(null);
      setLoadState("loading");
      try {
        const res = await fetch(`/api/tiktok/data?handle=${encodeURIComponent(handle)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load data");
        setStoreData(json.data ?? null);
        setLoadState(json.data ? "done" : "idle");
      } catch (err) {
        setError(String(err));
        setLoadState("error");
      }
    },
    [stopPolling]
  );

  const loadInstagramData = useCallback(
    async (igHandle: string) => {
      stopPolling();
      setIgStoreData(null);
      setError(null);
      setIgLoadState("loading");
      try {
        const res = await fetch(`/api/instagram/data?igHandle=${encodeURIComponent(igHandle)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load Instagram data");
        setIgStoreData(json.data ?? null);
        setIgLoadState(json.data ? "done" : "idle");
      } catch (err) {
        setError(String(err));
        setIgLoadState("error");
      }
    },
    [stopPolling]
  );

  const startTikTokPolling = useCallback(
    (runId: string, handle: string, mode: ButtonMode) => {
      stopPolling();
      const setRunState = mode === "new-posts" ? setNewPostsState : setRefreshState;
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/tiktok/poll?runId=${encodeURIComponent(runId)}&handle=${encodeURIComponent(handle)}&mode=${mode}`
          );
          const json = await res.json();
          if (json.status === "DONE") {
            stopPolling();
            setRunState("done");
            if (json.data) { setStoreData(json.data); setLoadState("done"); }
          } else if (json.status === "FAILED") {
            stopPolling();
            setRunState("error");
            setError("Apify run failed. Try again.");
          }
        } catch { /* transient */ }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  const startInstagramPolling = useCallback(
    (runId: string, igHandle: string, mode: ButtonMode, profileRunId?: string | null, profileDatasetId?: string | null) => {
      stopPolling();
      const setRunState = mode === "new-posts" ? setNewPostsState : setRefreshState;
      pollRef.current = setInterval(async () => {
        try {
          let pollUrl = `/api/instagram/poll?runId=${encodeURIComponent(runId)}&igHandle=${encodeURIComponent(igHandle)}&mode=${mode}`;
          if (profileRunId) pollUrl += `&profileRunId=${encodeURIComponent(profileRunId)}`;
          if (profileDatasetId) pollUrl += `&profileDatasetId=${encodeURIComponent(profileDatasetId)}`;
          const res = await fetch(pollUrl);
          const json = await res.json();
          if (json.status === "DONE") {
            stopPolling();
            setRunState("done");
            if (json.data) { setIgStoreData(json.data); setIgLoadState("done"); }
          } else if (json.status === "FAILED") {
            stopPolling();
            setRunState("error");
            setError("Apify run failed. Try again.");
          }
        } catch { /* transient */ }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  const handleRun = useCallback(
    async (mode: ButtonMode) => {
      const setRunState = mode === "new-posts" ? setNewPostsState : setRefreshState;
      setRunState("running");
      setError(null);
      if (platform === "tiktok") {
        const firstFetch = !storeData || storeData.videos.length === 0;
        try {
          const res = await fetch("/api/tiktok/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle: activeHandle, mode, firstFetch }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Failed to start run");
          startTikTokPolling(json.runId, activeHandle, mode);
        } catch (err) {
          setRunState("error");
          setError(String(err));
        }
      } else {
        if (!activeIgHandle) {
          setRunState("error");
          setError("No Instagram handle configured for this creator.");
          return;
        }
        const firstFetch = !igStoreData || igStoreData.posts.length === 0;
        try {
          const res = await fetch("/api/instagram/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ igHandle: activeIgHandle, mode, firstFetch }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Failed to start Instagram run");
          startInstagramPolling(json.runId, activeIgHandle, mode, json.profileRunId ?? null, json.profileDatasetId ?? null);
        } catch (err) {
          setRunState("error");
          setError(String(err));
        }
      }
    },
    [platform, activeHandle, activeIgHandle, storeData, igStoreData, startTikTokPolling, startInstagramPolling]
  );

  useEffect(() => {
    setNewPostsState("idle");
    setRefreshState("idle");
    setError(null);
    loadTikTokData(activeHandle);
    if (activeIgHandle) {
      loadInstagramData(activeIgHandle);
    } else {
      setIgStoreData(null);
      setIgLoadState("idle");
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHandle]);

  useEffect(() => {
    setNewPostsState("idle");
    setRefreshState("idle");
    setError(null);
    stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  // ── Derived: TikTok ───────────────────────────────────────────────────────
  const videos = storeData?.videos ?? [];
  const totalVideos = videos.length;
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0);
  const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
  const ttChartData = [...videos]
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime())
    .slice(-30)
    .map((v) => ({ date: shortDate(v.postedAt), views: v.views || 0 }));
  const tableVideos = [...videos].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  // ── Derived: Instagram ────────────────────────────────────────────────────
  const posts = igStoreData?.posts ?? [];
  const totalPosts = posts.length;
  const igTotalViews = posts.reduce((s, p) => s + (p.views || 0), 0);
  const igTotalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const igTotalComments = posts.reduce((s, p) => s + (p.comments || 0), 0);
  const igAvgViews = totalPosts > 0 ? Math.round(igTotalViews / totalPosts) : 0;
  const igChartData = [...posts]
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime())
    .slice(-30)
    .map((p) => ({ date: shortDate(p.postedAt), views: p.views || 0 }));
  const tablePosts = [...posts].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  // ── Shared ────────────────────────────────────────────────────────────────
  const activeLoadState = platform === "tiktok" ? loadState : igLoadState;
  const activeSyncTime = platform === "tiktok" ? storeData?.lastNewPostsSync ?? null : igStoreData?.lastNewPostsSync ?? null;
  const activeRefreshTime = platform === "tiktok" ? storeData?.lastCountsRefresh ?? null : igStoreData?.lastCountsRefresh ?? null;

  const gridColor = isDark ? "#262626" : "#e5e7eb";
  const tickColor = isDark ? "#71717a" : "#9ca3af";
  const axisColor = isDark ? "#262626" : "#e5e7eb";
  const yLabelColor = isDark ? "#e4e4e7" : "#374151";

  const tooltipStyle = isDark
    ? { contentStyle: { backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "#a1a1aa" }, itemStyle: { color: "#e4e4e7" } }
    : { contentStyle: { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }, labelStyle: { color: "#6b7280" }, itemStyle: { color: "#374151" } };

  const newPostsRunning = newPostsState === "running";
  const refreshRunning = refreshState === "running";

  const showTT = overviewPlatform !== "Instagram";
  const showIG = overviewPlatform !== "TikTok";

  return (
    <Shell>
      <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] p-6 lg:p-8">

        {/* ══ Page Header ══════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">UGC Analytics</h1>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-1">Powered by Apify + Google Sheets</p>
          {lastUpdated && (
            <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">Sheets synced {timeAgo(lastUpdated)}</p>
          )}
        </div>

        {/* ══ Overview Section ═════════════════════════════════════════════════ */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-white/70 mr-2">Overview</h2>
            {/* Date range pills */}
            <div className="flex items-center gap-1.5">
              {(["7D", "30D", "90D", "All"] as DateRange[]).map((r) => (
                <button key={r} onClick={() => setDateRange(r)} className={`${pillBase} ${dateRange === r ? pillActive : pillInactive}`}>{r}</button>
              ))}
            </div>
            <div className="w-px h-5 bg-[var(--border-medium)]" />
            {/* Platform pills */}
            <div className="flex items-center gap-1.5">
              {(["All", "TikTok", "Instagram"] as OverviewPlatform[]).map((p) => (
                <button key={p} onClick={() => setOverviewPlatform(p)} className={`${pillBase} ${overviewPlatform === p ? pillActive : pillInactive}`}>{p}</button>
              ))}
            </div>
          </div>

          {/* Overview stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Views" value={fmt(overviewStats.totalViews)} sub={overviewPlatform === "All" ? "TikTok + Instagram" : overviewPlatform} />
            <StatCard label="Total Posts" value={fmt(overviewStats.totalPosts)} />
            <StatCard label="Total Earnings" value={`$${overviewStats.totalEarnings.toLocaleString()}`} />
            <StatCard
              label="Avg CPM"
              value={overviewStats.avgCpm > 0 ? `$${overviewStats.avgCpm.toFixed(2)}` : "—"}
              sub="cost per 1K views"
            />
            <StatCard label="Active Creators" value={overviewStats.activeCount} />
          </div>

          {/* Views Over Time line chart */}
          {creatorsMap && (
            <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-5 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70">Total Views Over Time</h3>
                <div className="flex flex-wrap gap-2">
                  {allCreators.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => toggleCreator(c.name)}
                      className={`text-[11px] px-2 py-1 rounded-full border transition-all ${enabledCreators[c.name] ? "border-transparent" : "border-[var(--border-medium)] opacity-40"}`}
                      style={
                        enabledCreators[c.name]
                          ? { backgroundColor: `${creatorColors[c.name]}20`, color: creatorColors[c.name] }
                          : { color: "var(--text-muted)" }
                      }
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              {lineChartData.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-gray-400 dark:text-white/30 text-sm">No data for this range</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={{ stroke: axisColor }} />
                    <YAxis tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={{ stroke: axisColor }} tickFormatter={fmt} />
                    <Tooltip {...tooltipStyle} formatter={(value) => fmt(Number(value))} />
                    {allCreators.filter((c) => enabledCreators[c.name]).map((c) => (
                      <Line key={c.name} type="monotone" dataKey={c.name} stroke={creatorColors[c.name]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Platform comparison bar chart */}
          {creatorsMap && (
            <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70 mb-4">Platform Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={{ stroke: axisColor }} tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" tick={{ fill: yLabelColor, fontSize: 12 }} tickLine={false} axisLine={{ stroke: axisColor }} width={60} />
                  <Tooltip {...tooltipStyle} formatter={(value) => fmt(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 11, color: tickColor }} />
                  {showTT && <Bar dataKey="TikTok" fill="#06b6d4" radius={[0, 4, 4, 0]} />}
                  {showIG && <Bar dataKey="Instagram" fill="#ec4899" radius={[0, 4, 4, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Loading skeleton for overview */}
          {!creatorsMap && (
            <div className="flex items-center gap-3 text-gray-400 dark:text-white/40 py-12 justify-center">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading overview data...</span>
            </div>
          )}
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 dark:border-[#222] mb-8" />

        {/* ══ Per-Creator Section ══════════════════════════════════════════════ */}
        <div>
          {/* Section header + action buttons */}
          <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-white/70">Per-Creator Analytics</h2>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRun("new-posts")}
                  disabled={newPostsRunning || refreshRunning}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {newPostsRunning ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  {newPostsRunning ? "Syncing..." : "New Posts"}
                </button>
                <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap">
                  · synced {timeAgo(activeSyncTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRun("refresh-counts")}
                  disabled={newPostsRunning || refreshRunning}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {refreshRunning ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  {refreshRunning ? "Refreshing..." : "Refresh Counts"}
                </button>
                <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap">
                  · updated {timeAgo(activeRefreshTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Tabs */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {TIKTOK_CREATORS.map((creator) => {
              const active = creator.handle === activeHandle;
              const disabled = !creator.handle;
              return (
                <button
                  key={creator.name}
                  onClick={() => { if (creator.handle && !disabled) setActiveHandle(creator.handle); }}
                  disabled={disabled}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                    active
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-500 dark:text-blue-400"
                      : disabled
                      ? "bg-transparent border-gray-100 dark:border-[#1a1a1a] text-gray-300 dark:text-white/20 cursor-not-allowed"
                      : "bg-white dark:bg-[#111] border-gray-200 dark:border-[#222] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333]",
                  ].join(" ")}
                >
                  {creator.name}
                  {disabled && <span className="ml-2 text-[10px] text-gray-300 dark:text-white/20 font-normal">soon</span>}
                </button>
              );
            })}
          </div>

          {/* Platform Toggle */}
          <div className="mb-5">
            <PlatformToggle platform={platform} onChange={setPlatform} />
          </div>

          {/* Earnings Row */}
          {earningsRow && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 px-1 text-sm text-gray-500 dark:text-white/50">
              <span>💰 <span className="text-green-500 dark:text-green-400 font-semibold">${earningsRow.earnings.toLocaleString()}</span> earned</span>
              {earningsRow.cpm !== null && (
                <span>📊 <span className={`font-semibold ${cpmColor(earningsRow.cpm)}`}>${earningsRow.cpm.toFixed(2)}</span> CPM</span>
              )}
              {earningsRow.payments > 0 && (
                <span>💳 {earningsRow.payments} payment{earningsRow.payments !== 1 ? "s" : ""}</span>
              )}
              {earningsRow.lastPaid && (
                <span>📅 Last paid {earningsRow.lastPaid}</span>
              )}
            </div>
          )}

          {/* ── TikTok Content ──────────────────────────────────────────────── */}
          {platform === "tiktok" && (
            <>
              {storeData?.authorMeta && <ProfileHeader meta={storeData.authorMeta} />}
              {error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 mb-6">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              {activeLoadState === "loading" && (
                <div className="flex items-center justify-center py-32 gap-3">
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                  <span className="text-sm text-gray-400 dark:text-white/40">Loading cached data...</span>
                </div>
              )}
              {activeLoadState === "idle" && (
                <div className="flex flex-col items-center justify-center py-32 gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] flex items-center justify-center">
                    <Search size={22} className="text-gray-300 dark:text-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-white/60 text-sm font-medium mb-1">No data yet for {activeCreator?.name ?? activeHandle}</p>
                    <p className="text-gray-400 dark:text-white/30 text-sm">Click &quot;New Posts&quot; to fetch their TikTok videos.</p>
                  </div>
                  <button
                    onClick={() => handleRun("new-posts")}
                    disabled={newPostsRunning}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {newPostsRunning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    {newPostsRunning ? "Syncing..." : `Fetch ${activeCreator?.name ?? activeHandle}'s videos`}
                  </button>
                </div>
              )}
              {(activeLoadState === "done" || (activeLoadState !== "loading" && activeLoadState !== "idle" && videos.length > 0)) && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Total Videos" value={totalVideos} />
                    <StatCard label="Total Views" value={fmt(totalViews)} />
                    <StatCard label="Avg Views/Video" value={fmt(avgViews)} />
                    <StatCard label="Total Likes" value={fmt(totalLikes)} />
                    <StatCard label="Total Comments" value={fmt(totalComments)} />
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-6 mb-8">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-white/70 mb-6">Views Per Video (last 30)</h2>
                    {ttChartData.length === 0 ? (
                      <p className="text-gray-300 dark:text-white/30 text-sm text-center py-8">No data</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={ttChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 10 }} axisLine={{ stroke: axisColor }} tickLine={false} />
                          <YAxis tickFormatter={fmt} tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                          <Tooltip content={<CustomTooltip videos={videos} />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                          <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1a1a1a]">
                      <h2 className="text-sm font-semibold text-gray-500 dark:text-white/70">All Videos ({totalVideos})</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-[#111] z-10">
                          <tr className="border-b border-gray-100 dark:border-[#1a1a1a]">
                            {["Date", "Caption", "Views", "Likes", "Comments", "Shares", ""].map((h, i) => (
                              <th key={i} className="text-left px-4 py-3 text-[11px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableVideos.map((v, i) => (
                            <tr key={v.id || i} className={["border-b border-gray-50 dark:border-[#1a1a1a] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors", i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-white/[0.01]"].join(" ")}>
                              <td className="px-4 py-3 text-gray-400 dark:text-white/40 whitespace-nowrap text-xs">{shortDate(v.postedAt)}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-white/70 max-w-xs"><span className="block truncate max-w-[280px]" title={v.caption}>{truncate(v.caption, 80)}</span></td>
                              <td className="px-4 py-3 text-gray-800 dark:text-white/80 whitespace-nowrap font-medium">{fmt(v.views || 0)}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">{fmt(v.likes || 0)}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">{fmt(v.comments || 0)}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">{fmt(v.shares || 0)}</td>
                              <td className="px-4 py-3">{v.url && (<a href={v.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-white/20 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"><ExternalLink size={14} /></a>)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Instagram Content ───────────────────────────────────────────── */}
          {platform === "instagram" && (
            <>
              {!activeIgHandle && (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Camera size={32} className="text-gray-300 dark:text-white/20" />
                  <p className="text-gray-500 dark:text-white/50 text-sm">No Instagram handle configured for this creator.</p>
                </div>
              )}
              {activeIgHandle && (
                <>
                  {igStoreData?.igAuthorMeta && <IgProfileHeader meta={igStoreData.igAuthorMeta} />}
                  {error && (
                    <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 mb-6">
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  {igLoadState === "loading" && (
                    <div className="flex items-center justify-center py-32 gap-3">
                      <Loader2 size={20} className="animate-spin text-blue-500" />
                      <span className="text-sm text-gray-400 dark:text-white/40">Loading cached data...</span>
                    </div>
                  )}
                  {igLoadState === "idle" && (
                    <div className="flex flex-col items-center justify-center py-32 gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] flex items-center justify-center">
                        <Camera size={22} className="text-gray-300 dark:text-white/20" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-white/60 text-sm font-medium mb-1">No Instagram data yet for {activeCreator?.name ?? activeHandle}</p>
                        <p className="text-gray-400 dark:text-white/30 text-sm">Click &quot;New Posts&quot; to fetch their Instagram posts.</p>
                      </div>
                      <button
                        onClick={() => handleRun("new-posts")}
                        disabled={newPostsRunning}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {newPostsRunning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        {newPostsRunning ? "Syncing..." : `Fetch ${activeCreator?.name ?? activeHandle}'s Instagram posts`}
                      </button>
                    </div>
                  )}
                  {(igLoadState === "done" || (igLoadState !== "loading" && igLoadState !== "idle" && posts.length > 0)) && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        <StatCard label="Total Posts" value={totalPosts} />
                        <StatCard label="Total Views" value={fmt(igTotalViews)} />
                        <StatCard label="Avg Views/Post" value={fmt(igAvgViews)} />
                        <StatCard label="Total Likes" value={fmt(igTotalLikes)} />
                        <StatCard label="Total Comments" value={fmt(igTotalComments)} />
                      </div>
                      <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-6 mb-8">
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-white/70 mb-6">Views Per Post (last 30)</h2>
                        {igChartData.length === 0 ? (
                          <p className="text-gray-300 dark:text-white/30 text-sm text-center py-8">No data</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={igChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 10 }} axisLine={{ stroke: axisColor }} tickLine={false} />
                              <YAxis tickFormatter={fmt} tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                              <Tooltip content={<IgTooltip posts={posts} />} cursor={{ fill: "rgba(236,72,153,0.06)" }} />
                              <Bar dataKey="views" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1a1a1a]">
                          <h2 className="text-sm font-semibold text-gray-500 dark:text-white/70">All Posts ({totalPosts})</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white dark:bg-[#111] z-10">
                              <tr className="border-b border-gray-100 dark:border-[#1a1a1a]">
                                {["Date", "Caption", "Type", "Views", "Likes", "Comments", ""].map((h, i) => (
                                  <th key={i} className="text-left px-4 py-3 text-[11px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tablePosts.map((p, i) => (
                                <tr key={p.id || i} className={["border-b border-gray-50 dark:border-[#1a1a1a] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors", i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-white/[0.01]"].join(" ")}>
                                  <td className="px-4 py-3 text-gray-400 dark:text-white/40 whitespace-nowrap text-xs">{shortDate(p.postedAt)}</td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-white/70 max-w-xs"><span className="block truncate max-w-[280px]" title={p.caption}>{truncate(p.caption, 80)}</span></td>
                                  <td className="px-4 py-3 text-gray-400 dark:text-white/40 whitespace-nowrap text-xs">{p.type || "—"}</td>
                                  <td className="px-4 py-3 text-gray-800 dark:text-white/80 whitespace-nowrap font-medium">{fmt(p.views || 0)}</td>
                                  <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">{fmt(p.likes || 0)}</td>
                                  <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">{fmt(p.comments || 0)}</td>
                                  <td className="px-4 py-3">{p.url && (<a href={p.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-white/20 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"><ExternalLink size={14} /></a>)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
