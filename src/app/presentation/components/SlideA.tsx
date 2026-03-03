"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const SOURCES = [
  { emoji: "💳", name: "Stripe", desc: "Revenue & billing", color: "#635BFF" },
  { emoji: "🗄️", name: "Supabase", desc: "3 app databases", color: "#3ECF8E" },
  { emoji: "📊", name: "Datafast", desc: "Web analytics", color: "#6366f1" },
  { emoji: "🔍", name: "Search Console", desc: "SEO & keywords", color: "#4285F4" },
  { emoji: "📋", name: "Google Sheets", desc: "Creator tracking", color: "#0F9D58" },
  { emoji: "📣", name: "Meta Ads", desc: "Ad performance", color: "#0081FB" },
  { emoji: "🎬", name: "Apify", desc: "TikTok / IG data", color: "#FF7518" },
  { emoji: "🏦", name: "Mercury", desc: "Banking & payouts", color: "#6D28D9" },
  { emoji: "💻", name: "GitHub", desc: "Code & deploys", color: "#24292e" },
  { emoji: "💬", name: "Telegram", desc: "Commands & alerts", color: "#2AABEE" },
  { emoji: "🚀", name: "Vercel", desc: "Frontend hosting", color: "#000000" },
];

const AGENTS = [
  { emoji: "📊", name: "Dana", color: "#3b82f6", gets: "Revenue + analytics" },
  { emoji: "🚀", name: "Miles", color: "#10b981", gets: "SEO + GEO signals" },
  { emoji: "📣", name: "Marco", color: "#8b5cf6", gets: "Ad performance" },
  { emoji: "🎧", name: "Cara", color: "#ec4899", gets: "Billing + support" },
  { emoji: "📱", name: "Mia", color: "#f97316", gets: "Creator data" },
  { emoji: "💰", name: "Frankie", color: "#14b8a6", gets: "Cash flow" },
  { emoji: "🛠️", name: "Devin", color: "#f59e0b", gets: "Code + CI/CD" },
  { emoji: "📌", name: "Penny", color: "#64748b", gets: "Ops hygiene" },
];

export default function SlideA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-4">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Under the hood</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Every data source connected. Each agent only sees what it needs.</p>
      </div>

      {/* 3-column flow */}
      <div className="flex items-center gap-4 flex-1 min-h-0">

        {/* Left: data sources */}
        <div
          className="flex-1 flex flex-col gap-2 min-h-0"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-1">Data Sources</p>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((src, i) => (
              <div
                key={src.name}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white shadow-sm"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-10px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  transitionDelay: `${150 + i * 40}ms`,
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${src.color}18` }}>
                  {src.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{src.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{src.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: OpenClaw hub */}
        <div
          className="flex flex-col items-center gap-3 flex-shrink-0"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.3s" }}
        >
          {/* Arrow left */}
          <div className="flex items-center gap-1 text-gray-300 text-sm font-medium">
            <svg width="48" height="12" viewBox="0 0 48 12">
              <line x1="0" y1="6" x2="40" y2="6" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4,2"/>
              <polygon points="40,2 48,6 40,10" fill="#d1d5db"/>
            </svg>
          </div>

          {/* OpenClaw node */}
          <div
            className="flex flex-col items-center justify-center rounded-2xl px-6 py-5 shadow-lg text-center"
            style={{ background: CORAL, minWidth: 110 }}
          >
            <div className="text-3xl mb-1">🦞</div>
            <div className="text-white font-bold text-sm leading-tight">OpenClaw</div>
            <div className="text-white/70 text-[10px] mt-0.5">the hub</div>
          </div>

          {/* Arrow right */}
          <div className="flex items-center gap-1 text-gray-300">
            <svg width="48" height="12" viewBox="0 0 48 12">
              <line x1="0" y1="6" x2="40" y2="6" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4,2"/>
              <polygon points="40,2 48,6 40,10" fill="#d1d5db"/>
            </svg>
          </div>
        </div>

        {/* Right: agents */}
        <div
          className="flex-1 flex flex-col gap-2"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.45s" }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-1">Agent Team</p>
          <div className="flex flex-col gap-2">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white shadow-sm"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(10px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  transitionDelay: `${300 + i * 40}ms`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${agent.color}18` }}
                >
                  {agent.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800">{agent.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{agent.gets}</div>
                </div>
                <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agent.color }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
