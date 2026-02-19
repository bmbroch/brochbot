"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { creatorsData, creatorsTimeSeries, creatorsPosts, creatorColors } from "@/lib/data-provider";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

export default function CreatorDetailPage() {
  const params = useParams();
  const name = typeof params.name === "string" ? params.name : "";
  const creator = creatorsData.find(c => c.name.toLowerCase() === name.toLowerCase());

  if (!creator) {
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
  const posts = creatorsPosts[creator.name] || [];
  const color = creatorColors[creator.name] || "#3b82f6";
  const bestPost = posts.length ? Math.max(...posts.map(p => p.ttViews + p.igViews)) : 0;
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
    { name: "Instagram", value: creator.igViews, color: "#ec4899" },
  ];

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <Link href="/creators" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4 inline-block">← Back to Creators</Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: `${color}20`, color }}>
            {creator.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{creator.name}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
              <span>Started {creator.startDate}</span>
              <span>·</span>
              <span className="text-green-400">${creator.earnings} earned</span>
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
            { label: "Best Post", value: fmt(bestPost) },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all duration-200">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Views Chart — recharts */}
          <div className="lg:col-span-2 rounded-xl bg-[#141414] border border-[#262626] p-5">
            <h2 className="text-sm font-semibold mb-4">Views Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#262626" }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#262626" }} tickFormatter={fmt} />
                <Tooltip {...darkTooltipStyle} formatter={(value) => fmt(Number(value))} />
                <Line type="monotone" dataKey="TikTok" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Instagram" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Split — recharts PieChart */}
          <div className="rounded-xl bg-[#141414] border border-[#262626] p-5 flex flex-col items-center justify-center">
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
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> IG {igPct}%</span>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="rounded-xl bg-[#141414] border border-[#262626] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262626]">
            <h2 className="text-sm font-semibold">Recent Posts ({posts.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-zinc-500 uppercase tracking-wider border-b border-[#262626]">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-cyan-400">TT Views</th>
                  <th className="text-right px-5 py-3 font-medium text-pink-400">IG Views</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                  <th className="text-center px-5 py-3 font-medium">Milestone</th>
                  <th className="text-right px-5 py-3 font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {[...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p, i) => (
                  <tr key={i} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-zinc-400">{p.date}</td>
                    <td className="px-5 py-3 text-right text-cyan-400">{fmt(p.ttViews)}</td>
                    <td className="px-5 py-3 text-right text-pink-400">{fmt(p.igViews)}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(p.ttViews + p.igViews)}</td>
                    <td className="px-5 py-3 text-center">{p.milestone || <span className="text-zinc-600">—</span>}</td>
                    <td className="px-5 py-3 text-right text-green-400">${p.earnings.toFixed(2)}</td>
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
