"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { creatorsTimeSeries, creatorColors } from "@/lib/data-provider";
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorDetailPage() {
  const params = useParams();
  const nameParam = typeof params.name === "string" ? params.name.toLowerCase() : "";

  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
          <Link href="/creators" className="text-blue-400 text-sm mt-2 inline-block">← Back to Creators</Link>
        </div>
      </Shell>
    );
  }

  const total = creator.ttViews + creator.igViews;
  const ts = creatorsTimeSeries[creator.name] || [];
  const color = creatorColors[creator.name] || "#3b82f6";

  // Use posts_detail sorted newest-first (Mia sorted them, but skip null-date posts to bottom)
  const posts = [...creator.posts_detail].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  const bestPost = posts.filter(p => p.views).reduce((max, p) => Math.max(max, p.views), 0);
  const ttPct = total > 0 ? Math.round((creator.ttViews / total) * 100) : 50;
  const igPct = 100 - ttPct;

  // Line chart data
  const lineData = ts.map(p => ({
    date: p.date.slice(5),
    total: p.ttViews + p.igViews,
    TikTok: p.ttViews,
    Instagram: p.igViews,
  }));

  // Pie chart data
  const pieData = [
    { name: "TikTok", value: creator.ttViews, color: "#06b6d4" },
    { name: "Instagram", value: creator.igViews, color: "#a855f7" },
  ];

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <Link href="/creators" className="text-xs text-zinc-500 hover:text-mc-secondary transition-colors mb-4 inline-block">← Back to Creators</Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Total Posts", value: String(creator.posts) },
            { label: "TikTok Views", value: fmt(creator.ttViews) },
            { label: "IG Views", value: fmt(creator.igViews) },
            { label: "Avg Views/Post", value: fmt(creator.avgPerPost) },
            { label: "Best Post", value: bestPost > 0 ? fmt(bestPost) : "—" },
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
          </div>

          {/* Platform Split */}
          <div className="rounded-xl bg-mc-card border border-mc-medium p-5 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold mb-4">Platform Split</h2>
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
          </div>
        </div>

        {/* Posts Table */}
        <div className="rounded-xl bg-mc-card border border-mc-medium overflow-hidden">
          <div className="px-5 py-4 border-b border-mc-medium">
            <h2 className="text-sm font-semibold">Posts ({posts.length})</h2>
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
                {posts.map((p, i) => (
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
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-blue-400 transition-colors text-xs"
                        >
                          ↗
                        </a>
                      ) : (
                        <span className="text-mc-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
