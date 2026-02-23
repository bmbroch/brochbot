"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { creatorColors } from "@/lib/data-provider";
import { formatDate } from "@/lib/utils";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return n.toLocaleString();
}

const darkTooltipStyle = {
  contentStyle: { backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
  itemStyle: { color: "#e4e4e7" },
};

function PlatformBadge({ platform }: { platform: "tiktok" | "instagram" }) {
  if (platform === "tiktok") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        TikTok
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
      IG
    </span>
  );
}

function getCutoff(range: DateRange): Date | null {
  if (range === "All") return null;
  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorDetailPage() {
  const params = useParams();
  const nameParam = typeof params.name === "string" ? params.name.toLowerCase() : "";

  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("All");

  useEffect(() => {
    fetch("/creator-data.json")
      .then(r => r.json())
      .then((data: Record<string, CreatorData>) => {
        const found = data[nameParam];
        if (found) {
          setCreator(found);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [nameParam]);

  // Date cutoff
  const cutoff = useMemo(() => getCutoff(dateRange), [dateRange]);

  // Filtered posts (respects date range)
  const filteredPosts = useMemo(() => {
    if (!creator) return [];
    const filtered = creator.posts_detail.filter(p => {
      if (dateRange === "All") return true;
      if (!p.date) return false;
      return new Date(p.date) >= cutoff!;
    });
    return [...filtered].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
  }, [creator, dateRange, cutoff]);

  // Time series built from filteredPosts
  const timeSeries = useMemo(() => {
    const tsMap: Record<string, { ttViews: number; igViews: number }> = {};
    filteredPosts.forEach(p => {
      if (!p.date) return;
      if (!tsMap[p.date]) tsMap[p.date] = { ttViews: 0, igViews: 0 };
      if (p.platform === "tiktok") tsMap[p.date].ttViews += p.views;
      else tsMap[p.date].igViews += p.views;
    });
    return Object.entries(tsMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPosts]);

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-zinc-500 p-8 justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </Shell>
    );
  }

  if (notFound || !creator) {
    return (
      <Shell>
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <p className="text-zinc-500">Creator not found.</p>
          <Link href="/creators" className="text-blue-400 text-sm mt-2 inline-block">← Creators</Link>
        </div>
      </Shell>
    );
  }

  const color = creatorColors[creator.name] || "#3b82f6";

  // Stats derived from filtered posts
  const ttViews   = filteredPosts.filter(p => p.platform === "tiktok").reduce((s, p) => s + p.views, 0);
  const igViews   = filteredPosts.filter(p => p.platform === "instagram").reduce((s, p) => s + p.views, 0);
  const total     = ttViews + igViews;
  const postCount = filteredPosts.length;
  const avgPerPost = postCount > 0 ? Math.round(total / postCount) : 0;
  const bestPost  = filteredPosts.filter(p => p.views).reduce((max, p) => Math.max(max, p.views), 0);

  const ttPct = total > 0 ? Math.round((ttViews / total) * 100) : 50;
  const igPct = 100 - ttPct;

  // Line chart data from time series
  const lineData = timeSeries.map(p => ({
    date: p.date.slice(5),
    total: p.ttViews + p.igViews,
    TikTok: p.ttViews,
    Instagram: p.igViews,
  }));

  // Pie chart (always uses full creator totals for split — filtered would skew it on short ranges)
  const pieData = [
    { name: "TikTok", value: ttViews, color: "#06b6d4" },
    { name: "Instagram", value: igViews, color: "#a855f7" },
  ];

  const pillBase = "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer";
  const pillActive = "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100";
  const pillInactive = "border border-zinc-700/50 text-zinc-500 hover:border-zinc-500";

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

        {/* Back link */}
        <Link href="/creators" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-mc-secondary transition-colors mb-5">
          ← Creators
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: `${color}20`, color }}>
            {creator.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{creator.name}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
              <span>Started {formatDate(creator.startDate)}</span>
              <span>·</span>
              <span className="text-green-400">${creator.earnings.toLocaleString()} earned</span>
              {creator.paymentCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-zinc-500">{creator.paymentCount} payments</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Date range filter */}
        <div className="flex items-center gap-1.5 mb-6">
          {(["7D", "30D", "90D", "All"] as DateRange[]).map(r => (
            <button key={r} onClick={() => setDateRange(r)} className={`${pillBase} ${dateRange === r ? pillActive : pillInactive}`}>{r}</button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Total Posts",    value: String(postCount) },
            { label: "TikTok Views",   value: fmt(ttViews) },
            { label: "IG Views",       value: fmt(igViews) },
            { label: "Avg Views/Post", value: fmt(avgPerPost) },
            { label: "Best Post",      value: bestPost > 0 ? fmt(bestPost) : "—" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-mc-card border border-mc-medium hover:border-mc-strong transition-all duration-200">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Views Chart */}
          <div className="lg:col-span-2 rounded-xl bg-mc-card border border-mc-medium p-5">
            <h2 className="text-sm font-semibold mb-4">Views Over Time</h2>
            {lineData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-zinc-600 text-sm">No posts in this range</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#262626" }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#262626" }} tickFormatter={fmt} />
                  <Tooltip {...darkTooltipStyle} formatter={(value) => fmt(Number(value))} />
                  <Line type="monotone" dataKey="TikTok" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Instagram" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Platform Split */}
          <div className="rounded-xl bg-mc-card border border-mc-medium p-5 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold mb-4">Platform Split</h2>
            {total === 0 ? (
              <div className="text-zinc-600 text-sm">No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} formatter={(value) => fmt(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> TikTok {ttPct}%</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> IG {igPct}%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div className="rounded-xl bg-mc-card border border-mc-medium overflow-hidden">
          <div className="px-5 py-4 border-b border-mc-medium">
            <h2 className="text-sm font-semibold">Posts ({filteredPosts.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-zinc-500 uppercase tracking-wider border-b border-mc-medium">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-center px-4 py-3 font-medium">Platform</th>
                  <th className="text-right px-5 py-3 font-medium">Views</th>
                  <th className="text-right px-5 py-3 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p, i) => (
                  <tr key={i} className="border-b border-mc-subtle hover:bg-mc-hover transition-colors">
                    <td className="px-5 py-2.5 text-zinc-400 text-xs">
                      {p.date ? formatDate(p.date) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PlatformBadge platform={p.platform} />
                    </td>
                    <td className="px-5 py-2.5 text-right font-semibold">
                      {fmt(p.views)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors text-xs">↗</a>
                      ) : (
                        <span className="text-mc-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-600 text-sm">
                      No posts in this date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Shell>
  );
}
