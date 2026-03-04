"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const FEATURES = [
  { icon: "⏰", title: "Acts without being asked", file: "HEARTBEAT", color: "#10b981", desc: "Cron jobs + heartbeats. Reports fire at 6am. Bugs get flagged before you wake up." },
  { icon: "🎯", title: "Each agent owns a domain", file: "agents/dana.md", color: "#f59e0b", desc: "Scoped, briefed, can't go rogue. Dana does data. Miles does SEO. No overlap." },
  { icon: "🔧", title: "Skills are learnable", file: "SKILL.md", color: "#8b5cf6", desc: "New capability = drop in a file. Web scraping, YouTube, weather — all pluggable." },
  { icon: "🔒", title: "Your server. Your data.", file: ".env", color: "#64748b", desc: "$6/mo VPS you own. Your API keys. No vendor lock-in. Delete the sub, keep the agents." },
];

const LEADERBOARD = [
  { rank: 1, name: "OpenClaw", desc: "The AI that actually does things", tokens: "360B", highlight: true },
  { rank: 2, name: "Kilo Code", desc: "AI coding agent for VS Code", tokens: "178B", highlight: false },
  { rank: 3, name: "BLACKBOXAI", desc: "AI agent for builders", tokens: "85.6B", highlight: false },
  { rank: 4, name: "liteLLM", desc: "Open-source LLM library", tokens: "79.6B", highlight: false },
  { rank: 5, name: "Claude Code", desc: "The AI for problem solvers", tokens: "39.6B", highlight: false },
];

export default function SlideH2() {
  const [visible, setVisible] = useState(false);
  const [barsIn, setBarsIn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setBarsIn(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const maxTokens = 360;

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-4">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Built for autonomy — and people are using it</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">#1 most-used app on OpenRouter. 2× more tokens than #2.</p>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">

        {/* Left: features */}
        <div className="flex flex-col gap-2.5 flex-1">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-12px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                transitionDelay: `${120 + i * 80}ms`,
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5" style={{ background: `${f.color}15` }}>
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">{f.title}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono" style={{ background: `${f.color}12`, color: f.color }}>{f.file}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: OpenRouter leaderboard */}
        <div
          className="flex flex-col gap-2.5 flex-1"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(12px)", transition: "opacity 0.5s ease 0.2s" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">OpenRouter — Top Apps</span>
              <span className="text-[10px] text-gray-400 font-medium">by token usage today</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a" }}>🔴 Live</span>
          </div>

          {/* Leaderboard */}
          <div className="flex flex-col gap-2 flex-1">
            {LEADERBOARD.map((item, i) => {
              const pct = (parseFloat(item.tokens) / maxTokens) * 100;
              return (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 rounded-2xl px-4 py-3 shadow-sm"
                  style={{
                    background: item.highlight ? "#0d1117" : "#fff",
                    border: item.highlight ? `1.5px solid ${CORAL}` : "1px solid #f3f4f6",
                    boxShadow: item.highlight ? `0 4px 20px ${CORAL}22` : undefined,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    transitionDelay: `${200 + i * 70}ms`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-4 flex-shrink-0" style={{ color: item.highlight ? "#6b7280" : "#9ca3af" }}>
                      {item.rank}.
                    </span>
                    <span className="text-sm font-bold flex-1" style={{ color: item.highlight ? "#fff" : "#111827" }}>
                      {item.name}
                      {item.highlight && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: CORAL, color: "#fff" }}>YOU ARE HERE</span>}
                    </span>
                    <span className="text-sm font-black flex-shrink-0" style={{ color: item.highlight ? CORAL : "#6b7280" }}>
                      {item.tokens}
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: item.highlight ? "#30363d" : "#f3f4f6" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: barsIn ? `${pct}%` : "0%",
                        background: item.highlight ? CORAL : "#d1d5db",
                        transitionDelay: `${300 + i * 80}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
