"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const LLM_ITEMS = [
  { icon: "✅", text: "Reasons, writes, plans", positive: true },
  { icon: "✅", text: "Understands complex instructions", positive: true },
  { icon: "✅", text: "Knows almost everything (to training cutoff)", positive: true },
  { icon: "❌", text: "Reactive only — waits to be prompted", positive: false },
  { icon: "❌", text: "Can't take actions", positive: false },
  { icon: "❌", text: "No tools, no files, no channels", positive: false },
  { icon: "❌", text: "Lives and dies in a single API call", positive: false },
];

const CAPABILITIES = [
  { emoji: "🧠", label: "Memory", sub: "SOUL.md · MEMORY.md · daily notes" },
  { emoji: "🔧", label: "Tools", sub: "bash · browser · web search · files" },
  { emoji: "💬", label: "Channels", sub: "Telegram · Discord · Signal" },
  { emoji: "⏰", label: "Persistence", sub: "cron jobs · heartbeats · auto-restart" },
  { emoji: "🤝", label: "Multi-agent", sub: "spawn · steer · delegate" },
  { emoji: "🔌", label: "Integrations", sub: "Stripe · Supabase · GitHub · Sheets" },
];

export default function SlideJ() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#ffffff", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-0 px-10 pt-7 pb-4 gap-4">

        {/* Heading */}
        <div
          className="text-center flex-shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">The brain needs a spine.</h2>
          <p className="mt-1 text-base font-medium" style={{ color: "#9ca3af" }}>
            LLMs are powerful but inert. OpenClaw is what makes them autonomous.
          </p>
        </div>

        {/* Three-column layout */}
        <div className="flex flex-1 min-h-0 gap-0 items-stretch">

          {/* Left column — LLM card */}
          <div
            className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden"
            style={{
              background: "#0d1117",
              border: "1.5px solid #30363d",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-16px)",
              transition: "opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s",
            }}
          >
            {/* Card header */}
            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #30363d" }}>
              <span className="text-2xl">🧠</span>
              <div>
                <div className="text-base font-bold text-white leading-tight">The LLM (Claude)</div>
                <div className="text-xs font-semibold" style={{ color: "#6b7280" }}>Raw Intelligence</div>
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-0 px-4 py-3 flex-1 justify-evenly">
              {LLM_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 py-1"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-8px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                    transitionDelay: `${200 + i * 55}ms`,
                  }}
                >
                  <span
                    className="text-sm flex-shrink-0 mt-0.5 font-bold"
                    style={{ color: item.positive ? "#22c55e" : "#ef4444", minWidth: 18 }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm leading-snug" style={{ color: item.positive ? "#d1d5db" : "#9ca3af" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center — spine connector */}
          <div
            className="flex flex-col items-center justify-center flex-shrink-0"
            style={{
              width: 72,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.5s ease 0.35s",
            }}
          >
            {/* Spine SVG */}
            <svg width="28" height="140" viewBox="0 0 28 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Vertical spine line */}
              <line x1="14" y1="0" x2="14" y2="140" stroke={CORAL} strokeWidth="3" strokeLinecap="round" />
              {/* Vertebrae tick marks */}
              {[18, 44, 70, 96, 122].map((y, i) => (
                <g key={i}>
                  <line x1="4" y1={y} x2="24" y2={y} stroke={CORAL} strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="14" cy={y} r="4" fill="#ffffff" stroke={CORAL} strokeWidth="2" />
                </g>
              ))}
            </svg>

            {/* Label */}
            <div className="mt-3 flex flex-col items-center gap-0.5">
              <span className="text-base">🦞</span>
              <span className="text-[10px] font-bold text-center leading-tight" style={{ color: CORAL }}>
                OpenClaw
              </span>
            </div>
          </div>

          {/* Right column — OpenClaw card */}
          <div
            className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(16px)",
              transition: "opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s",
            }}
          >
            {/* Card header */}
            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
              <span className="text-2xl">🦞</span>
              <div>
                <div className="text-base font-bold text-gray-900 leading-tight">OpenClaw</div>
                <div className="text-xs font-semibold" style={{ color: "#9ca3af" }}>The Autonomous Shell</div>
              </div>
            </div>

            {/* Capability grid */}
            <div className="grid grid-cols-2 gap-3 p-4 flex-1 content-start">
              {CAPABILITIES.map((cap, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 rounded-xl p-3"
                  style={{
                    background: i % 2 === 0 ? "#fafafa" : "#fff5f5",
                    border: `1px solid ${i % 2 === 0 ? "#e2e8f0" : `${CORAL}22`}`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                    transitionDelay: `${200 + i * 60}ms`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cap.emoji}</span>
                    <span className="text-sm font-bold text-gray-900">{cap.label}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "#9ca3af" }}>{cap.sub}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex-shrink-0 flex items-center justify-center px-8"
        style={{
          height: 44,
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}
      >
        <p className="text-sm font-semibold text-center" style={{ color: "#6b7280" }}>
          &ldquo;The model provides the intelligence. OpenClaw provides everything else.&rdquo;
        </p>
      </div>
    </div>
  );
}
