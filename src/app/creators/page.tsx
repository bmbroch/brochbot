"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAllCreatorsTimeSeries, creatorColors } from "@/lib/data-provider";
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreatorsPage() {
  const { theme } = useTheme();
  const [creatorsMap, setCreatorsMap] = useState<Record<string, CreatorData> | null>(null);
  const [enabledCreators, setEnabledCreators] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const creatorsTimeSeries = useAllCreatorsTimeSeries();

  // Theme-aware chart tooltip styles
  const tooltipStyle = theme === "dark"
    ? {
        contentStyle: { backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 },
        labelStyle: { color: "#a1a1aa" },
        itemStyle: { color: "#e4e4e7" },
      }
    : {
        contentStyle: { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        labelStyle: { color: "#6b7280" },
        itemStyle: { color: "#374151" },
      };

  // Grid stroke color for charts
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

  const creators: CreatorData[] = creatorsMap
    ? Object.values(creatorsMap).sort((a, b) => (b.ttViews + b.igViews) - (a.ttViews + a.igViews))
    : [];

  const totalPosts = creators.reduce((s, c) => s + c.posts, 0);
  const totalViews = creators.reduce((s, c) => s + c.ttViews + c.igViews, 0);
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  function getCreatorCpm(c: CreatorData): number | null {
    const views = c.ttViews + c.igViews;
    if (!views || !c.earnings) return null;
    return (c.earnings / views) * 1000;
  }

  const bestCpmCreator = creators.reduce<{ name: string; cpm: number } | null>((best, c) => {
    const cpm = getCreatorCpm(c);
    if (cpm === null) return best;
    if (!best || cpm < best.cpm) return { name: c.name, cpm };
    return best;
  }, null);

  // Chart data
  const allDatesMap: Record<string, boolean> = {};
  creators.forEach(c => {
    if (enabledCreators[c.name]) {
      creatorsTimeSeries[c.name]?.forEach(p => { allDatesMap[p.date] = true; });
    }
  });
  const dates = Object.keys(allDatesMap).sort();

  const lineChartData = dates.map(date => {
    const point: Record<string, string | number> = { date: date.slice(5) };
    creators.forEach(c => {
      if (!enabledCreators[c.name]) return;
      const ts = creatorsTimeSeries[c.name] || [];
      const match = ts.find(p => p.date === date);
      if (match) point[c.name] = match.ttViews + match.igViews;
    });
    return point;
  });

  const barData = creators.map(c => ({
    name: c.name,
    TikTok: c.ttViews,
    Instagram: c.igViews,
  }));

  const toggle = (name: string) => {
    setEnabledCreators(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Time-ago for lastUpdated
  function timeAgo(iso: string): string {
    const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
    if (diffH < 1) return "just now";
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  }

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Creators</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">UGC creator performance dashboard</p>
          </div>
          {lastUpdated && (
            <p className="text-[11px] text-[var(--text-faint)] shrink-0">synced {timeAgo(lastUpdated)}</p>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Creators" value={String(creators.length)} sub="Active" />
          <StatCard label="Total Posts" value={String(totalPosts)} sub="All platforms" />
          <StatCard label="Total Views" value={fmt(totalViews)} sub="TikTok + Instagram" />
          <StatCard label="Avg Views/Post" value={fmt(avgViews)} />
          {bestCpmCreator
            ? <StatCard label="Best CPM" value={`${bestCpmCreator.name} · $${bestCpmCreator.cpm.toFixed(2)}`} sub="cost per 1K views" />
            : <StatCard label="Best CPM" value="—" sub="cost per 1K views" />}
        </div>

        {/* Loading state */}
        {!creatorsMap && (
          <div className="flex items-center gap-3 text-[var(--text-muted)] py-12 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--text-muted)] animate-spin" />
            <span className="text-sm">Loading creator data...</span>
          </div>
        )}

        {/* Leaderboard */}
        {creatorsMap && (
          <>
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
                      <th className="text-right px-5 py-3 font-medium">Posts</th>
                      <th className="text-right px-5 py-3 font-medium"><span className="text-cyan-500 dark:text-cyan-400">TikTok</span></th>
                      <th className="text-right px-5 py-3 font-medium"><span className="text-pink-500 dark:text-pink-400">Instagram</span></th>
                      <th className="text-right px-5 py-3 font-medium">Total Views</th>
                      <th className="text-right px-5 py-3 font-medium">Avg/Post</th>
                      <th className="text-right px-5 py-3 font-medium">Earnings</th>
                      <th className="text-right px-5 py-3 font-medium">CPM</th>
                      <th className="text-center px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map((c, i) => {
                      const total = c.ttViews + c.igViews;
                      const dominant = c.igViews > c.ttViews ? "ig" : "tt";
                      const cpm = getCreatorCpm(c);
                      return (
                        <tr
                          key={c.name}
                          className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
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
                          <td className="px-5 py-3 text-right"><span className="text-cyan-500 dark:text-cyan-400">{fmt(c.ttViews)}</span></td>
                          <td className="px-5 py-3 text-right"><span className="text-pink-500 dark:text-pink-400">{fmt(c.igViews)}</span></td>
                          <td className="px-5 py-3 text-right font-semibold text-[var(--text-primary)]">{fmt(total)}</td>
                          <td className="px-5 py-3 text-right text-[var(--text-secondary)]">{fmt(c.avgPerPost)}</td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-green-500 dark:text-green-400 font-semibold">${c.earnings.toLocaleString()}</span>
                            {c.paymentCount > 0 && (
                              <span className="block text-[10px] text-[var(--text-muted)]">{c.paymentCount} payments</span>
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
                  {creators.map(c => (
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
                  {creators.filter(c => enabledCreators[c.name]).map(c => (
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
                  <Bar dataKey="TikTok" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Instagram" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
