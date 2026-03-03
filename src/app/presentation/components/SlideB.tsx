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
      { desc: "Built login system for Viralytics — users can sign in and access their account", date: "Feb 28" },
      { desc: "Built creator analytics dashboard — compare performance across multiple creators", date: "Mar 1" },
      { desc: "Fixed Interview Sidekick slowdown — resolved bottleneck that was causing site outages", date: "Mar 2" },
      { desc: "Designed and launched the Viralytics brand + homepage", date: "Mar 1" },
      { desc: "Built full payment flow for Viralytics — sign up, pay, get access", date: "Mar 2" },
    ],
  },
  {
    emoji: "🚀",
    name: "Miles",
    accentColor: "#10b981",
    tasks: [
      { desc: "Spotted 'ai interview' keyword surge on ISK — impressions up 12% week over week", date: "Mar 3" },
      { desc: "Flagged declining organic traffic on Cover Letter Copilot — needs attention", date: "Feb 26" },
      { desc: "Found that ChatGPT is already sending visitors to our products — big GEO opportunity", date: "Feb 22" },
      { desc: "Interview Sidekick drives 61% of all traffic — identified it as the biggest growth lever", date: "Feb 20" },
    ],
  },
  {
    emoji: "📣",
    name: "Marco",
    accentColor: "#8b5cf6",
    tasks: [
      { desc: "Connected to Meta Ads — ready to run and manage paid campaigns autonomously", date: "Feb 24" },
      { desc: "Set up permanent ad access so campaigns can run without manual logins", date: "Feb 24" },
      { desc: "Mapped out ISK win-back ad campaign for trial users — $15/day, ready to launch", date: "Feb 25" },
    ],
  },
  {
    emoji: "📊",
    name: "Dana",
    accentColor: "#3b82f6",
    tasks: [
      { desc: "ISK hitting $2.5K/week — 403 active subscribers tracked this morning", date: "Mar 3" },
      { desc: "Diagnosed what was crashing Interview Sidekick — found the exact database bottleneck", date: "Mar 2" },
      { desc: "SalesEcho at $1.3K/week — 238 active subscribers across both plans", date: "Mar 1" },
      { desc: "Cover Letter Copilot generating $1.1K/week with 276 paid users", date: "Feb 27" },
    ],
  },
  {
    emoji: "📌",
    name: "Penny",
    accentColor: "#64748b",
    tasks: [
      { desc: "Caught a missing storage bucket before it could cause data loss", date: "Mar 1" },
      { desc: "Caught a bug causing automated messages to send twice — fixed before anyone noticed", date: "Feb 26" },
      { desc: "Audited all 5 automations — confirmed they're running cleanly", date: "Feb 22" },
      { desc: "Caught Mission Control data going stale — triggered a resync to keep it accurate", date: "Feb 21" },
    ],
  },
  {
    emoji: "🎧",
    name: "Cara",
    accentColor: "#ec4899",
    tasks: [
      { desc: "Caught a billing bug that would have cancelled new Viralytics subscribers — fixed before it hit anyone", date: "Mar 3" },
      { desc: "Verified ISK subscriber count — 403 paying users confirmed", date: "Mar 1" },
      { desc: "Confirmed SalesEcho Radar billing is live — 224 paying subscribers", date: "Feb 28" },
    ],
  },
  {
    emoji: "📱",
    name: "Mia",
    accentColor: "#f97316",
    tasks: [
      { desc: "Sophie (Flo) is top performing creator — $0.70 CPM, 78K views last week", date: "Feb 25" },
      { desc: "Tracked 478 creator posts — 5.8M total views across the network", date: "Mar 2" },
      { desc: "Nick is our #1 creator — 3.2M TikTok views and counting", date: "Mar 3" },
    ],
  },
  {
    emoji: "🤝",
    name: "Sam",
    accentColor: "#FF5A5F",
    tasks: [
      { desc: "Managed ISK outage — blog went down mid-day, rallied the team and got it back up", date: "Mar 2" },
      { desc: "Brought Marco online to run paid ads — connected to Meta and mapped out the first campaign", date: "Feb 24" },
      { desc: "Recovered from a server security incident — locked everything down so it can't happen again", date: "Feb 25" },
      { desc: "Coordinated Viralytics launch — onboarding, payments, live at getviralytics.com", date: "Mar 1" },
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
