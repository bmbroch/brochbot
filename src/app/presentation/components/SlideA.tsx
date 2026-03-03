"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

interface Service {
  name: string;
  color: string;
  bg: string;
}

interface Agent {
  emoji: string;
  name: string;
  accentColor: string;
  services: Service[];
}

const AGENTS: Agent[] = [
  {
    emoji: "🤝",
    name: "Sam",
    accentColor: "#FF5A5F",
    services: [
      { name: "Telegram", color: "#fff", bg: "#2AABEE" },
      { name: "All Agents", color: "#fff", bg: "#6b7280" },
    ],
  },
  {
    emoji: "🛠️",
    name: "Devin",
    accentColor: "#f59e0b",
    services: [
      { name: "GitHub", color: "#fff", bg: "#24292e" },
      { name: "Vercel", color: "#fff", bg: "#000000" },
      { name: "Supabase", color: "#fff", bg: "#3ECF8E" },
    ],
  },
  {
    emoji: "📊",
    name: "Dana",
    accentColor: "#3b82f6",
    services: [
      { name: "Supabase (3 DBs)", color: "#fff", bg: "#3ECF8E" },
      { name: "Datafast", color: "#fff", bg: "#6366f1" },
      { name: "Stripe", color: "#fff", bg: "#635BFF" },
    ],
  },
  {
    emoji: "🚀",
    name: "Miles",
    accentColor: "#10b981",
    services: [
      { name: "Google Search Console", color: "#fff", bg: "#4285F4" },
      { name: "Datafast", color: "#fff", bg: "#6366f1" },
    ],
  },
  {
    emoji: "📣",
    name: "Marco",
    accentColor: "#8b5cf6",
    services: [
      { name: "Meta Ads API", color: "#fff", bg: "#0081FB" },
      { name: "Supabase", color: "#fff", bg: "#3ECF8E" },
    ],
  },
  {
    emoji: "🎧",
    name: "Cara",
    accentColor: "#ec4899",
    services: [
      { name: "Stripe (3 accounts)", color: "#fff", bg: "#635BFF" },
    ],
  },
  {
    emoji: "📱",
    name: "Mia",
    accentColor: "#f97316",
    services: [
      { name: "Google Sheets", color: "#fff", bg: "#0F9D58" },
      { name: "Apify (TikTok/IG)", color: "#fff", bg: "#FF7518" },
    ],
  },
  {
    emoji: "💰",
    name: "Frankie",
    accentColor: "#14b8a6",
    services: [
      { name: "Mercury Banking", color: "#fff", bg: "#6D28D9" },
    ],
  },
  {
    emoji: "📌",
    name: "Penny",
    accentColor: "#64748b",
    services: [
      { name: "GitHub", color: "#fff", bg: "#24292e" },
      { name: "All Ops Files", color: "#fff", bg: "#6b7280" },
    ],
  },
  {
    emoji: "✍️",
    name: "Jude",
    accentColor: "#a78bfa",
    services: [
      { name: "Ghost CMS", color: "#fff", bg: "#15171A" },
    ],
  },
];

export default function SlideA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 py-8 gap-6">
      {/* Heading */}
      <div
        className="text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Under the hood
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Each agent is plugged into the tools it needs. Nothing more.
        </p>
      </div>

      {/* Agent grid — 2 columns */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 w-full max-w-4xl">
        {AGENTS.map((agent, i) => (
          <div
            key={agent.name}
            className="flex items-center gap-3 transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-12px)",
              transitionDelay: `${120 + i * 55}ms`,
            }}
          >
            {/* Agent pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0 min-w-[110px]"
              style={{ background: `${agent.accentColor}18`, border: `1px solid ${agent.accentColor}30` }}
            >
              <span className="text-base leading-none">{agent.emoji}</span>
              <span className="text-sm font-bold text-gray-800">{agent.name}</span>
            </div>

            {/* Arrow */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>

            {/* Service pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {agent.services.map((svc) => (
                <span
                  key={svc.name}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg leading-none"
                  style={{ background: svc.bg, color: svc.color }}
                >
                  {svc.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
