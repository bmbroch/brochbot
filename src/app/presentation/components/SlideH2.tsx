"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const FEATURES = [
  { icon: "⏰", title: "Acts without being asked", color: "#10b981", desc: "Cron jobs fire at 6am. Bugs get flagged before you wake up. No prompting required." },
  { icon: "🎯", title: "Each agent owns a domain", color: "#f59e0b", desc: "Dana does data. Miles does SEO. Scoped, briefed, can't go rogue." },
  { icon: "🔧", title: "Skills are learnable", color: "#8b5cf6", desc: "New capability = drop in a file. Web scraping, YouTube, weather — all pluggable." },
  { icon: "🔒", title: "Your server. Your data.", color: "#64748b", desc: "$6/mo VPS you own. No vendor lock-in. Delete the sub, keep the agents." },
];

const LEADERBOARD = [
  { rank: 1, name: "OpenClaw", tokens: "360B", highlight: true },
  { rank: 2, name: "Kilo Code", tokens: "178B", highlight: false },
  { rank: 3, name: "BLACKBOXAI", tokens: "85.6B", highlight: false },
  { rank: 4, name: "liteLLM", tokens: "79.6B", highlight: false },
  { rank: 5, name: "Claude Code", tokens: "39.6B", highlight: false },
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
    <div className="flex flex-col h-full px-8 py-6 gap-5" style={{ background: "#f1f5f9" }}>
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Built for autonomy — and people are using it</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">#1 most-used app on OpenRouter. 2× more tokens than #2.</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        {/* Left: 2×2 feature grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 bg-white rounded-2xl p-5"
              style={{
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-12px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                transitionDelay: `${120 + i * 80}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${f.color}15` }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{f.title}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Right: OpenRouter leaderboard */}
        <div
          className="flex flex-col gap-3 flex-1"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(12px)", transition: "opacity 0.5s ease 0.2s" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-base font-bold text-gray-900">OpenRouter — Top Apps</span>
              <span className="text-sm text-gray-400 ml-2">by token usage today</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a" }}>🔴 Live</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2.5 flex-1">
            {LEADERBOARD.map((item, i) => {
              const pct = (parseFloat(item.tokens) / maxTokens) * 100;
              return (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-2xl px-5 py-3.5 shadow-sm"
                  style={{
                    background: item.highlight ? "#0d1117" : "#fff",
                    border: item.highlight ? `2px solid ${CORAL}` : "1.5px solid #e2e8f0",
                    boxShadow: item.highlight ? `0 4px 20px ${CORAL}22` : "0 1px 6px rgba(0,0,0,0.06)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    transitionDelay: `${200 + i * 70}ms`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold w-5 flex-shrink-0" style={{ color: item.highlight ? "#6b7280" : "#9ca3af" }}>
                      {item.rank}.
                    </span>
                    <span className="text-base font-bold flex-1" style={{ color: item.highlight ? "#fff" : "#111827" }}>
                      {item.name}
                      {item.highlight && (
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full align-middle" style={{ background: CORAL, color: "#fff" }}>
                          YOU ARE HERE
                        </span>
                      )}
                    </span>
                    <span className="text-lg font-black flex-shrink-0" style={{ color: item.highlight ? CORAL : "#6b7280" }}>
                      {item.tokens}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: item.highlight ? "#30363d" : "#e2e8f0" }}>
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
