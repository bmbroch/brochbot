"use client";

import { useState } from "react";

const CORAL = "#FF5A5F";

interface Task {
  desc: string;
  date: string;
}

interface Agent {
  emoji: string;
  name: string;
  accentColor: string;
  tasks: Task[];
}

const AGENTS: Agent[] = [
  {
    emoji: "🛠️",
    name: "Devin",
    accentColor: "#f59e0b",
    tasks: [
      { desc: "Built Viralytics auth system (Google OAuth modal + middleware)", date: "Feb 28" },
      { desc: "Deployed UGC analytics dashboard with multi-creator chart selection", date: "Mar 1" },
      { desc: "Fixed ISK transcription batching — resolved IO budget exhaustion", date: "Mar 2" },
      { desc: "Shipped Coral Pulse brand design system + landing page", date: "Mar 1" },
      { desc: "Stripe subscription end-to-end — checkout, webhook, confetti", date: "Mar 2" },
    ],
  },
  {
    emoji: "🚀",
    name: "Miles",
    accentColor: "#10b981",
    tasks: [
      { desc: "GSC daily report — ISK 'ai interview' keyword alert, +12% WoW impressions", date: "Mar 3" },
      { desc: "Identified CLCP cover letter generator organic traffic drift", date: "Feb 26" },
      { desc: "Flagged GEO opportunity — chatgpt.com already sending referral traffic", date: "Feb 22" },
      { desc: "ISK keyword cluster report — 61% of total visitor share", date: "Feb 20" },
    ],
  },
  {
    emoji: "📣",
    name: "Marco",
    accentColor: "#8b5cf6",
    tasks: [
      { desc: "Meta Ads API connected — act_623789930620706 verified live", date: "Feb 24" },
      { desc: "Non-expiring system user token generated for autonomous ad management", date: "Feb 24" },
      { desc: "ISK Trial Win-Back campaign scoped — $15/day, 3 Supabase audiences", date: "Feb 25" },
    ],
  },
  {
    emoji: "📊",
    name: "Dana",
    accentColor: "#3b82f6",
    tasks: [
      { desc: "Morning analytics — ISK 403 active subs, $2.5K/week revenue", date: "Mar 3" },
      { desc: "Diagnosed Supabase IO budget exhaustion on ISK — traced to interview_transcripts", date: "Mar 2" },
      { desc: "SE breakdown — 224 Radar + 14 Range = 238 active subs, $1.3K/week", date: "Mar 1" },
      { desc: "CLCP cohort analysis — 276 active subs, $1.1K/week", date: "Feb 27" },
    ],
  },
  {
    emoji: "📌",
    name: "Penny",
    accentColor: "#64748b",
    tasks: [
      { desc: "Daily hygiene audit — flagged ugc-assets Supabase bucket missing", date: "Mar 1" },
      { desc: "Caught cron double-fire bug, traced to announce delivery path — fixed", date: "Feb 26" },
      { desc: "Delegation audit — confirmed all 5 crons using CRON MODE header", date: "Feb 22" },
      { desc: "MC drift check — agent-runs-history.json out of sync, triggered resync", date: "Feb 21" },
    ],
  },
  {
    emoji: "🎧",
    name: "Cara",
    accentColor: "#ec4899",
    tasks: [
      { desc: "Stripe webhook race condition diagnosed on Viralytics — stale sub deletion after new checkout", date: "Mar 3" },
      { desc: "ISK active sub count verified — 403 subscribers across all plans", date: "Mar 1" },
      { desc: "SE Radar product billing confirmed live — 224 active subscriptions", date: "Feb 28" },
    ],
  },
  {
    emoji: "📱",
    name: "Mia",
    accentColor: "#f97316",
    tasks: [
      { desc: "Weekly UGC report — Flo #1 at $0.70 CPM, 78K views across SE creators", date: "Feb 25" },
      { desc: "Synced 8 creator profiles — 478 posts, 5.8M total views tracked", date: "Mar 2" },
      { desc: "Nick TikTok backfill — 3.2M views, highest performer in network", date: "Mar 3" },
    ],
  },
  {
    emoji: "🤝",
    name: "Sam",
    accentColor: "#FF5A5F",
    tasks: [
      { desc: "Coordinated ISK production incident response — blog down, IO budget, Framer outage", date: "Mar 2" },
      { desc: "Spun up Marco with Meta Ads API access — scoped Phase 1 pixel deployment", date: "Feb 24" },
      { desc: "Recovered from SSH server lockout — hardened auth_keys with chattr +i", date: "Feb 25" },
      { desc: "Launched Viralytics as standalone SaaS — onboarding, Stripe, live domain", date: "Mar 1" },
    ],
  },
];

export default function SlideB() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = AGENTS[activeIdx];

  return (
    <div className="flex flex-col h-full px-10 py-8 gap-5">
      {/* Heading */}
      <div className="text-center flex-shrink-0">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          What they&apos;ve shipped
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Real tasks, completed autonomously. No hand-holding.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto flex-shrink-0 pb-1">
        {AGENTS.map((agent, i) => (
          <button
            key={agent.name}
            onClick={() => setActiveIdx(i)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
            style={{
              background: activeIdx === i ? agent.accentColor : "transparent",
              color: activeIdx === i ? "#fff" : "#6b7280",
              border: activeIdx === i ? `1.5px solid ${agent.accentColor}` : "1.5px solid #e5e7eb",
            }}
          >
            <span>{agent.emoji}</span>
            <span>{agent.name}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div
        key={activeIdx}
        className="flex-1 flex flex-col gap-3 overflow-y-auto"
        style={{ animation: "slideTabIn 0.22s ease both" }}
      >
        {active.tasks.map((task, i) => (
          <div
            key={i}
            className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm"
            style={{
              animation: `slideTabIn 0.28s ease both`,
              animationDelay: `${i * 50}ms`,
            }}
          >
            {/* Check */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${active.accentColor}18`, border: `1.5px solid ${active.accentColor}40` }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active.accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-snug">{task.desc}</p>
            </div>

            {/* Date + badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400 font-medium">{task.date}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                ✅ Done
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideTabIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
