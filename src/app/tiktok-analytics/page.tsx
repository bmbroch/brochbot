"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Shell from "@/components/Shell";
import { useTheme } from "@/components/ThemeProvider";
import { TIKTOK_CREATORS } from "@/lib/tiktok-creators";
import { TikTokStoreData, TikTokVideo } from "@/lib/tiktok-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, RefreshCw, ExternalLink, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type LoadState = "loading" | "idle" | "done" | "error";
type ButtonMode = "new-posts" | "refresh-counts";
type RunState = "idle" | "running" | "done" | "error";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
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

function creatorName(handle: string): string {
  return TIKTOK_CREATORS.find((c) => c.handle === handle)?.name ?? handle;
}

function truncate(str: string, len: number): string {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-5 flex flex-col gap-1 hover:border-gray-300 dark:hover:border-[#333] transition-colors">
      <p className="text-xs text-gray-400 dark:text-white/40 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

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

// ─── Main Page ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;

export default function TikTokAnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeHandle, setActiveHandle] = useState<string>("sell.with.nick");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [storeData, setStoreData] = useState<TikTokStoreData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Per-button run state
  const [newPostsState, setNewPostsState] = useState<RunState>("idle");
  const [refreshState, setRefreshState] = useState<RunState>("idle");

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Load data from Supabase
  const loadData = useCallback(
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

  // Poll a running Apify job
  const startPolling = useCallback(
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
            // Update store data in-place from the response
            if (json.data) {
              setStoreData(json.data);
              setLoadState("done");
            }
          } else if (json.status === "FAILED") {
            stopPolling();
            setRunState("error");
            setError("Apify run failed. Try again.");
          }
          // RUNNING — keep polling
        } catch {
          // transient error — keep polling
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  // Trigger a button action
  const handleRun = useCallback(
    async (mode: ButtonMode) => {
      const setRunState = mode === "new-posts" ? setNewPostsState : setRefreshState;
      setRunState("running");
      setError(null);

      // First fetch = no existing videos → grab full history, no day limit
      const firstFetch = !storeData || storeData.videos.length === 0;

      try {
        const res = await fetch("/api/tiktok/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: activeHandle, mode, firstFetch }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to start run");
        startPolling(json.runId, activeHandle, mode);
      } catch (err) {
        setRunState("error");
        setError(String(err));
      }
    },
    [activeHandle, storeData, startPolling]
  );

  useEffect(() => {
    loadData(activeHandle);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHandle]);

  // Derived stats
  const videos = storeData?.videos ?? [];
  const totalVideos = videos.length;
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0);
  const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  // Chart colors based on theme
  const gridColor = isDark ? "#262626" : "#e5e7eb";
  const tickColor = isDark ? "#71717a" : "#9ca3af";
  const axisColor = isDark ? "#262626" : "#e5e7eb";
  const tooltipBg = isDark ? "#1a1a1a" : "#ffffff";
  const tooltipBorder = isDark ? "#333" : "#e5e7eb";
  const tooltipText = isDark ? "#ffffff" : "#111827";

  // Chart data — last 30 videos sorted oldest→newest
  const chartData = [...videos]
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime())
    .slice(-30)
    .map((v) => ({ date: shortDate(v.postedAt), views: v.views || 0 }));

  // Table data — newest first
  const tableVideos = [...videos].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  const newPostsRunning = newPostsState === "running";
  const refreshRunning = refreshState === "running";

  return (
    <Shell>
      <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.12 8.12 0 004.77 1.53V7.12a4.85 4.85 0 01-1-.43z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                TikTok Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-white/40">
              UGC creator performance — powered by Apify
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* New Posts */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRun("new-posts")}
                disabled={newPostsRunning || refreshRunning}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {newPostsRunning ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Search size={13} />
                )}
                {newPostsRunning ? "Syncing..." : "New Posts"}
              </button>
              <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap">
                · synced {timeAgo(storeData?.lastNewPostsSync ?? null)}
              </span>
            </div>

            {/* Refresh Counts */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRun("refresh-counts")}
                disabled={newPostsRunning || refreshRunning}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {refreshRunning ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                {refreshRunning ? "Refreshing..." : "Refresh Counts"}
              </button>
              <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap">
                · updated {timeAgo(storeData?.lastCountsRefresh ?? null)}
              </span>
            </div>
          </div>
        </div>

        {/* Creator Tabs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {TIKTOK_CREATORS.map((creator) => {
            const active = creator.handle === activeHandle;
            const disabled = !creator.handle;
            return (
              <button
                key={creator.name}
                onClick={() => {
                  if (creator.handle && !disabled) setActiveHandle(creator.handle);
                }}
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
                {disabled && (
                  <span className="ml-2 text-[10px] text-gray-300 dark:text-white/20 font-normal">
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loadState === "loading" && (
          <div className="flex items-center justify-center py-32 gap-3">
            <Loader2 size={20} className="animate-spin text-blue-500" />
            <span className="text-sm text-gray-400 dark:text-white/40">Loading cached data...</span>
          </div>
        )}

        {/* Empty state */}
        {loadState === "idle" && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] flex items-center justify-center">
              <Search size={22} className="text-gray-300 dark:text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-white/60 text-sm font-medium mb-1">
                No data yet for {creatorName(activeHandle)}
              </p>
              <p className="text-gray-400 dark:text-white/30 text-sm">
                Click &quot;New Posts&quot; to fetch their TikTok videos.
              </p>
            </div>
            <button
              onClick={() => handleRun("new-posts")}
              disabled={newPostsRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {newPostsRunning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              {newPostsRunning ? "Syncing..." : `Fetch ${creatorName(activeHandle)}'s videos`}
            </button>
          </div>
        )}

        {/* Data */}
        {(loadState === "done" || (loadState !== "loading" && loadState !== "idle" && videos.length > 0)) && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <StatCard label="Total Videos" value={totalVideos} />
              <StatCard label="Total Views" value={fmt(totalViews)} />
              <StatCard label="Avg Views/Video" value={fmt(avgViews)} />
              <StatCard label="Total Likes" value={fmt(totalLikes)} />
              <StatCard label="Total Comments" value={fmt(totalComments)} />
            </div>

            {/* Chart */}
            <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-white/70 mb-6">
                Views Per Video (last 30)
              </h2>
              {chartData.length === 0 ? (
                <p className="text-gray-300 dark:text-white/30 text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: tickColor, fontSize: 10 }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmt}
                      tick={{ fill: tickColor, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip
                      content={<CustomTooltip videos={videos} />}
                      cursor={{ fill: "rgba(59,130,246,0.06)" }}
                    />
                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Video table */}
            <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1a1a1a]">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-white/70">
                  All Videos ({totalVideos})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-[#111] z-10">
                    <tr className="border-b border-gray-100 dark:border-[#1a1a1a]">
                      {["Date", "Caption", "Views", "Likes", "Comments", "Shares", ""].map(
                        (h, i) => (
                          <th
                            key={i}
                            className="text-left px-4 py-3 text-[11px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tableVideos.map((v, i) => (
                      <tr
                        key={v.id || i}
                        className={[
                          "border-b border-gray-50 dark:border-[#1a1a1a] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors",
                          i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-white/[0.01]",
                        ].join(" ")}
                      >
                        <td className="px-4 py-3 text-gray-400 dark:text-white/40 whitespace-nowrap text-xs">
                          {shortDate(v.postedAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-white/70 max-w-xs">
                          <span
                            className="block truncate max-w-[280px]"
                            title={v.caption}
                          >
                            {truncate(v.caption, 80)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-white/80 whitespace-nowrap font-medium">
                          {fmt(v.views || 0)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">
                          {fmt(v.likes || 0)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">
                          {fmt(v.comments || 0)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-white/60 whitespace-nowrap">
                          {fmt(v.shares || 0)}
                        </td>
                        <td className="px-4 py-3">
                          {v.url && (
                            <a
                              href={v.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 dark:text-white/20 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
