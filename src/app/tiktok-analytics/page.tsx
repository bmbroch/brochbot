"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Shell from "@/components/Shell";
import { TIKTOK_CREATORS } from "@/lib/tiktok-creators";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TikTokVideo {
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  createTimeISO: string;
  webVideoUrl: string;
  text: string;
}

type LoadState = "idle" | "starting" | "polling" | "fetching" | "done" | "error";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#111] border border-[#222] p-5 flex flex-col gap-1 hover:border-[#333] transition-colors">
      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />
  );
}

function LoadingSkeleton({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <p className="text-white/50 text-sm">{label ?? "Fetching TikTok data..."}</p>
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="font-semibold">{fmt(payload[0].value)} views</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1_000;

export default function TikTokAnalyticsPage() {
  const [activeHandle, setActiveHandle] = useState<string>("sell.with.nick");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Fetch results from dataset
  const fetchResults = useCallback(async (datasetId: string) => {
    setLoadState("fetching");
    try {
      const res = await fetch(`/api/tiktok/results/${datasetId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch results");
      setVideos(json.items ?? []);
      setLastFetched(json.lastFetched ?? Date.now());
      setLoadState("done");
    } catch (err) {
      setError(String(err));
      setLoadState("error");
    }
  }, []);

  // Poll status until done
  const startPolling = useCallback(
    (runId: string, datasetId: string) => {
      setLoadState("polling");
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/tiktok/status/${runId}`);
          const json = await res.json();
          const s: string = json.status;
          if (s === "SUCCEEDED") {
            stopPolling();
            await fetchResults(datasetId);
          } else if (s === "FAILED" || s === "ABORTED" || s === "TIMED-OUT") {
            stopPolling();
            setError("Apify run failed or was aborted.");
            setLoadState("error");
          }
        } catch {
          // keep polling
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, fetchResults]
  );

  // Start a new scrape
  const startScrape = useCallback(
    async (handle: string) => {
      setError(null);
      setLoadState("starting");
      try {
        const res = await fetch("/api/tiktok/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to start scrape");
        if (json.status === "running" && json.runId) {
          startPolling(json.runId, json.datasetId);
        }
      } catch (err) {
        setError(String(err));
        setLoadState("error");
      }
    },
    [startPolling]
  );

  // Load data for a handle (check cache first)
  const loadHandle = useCallback(
    async (handle: string) => {
      stopPolling();
      setVideos([]);
      setError(null);
      setLoadState("starting");

      try {
        const res = await fetch(`/api/tiktok/run?handle=${encodeURIComponent(handle)}`);
        const json = await res.json();

        if (json.status === "succeeded" && json.data && json.lastFetched) {
          const age = Date.now() - json.lastFetched;
          if (age < CACHE_MAX_AGE_MS) {
            setVideos(json.data);
            setLastFetched(json.lastFetched);
            setLoadState("done");
            return;
          }
        }

        if (json.status === "running" && json.runId) {
          startPolling(json.runId, json.datasetId);
          return;
        }

        // No fresh cache → start a new scrape
        await startScrape(handle);
      } catch (err) {
        setError(String(err));
        setLoadState("error");
      }
    },
    [stopPolling, startPolling, startScrape]
  );

  // On mount / handle change
  useEffect(() => {
    loadHandle(activeHandle);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHandle]);

  const handleRefresh = () => startScrape(activeHandle);

  // Derived stats
  const totalVideos = videos.length;
  const totalViews = videos.reduce((s, v) => s + (v.playCount || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.diggCount || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.commentCount || 0), 0);
  const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  // Chart data — last 30 videos sorted oldest→newest
  const sorted = [...videos]
    .sort((a, b) => new Date(a.createTimeISO).getTime() - new Date(b.createTimeISO).getTime())
    .slice(-30)
    .map((v) => ({
      date: shortDate(v.createTimeISO),
      views: v.playCount || 0,
    }));

  const isLoading = loadState === "starting" || loadState === "polling" || loadState === "fetching";
  const loadingLabel =
    loadState === "starting"
      ? "Starting Apify run..."
      : loadState === "polling"
      ? "Scraping TikTok data..."
      : "Fetching results...";

  return (
    <Shell>
      <div className="min-h-full bg-[#0a0a0a] p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* TikTok-style icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.12 8.12 0 004.77 1.53V7.12a4.85 4.85 0 01-1-.43z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">TikTok Analytics</h1>
            </div>
            <p className="text-sm text-white/40">UGC creator performance — powered by Apify</p>
          </div>

          <div className="flex items-center gap-3">
            {lastFetched && !isLoading && (
              <span className="text-xs text-white/30">Updated {timeAgo(lastFetched)}</span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] border border-[#222] text-sm text-white/70 hover:text-white hover:border-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isLoading ? "animate-spin" : ""}
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0115-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 01-15 6.7L3 16" />
              </svg>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
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
                    ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                    : disabled
                    ? "bg-transparent border-[#1a1a1a] text-white/20 cursor-not-allowed"
                    : "bg-[#111] border-[#222] text-white/50 hover:text-white hover:border-[#333]",
                ].join(" ")}
              >
                {creator.name}
                {disabled && (
                  <span className="ml-2 text-[10px] text-white/20 font-normal">soon</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && <LoadingSkeleton label={loadingLabel} />}

        {/* Error */}
        {!isLoading && loadState === "error" && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="text-red-400 text-sm">{error ?? "Something went wrong."}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-xs text-white/50 hover:text-white transition-colors underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Data */}
        {!isLoading && loadState === "done" && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <StatCard label="Total Videos" value={totalVideos} />
              <StatCard label="Total Views" value={fmt(totalViews)} />
              <StatCard label="Total Likes" value={fmt(totalLikes)} />
              <StatCard label="Total Comments" value={fmt(totalComments)} />
              <StatCard label="Avg Views/Video" value={fmt(avgViews)} />
            </div>

            {/* Chart */}
            <div className="rounded-2xl bg-[#111] border border-[#222] p-6 mb-8">
              <h2 className="text-sm font-semibold text-white/70 mb-6">Views Per Video (last 30)</h2>
              {sorted.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={sorted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#555", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmt}
                      tick={{ fill: "#555", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Video table */}
            <div className="rounded-2xl bg-[#111] border border-[#222] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a1a1a]">
                <h2 className="text-sm font-semibold text-white/70">All Videos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      {["Date", "Caption", "Views", "Likes", "Comments", "Shares", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...videos]
                      .sort(
                        (a, b) =>
                          new Date(b.createTimeISO).getTime() - new Date(a.createTimeISO).getTime()
                      )
                      .map((v, i) => (
                        <tr
                          key={i}
                          className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">
                            {shortDate(v.createTimeISO)}
                          </td>
                          <td className="px-4 py-3 text-white/70 max-w-xs">
                            <span
                              className="block truncate"
                              title={v.text}
                            >
                              {v.text || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/80 whitespace-nowrap font-medium">
                            {fmt(v.playCount || 0)}
                          </td>
                          <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                            {fmt(v.diggCount || 0)}
                          </td>
                          <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                            {fmt(v.commentCount || 0)}
                          </td>
                          <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                            {fmt(v.shareCount || 0)}
                          </td>
                          <td className="px-4 py-3">
                            {v.webVideoUrl && (
                              <a
                                href={v.webVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/30 hover:text-blue-400 transition-colors"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
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

        {/* Idle skeleton (before first load) */}
        {loadState === "idle" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        )}
      </div>
    </Shell>
  );
}
