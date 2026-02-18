"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useState } from "react";
import { useCreators, creatorsData, creatorsTimeSeries, creatorColors } from "@/lib/data-provider";

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

  // Build unified date set for chart
  const allDatesMap: Record<string, boolean> = {};
  creators.forEach(c => {
    if (enabledCreators[c.name]) {
      creatorsTimeSeries[c.name]?.forEach(p => { allDatesMap[p.date] = true; });
    }
  });
  const dates = Object.keys(allDatesMap).sort();

  // Chart dimensions
  const chartW = 800, chartH = 250, padL = 50, padB = 30, padT = 10, padR = 10;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  let maxViews = 0;
  creators.forEach(c => {
    if (!enabledCreators[c.name]) return;
    const ts = creatorsTimeSeries[c.name];
    if (ts?.length) {
      const last = ts[ts.length - 1];
      maxViews = Math.max(maxViews, last.ttViews + last.igViews);
    }
  });
  if (maxViews === 0) maxViews = 1;

  // Platform comparison max
  const maxPlatform = Math.max(...creators.map(c => Math.max(c.ttViews, c.igViews)));

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
                  <th className="text-right px-5 py-3 font-medium">
                    <span className="text-cyan-400">TikTok</span>
                  </th>
                  <th className="text-right px-5 py-3 font-medium">
                    <span className="text-pink-400">Instagram</span>
                  </th>
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
                      <td className="px-5 py-3 text-right">
                        <span className="text-cyan-400">{fmt(c.ttViews)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-pink-400">{fmt(c.igViews)}</span>
                      </td>
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

        {/* Views Over Time Chart */}
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
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ minWidth: 500 }}>
              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                const y = padT + innerH * (1 - pct);
                const val = Math.round(maxViews * pct);
                return (
                  <g key={pct}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#262626" strokeWidth="0.5" />
                    <text x={padL - 5} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">{fmt(val)}</text>
                  </g>
                );
              })}
              {/* Lines */}
              {creators.filter(c => enabledCreators[c.name]).map(c => {
                const ts = creatorsTimeSeries[c.name] || [];
                if (ts.length < 2) return null;
                const pathD = ts.map((p, i) => {
                  const dateIdx = dates.indexOf(p.date);
                  const x = padL + (dateIdx / Math.max(1, dates.length - 1)) * innerW;
                  const y = padT + innerH * (1 - (p.ttViews + p.igViews) / maxViews);
                  return `${i === 0 ? "M" : "L"}${x},${y}`;
                }).join(" ");
                return <path key={c.name} d={pathD} fill="none" stroke={creatorColors[c.name]} strokeWidth="2" strokeLinejoin="round" />;
              })}
              {/* X-axis labels (sparse) */}
              {dates.filter((_, i) => i % Math.max(1, Math.floor(dates.length / 6)) === 0).map(date => {
                const idx = dates.indexOf(date);
                const x = padL + (idx / Math.max(1, dates.length - 1)) * innerW;
                return <text key={date} x={x} y={chartH - 5} textAnchor="middle" className="fill-zinc-600" fontSize="9">{date.slice(5)}</text>;
              })}
            </svg>
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="rounded-xl bg-[#141414] border border-[#262626] p-5">
          <h2 className="text-sm font-semibold mb-4">Platform Comparison</h2>
          <div className="space-y-4">
            {sorted.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-sm font-medium w-16 text-right">{c.name}</span>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 rounded-full bg-cyan-500/20 transition-all duration-500" style={{ width: `${(c.ttViews / maxPlatform) * 100}%` }}>
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: "100%" }} />
                    </div>
                    <span className="text-[11px] text-cyan-400 w-14 text-right">{fmt(c.ttViews)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 rounded-full bg-pink-500/20 transition-all duration-500" style={{ width: `${(c.igViews / maxPlatform) * 100}%` }}>
                      <div className="h-full rounded-full bg-pink-500" style={{ width: "100%" }} />
                    </div>
                    <span className="text-[11px] text-pink-400 w-14 text-right">{fmt(c.igViews)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 mt-2 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500" /> TikTok</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-500" /> Instagram</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
