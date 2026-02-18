"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useState } from "react";
import { useCreators, creatorsData, creatorsTimeSeries, creatorColors } from "@/lib/data-provider";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return n.toLocaleString();
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all duration-200">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

const darkTooltipStyle = {
  contentStyle: { backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
  itemStyle: { color: "#e4e4e7" },
};

export default function CreatorsPage() {
  const creators = useCreators();
  const [enabledCreators, setEnabledCreators] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    creatorsData.forEach(c => { m[c.name] = true; });
    return m;
  });

  const totalPosts = creators.reduce((s, c) => s + c.posts, 0);
  const totalViews = creators.reduce((s, c) => s + c.ttViews + c.igViews, 0);
  const avgViews = Math.round(totalViews / totalPosts);

  const sorted = [...creators].sort((a, b) => (b.ttViews + b.igViews) - (a.ttViews + a.igViews));

  // Build unified time series data for the line chart
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
      if (match) {
        point[c.name] = match.ttViews + match.igViews;
      }
    });
    return point;
  });

  // Bar chart data for platform comparison
  const barData = sorted.map(c => ({
    name: c.name,
    TikTok: c.ttViews,
    Instagram: c.igViews,
  }));

  const toggle = (name: string) => {
    setEnabledCreators(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <Shell>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Creators</h1>
          <p className="text-sm text-zinc-500 mt-1">UGC creator performance dashboard</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Creators" value={String(creators.length)} sub="Active" />
          <StatCard label="Total Posts" value={String(totalPosts)} sub="All platforms" />
          <StatCard label="Total Views" value={fmt(totalViews)} sub="TikTok + Instagram" />
          <StatCard label="Avg Views/Post" value={fmt(avgViews)} />
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl bg-[#141414] border border-[#262626] overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-[#262626]">
            <h2 className="text-sm font-semibold">Leaderboard</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-zinc-500 uppercase tracking-wider border-b border-[#262626]">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Creator</th>
                  <th className="text-right px-5 py-3 font-medium">Posts</th>
                  <th className="text-right px-5 py-3 font-medium"><span className="text-cyan-400">TikTok</span></th>
                  <th className="text-right px-5 py-3 font-medium"><span className="text-pink-400">Instagram</span></th>
                  <th className="text-right px-5 py-3 font-medium">Total Views</th>
                  <th className="text-right px-5 py-3 font-medium">Avg/Post</th>
                  <th className="text-right px-5 py-3 font-medium">Earnings</th>
                  <th className="text-center px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => {
                  const total = c.ttViews + c.igViews;
                  const dominant = c.igViews > c.ttViews ? "ig" : "tt";
                  return (
                    <tr key={c.name} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-zinc-500 font-mono">{i + 1}</td>
                      <td className="px-5 py-3">
                        <Link href={`/creators/${c.name.toLowerCase()}`} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${creatorColors[c.name]}20`, color: creatorColors[c.name] }}>
                            {c.name[0]}
                          </div>
                          <span className="font-medium">{c.name}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-400">{c.posts}</td>
                      <td className="px-5 py-3 text-right"><span className="text-cyan-400">{fmt(c.ttViews)}</span></td>
                      <td className="px-5 py-3 text-right"><span className="text-pink-400">{fmt(c.igViews)}</span></td>
                      <td className="px-5 py-3 text-right font-semibold">{fmt(total)}</td>
                      <td className="px-5 py-3 text-right text-zinc-400">{fmt(c.avgPerPost)}</td>
                      <td className="px-5 py-3 text-right text-green-400">${c.earnings}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${dominant === "ig" ? "bg-pink-500/10 text-pink-400" : "bg-cyan-500/10 text-cyan-400"}`}>
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

        {/* Views Over Time Chart — recharts */}
        <div className="rounded-xl bg-[#141414] border border-[#262626] p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Views Over Time</h2>
            <div className="flex flex-wrap gap-2">
              {creators.map(c => (
                <button
                  key={c.name}
                  onClick={() => toggle(c.name)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-all ${enabledCreators[c.name] ? "border-transparent" : "border-[#262626] opacity-40"}`}
                  style={enabledCreators[c.name] ? { backgroundColor: `${creatorColors[c.name]}20`, color: creatorColors[c.name] } : {}}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#262626" }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#262626" }} tickFormatter={fmt} />
              <Tooltip {...darkTooltipStyle} formatter={(value) => fmt(Number(value))} />
              {creators.filter(c => enabledCreators[c.name]).map(c => (
                <Line key={c.name} type="monotone" dataKey={c.name} stroke={creatorColors[c.name]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Comparison — recharts BarChart */}
        <div className="rounded-xl bg-[#141414] border border-[#262626] p-5">
          <h2 className="text-sm font-semibold mb-4">Platform Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#262626" }} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#e4e4e7", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#262626" }} width={60} />
              <Tooltip {...darkTooltipStyle} formatter={(value) => fmt(Number(value))} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
              <Bar dataKey="TikTok" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Instagram" fill="#ec4899" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
}
