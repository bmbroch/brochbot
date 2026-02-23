"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { creatorColors } from "@/lib/data-provider";
import { useTheme } from "@/components/ThemeProvider";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

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

type DateRange = "7D" | "30D" | "90D" | "All";
type Platform = "All" | "TikTok" | "Instagram";
type SortCol = "posts" | "ttViews" | "igViews" | "total" | "avgPerPost" | "earnings" | "cpm";
type SortDir = "asc" | "desc";

interface CreatorStats {
  name: string;
  posts: number;
  ttViews: number;
  igViews: number;
  avgPerPost: number;
  earnings: number;
  paymentCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return n.toLocaleString();
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="p-5 rounded-xl border border-[var(--border-medium)] hover:border-[var(--border-strong)] transition-all duration-200"
      style={{ background: "var(--bg-card)" }}
    >
      <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

function cpmColor(cpm: number): string {
  if (cpm < 3) return "text-green-500 dark:text-green-400";
  if (cpm <= 10) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function getCutoff(range: DateRange): Date | null {
  if (range === "All") return null;
  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeStats(creator: CreatorData, cutoff: Date | null): CreatorStats {
  const filtered = creator.posts_detail.filter(p => {
    if (!p.date) return false;
    if (!cutoff) return true;
    return new Date(p.date) >= cutoff;
  });
  const ttViews = filtered.filter(p => p.platform === "tiktok").reduce((s, p) => s + p.views, 0);
  const igViews = filtered.filter(p => p.platform === "instagram").reduce((s, p) => s + p.views, 0);
  const posts = filtered.length;
  const avgPerPost = posts > 0 ? Math.round((ttViews + igViews) / posts) : 0;
  return { name: creator.name, posts, ttViews, igViews, avgPerPost, earnings: creator.earnings, paymentCount: creator.paymentCount };
}

function buildTsMap(creator: CreatorData, cutoff: Date | null): Record<string, { ttViews: number; igViews: number }> {
  const map: Record<string, { ttViews: number; igViews: number }> = {};
  creator.posts_detail.forEach(p => {
    if (!p.date) return;
    if (cutoff && new Date(p.date) < cutoff) return;
    if (!map[p.date]) map[p.date] = { ttViews: 0, igViews: 0 };
    if (p.platform === "tiktok") map[p.date].ttViews += p.views;
    else map[p.date].igViews += p.views;
  });
  return map;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreatorsPage() {
  const { theme } = useTheme();
  const [creatorsMap, setCreatorsMap] = useState<Record<string, CreatorData> | null>(null);
  const [enabledCreators, setEnabledCreators] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filter / sort state
  const [dateRange, setDateRange] = useState<DateRange>("All");
  const [platform, setPlatform] = useState<Platform>("All");
  const [sortCol, setSortCol] = useState<SortCol>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Theme-aware chart colours
  const tooltipStyle = theme === "dark"
    ? { contentStyle: { backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "#a1a1aa" }, itemStyle: { color: "#e4e4e7" } }
    : { contentStyle: { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }, labelStyle: { color: "#6b7280" }, itemStyle: { color: "#374151" } };
  const gridColor = theme === "dark" ? "#262626" : "#e5e7eb";
  const tickColor = theme === "dark" ? "#71717a" : "#9ca3af";
  const axisColor = theme === "dark" ? "#262626" : "#e5e7eb";
  const yLabelColor = theme === "dark" ? "#e4e4e7" : "#374151";

  useEffect(() => {
    fetch("/creator-data.json")
      .then(r => r.json())
      .then((data: Record<string, CreatorData | string>) => {
        const { lastUpdated: lu, ...rest } = data as Record<string, CreatorData & { lastUpdated?: string }>;
        const map = rest as Record<string, CreatorData>;
        setCreatorsMap(map);
        setLastUpdated(lu as unknown as string ?? null);
        const enabled: Record<string, boolean> = {};
        Object.values(map).forEach(c => { enabled[c.name] = true; });
        setEnabledCreators(enabled);
      })
      .catch(err => console.error("Failed to load creator-data.json", err));
  }, []);

  // Stable array from creatorsMap
  const allCreators = useMemo<CreatorData[]>(
    () => (creatorsMap ? Object.values(creatorsMap) : []),
    [creatorsMap]
  );

  // Date cutoff (memoised so it doesn't create a new Date object every render)
  const cutoff = useMemo(() => getCutoff(dateRange), [dateRange]);

  // Per-creator stats with date filter applied
  const creatorStats = useMemo(
    () => allCreators.map(c => computeStats(c, cutoff)),
    [allCreators, cutoff]
  );

  // Sort helpers
  function getCreatorCpm(s: CreatorStats): number | null {
    const views = s.ttViews + s.igViews;
    if (!views || !s.earnings) return null;
    return (s.earnings / views) * 1000;
  }

  function sortVal(s: CreatorStats): number {
    switch (sortCol) {
      case "posts":      return s.posts;
      case "ttViews":    return s.ttViews;
      case "igViews":    return s.igViews;
      case "total":      return s.ttViews + s.igViews;
      case "avgPerPost": return s.avgPerPost;
      case "earnings":   return s.earnings;
      case "cpm":        return getCreatorCpm(s) ?? -1;
    }
  }

  const sortedCreators = useMemo(
    () => [...creatorStats].sort((a, b) => sortDir === "desc" ? sortVal(b) - sortVal(a) : sortVal(a) - sortVal(b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [creatorStats, sortCol, sortDir]
  );

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  function SortInd({ col }: { col: SortCol }) {
    if (sortCol !== col) return <span className="opacity-25 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "desc" ? "▼" : "▲"}</span>;
  }

  // Aggregate totals for stat cards
  const totalPosts  = creatorStats.reduce((s, c) => s + c.posts, 0);
  const totalTT     = creatorStats.reduce((s, c) => s + c.ttViews, 0);
  const totalIG     = creatorStats.reduce((s, c) => s + c.igViews, 0);
  const totalViews  = platform === "TikTok" ? totalTT : platform === "Instagram" ? totalIG : totalTT + totalIG;
  const avgViews    = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  const bestCpm = creatorStats.reduce<{ name: string; cpm: number } | null>((best, c) => {
    const cpm = getCreatorCpm(c);
    if (cpm === null) return best;
    if (!best || cpm < best.cpm) return { name: c.name, cpm };
    return best;
  }, null);

  // Line chart — built from posts_detail, respects date range + platform filter
  const lineChartData = useMemo(() => {
    // Pre-build per-creator date maps
    const tsMaps: Record<string, Record<string, { ttViews: number; igViews: number }>> = {};
    const allDates = new Set<string>();
    allCreators.forEach(c => {
      if (!enabledCreators[c.name]) return;
      const m = buildTsMap(c, cutoff);
      tsMaps[c.name] = m;
      Object.keys(m).forEach(d => allDates.add(d));
    });
    const dates = Array.from(allDates).sort();
    return dates.map(date => {
      const point: Record<string, string | number> = { date: date.slice(5) };
      allCreators.forEach(c => {
        if (!enabledCreators[c.name]) return;
        const d = tsMaps[c.name]?.[date];
        if (d) {
          point[c.name] = platform === "TikTok" ? d.ttViews : platform === "Instagram" ? d.igViews : d.ttViews + d.igViews;
        }
      });
      return point;
    });
  }, [allCreators, enabledCreators, cutoff, platform]);

  // Bar chart data (respects date range)
  const barData = useMemo(() => creatorStats.map(c => ({
    name: c.name,
    TikTok: c.ttViews,
    Instagram: c.igViews,
  })), [creatorStats]);

  const toggle = (name: string) => setEnabledCreators(prev => ({ ...prev, [name]: !prev[name] }));

  function timeAgo(iso: string): string {
    const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
    if (diffH < 1) return "just now";
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  }

  const showTT = platform !== "Instagram";
  const showIG = platform !== "TikTok";

  const pillBase = "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer";
  const pillActive = "bg-[var(--text-primary)] text-[var(--bg-primary)]";
  const pillInactive = "border border-[var(--border-medium)] text-[var(--text-muted)] hover:border-[var(--border-strong)]";

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Creators</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">UGC creator performance dashboard</p>
          </div>
          {lastUpdated && (
            <p className="text-[11px] text-[var(--text-faint)] shrink-0">synced {timeAgo(lastUpdated)}</p>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Date range pills */}
          <div className="flex items-center gap-1.5">
            {(["7D", "30D", "90D", "All"] as DateRange[]).map(r => (
              <button key={r} onClick={() => setDateRange(r)} className={`${pillBase} ${dateRange === r ? pillActive : pillInactive}`}>{r}</button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[var(--border-medium)]" />

          {/* Platform pills */}
          <div className="flex items-center gap-1.5">
            {(["All", "TikTok", "Instagram"] as Platform[]).map(p => (
              <button key={p} onClick={() => setPlatform(p)} className={`${pillBase} ${platform === p ? pillActive : pillInactive}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Creators" value={String(allCreators.length)} sub="Active" />
          <StatCard label="Total Posts" value={String(totalPosts)} sub={dateRange === "All" ? "All platforms" : `Last ${dateRange}`} />
          <StatCard label="Total Views" value={fmt(totalViews)} sub={platform === "All" ? "TikTok + Instagram" : platform} />
          <StatCard label="Avg Views/Post" value={fmt(avgViews)} />
          {bestCpm
            ? <StatCard label="Best CPM" value={`${bestCpm.name} · $${bestCpm.cpm.toFixed(2)}`} sub="cost per 1K views" />
            : <StatCard label="Best CPM" value="—" sub="cost per 1K views" />}
        </div>

        {/* Loading state */}
        {!creatorsMap && (
          <div className="flex items-center gap-3 text-[var(--text-muted)] py-12 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--text-muted)] animate-spin" />
            <span className="text-sm">Loading creator data...</span>
          </div>
        )}

        {/* Main content */}
        {creatorsMap && (
          <>
            {/* Leaderboard */}
            <div
              className="rounded-xl border overflow-hidden mb-8"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)" }}
            >
              <div className="px-5 py-4 border-b border-[var(--border-medium)]">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Leaderboard</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-medium)]">
                      <th className="text-left px-5 py-3 font-medium">#</th>
                      <th className="text-left px-5 py-3 font-medium">Creator</th>
                      <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("posts")}>
                        Posts<SortInd col="posts" />
                      </th>
                      {showTT && (
                        <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("ttViews")}>
                          <span className="text-cyan-500 dark:text-cyan-400">TikTok</span><SortInd col="ttViews" />
                        </th>
                      )}
                      {showIG && (
                        <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("igViews")}>
                          <span className="text-pink-500 dark:text-pink-400">Instagram</span><SortInd col="igViews" />
                        </th>
                      )}
                      <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("total")}>
                        Total Views<SortInd col="total" />
                      </th>
                      <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("avgPerPost")}>
                        Avg/Post<SortInd col="avgPerPost" />
                      </th>
                      <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("earnings")}>
                        Earnings<SortInd col="earnings" />
                      </th>
                      <th className="text-right px-5 py-3 font-medium cursor-pointer select-none hover:text-[var(--text-primary)]" onClick={() => handleSort("cpm")}>
                        CPM<SortInd col="cpm" />
                      </th>
                      <th className="text-center px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCreators.map((c, i) => {
                      const total = c.ttViews + c.igViews;
                      const displayTotal = platform === "TikTok" ? c.ttViews : platform === "Instagram" ? c.igViews : total;
                      const dominant = c.igViews > c.ttViews ? "ig" : "tt";
                      const cpm = getCreatorCpm(c);
                      return (
                        <tr key={c.name} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                          <td className="px-5 py-3 text-[var(--text-muted)] font-mono">{i + 1}</td>
                          <td className="px-5 py-3">
                            <Link href={`/creators/${c.name.toLowerCase()}`} className="flex items-center gap-2 hover:text-blue-500 transition-colors text-[var(--text-primary)]">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${creatorColors[c.name]}20`, color: creatorColors[c.name] }}>
                                {c.name[0]}
                              </div>
                              <span className="font-medium">{c.name}</span>
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-right text-[var(--text-secondary)]">{c.posts}</td>
                          {showTT && <td className="px-5 py-3 text-right"><span className="text-cyan-500 dark:text-cyan-400">{fmt(c.ttViews)}</span></td>}
                          {showIG && <td className="px-5 py-3 text-right"><span className="text-pink-500 dark:text-pink-400">{fmt(c.igViews)}</span></td>}
                          <td className="px-5 py-3 text-right font-semibold text-[var(--text-primary)]">{fmt(displayTotal)}</td>
                          <td className="px-5 py-3 text-right text-[var(--text-secondary)]">{fmt(c.avgPerPost)}</td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-green-500 dark:text-green-400 font-semibold">${c.earnings.toLocaleString()}</span>
                            {c.paymentCount > 0 && (
                              <span className="block text-[10px] text-[var(--text-muted)]">{c.paymentCount} payment{c.paymentCount !== 1 ? "s" : ""}</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-mono">
                            {cpm !== null
                              ? <span className={cpmColor(cpm)}>${cpm.toFixed(2)}</span>
                              : <span className="text-[var(--text-faint)]">—</span>}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${dominant === "ig" ? "bg-pink-500/10 text-pink-500 dark:text-pink-400" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"}`}>
                              {dominant === "ig" ? "IG dominant" : "TT dominant"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Views Over Time Chart */}
            <div
              className="rounded-xl border p-5 mb-8"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Views Over Time</h2>
                <div className="flex flex-wrap gap-2">
                  {allCreators.map(c => (
                    <button
                      key={c.name}
                      onClick={() => toggle(c.name)}
                      className={`text-[11px] px-2 py-1 rounded-full border transition-all ${enabledCreators[c.name] ? "border-transparent" : "border-[var(--border-medium)] opacity-40"}`}
                      style={enabledCreators[c.name] ? { backgroundColor: `${creatorColors[c.name]}20`, color: creatorColors[c.name] } : { color: "var(--text-muted)" }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={{ stroke: axisColor }} />
                  <YAxis tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={{ stroke: axisColor }} tickFormatter={fmt} />
                  <Tooltip {...tooltipStyle} formatter={(value) => fmt(Number(value))} />
                  {allCreators.filter(c => enabledCreators[c.name]).map(c => (
                    <Line key={c.name} type="monotone" dataKey={c.name} stroke={creatorColors[c.name]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Comparison */}
            <div
              className="rounded-xl border p-5"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)" }}
            >
              <h2 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">Platform Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
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
          </>
        )}
      </div>
    </Shell>
  );
}
