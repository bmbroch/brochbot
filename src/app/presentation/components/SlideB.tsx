"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const WINS = [
  {
    emoji: "📣",
    agent: "Marco",
    agentColor: "#8b5cf6",
    title: "Mapped out first paid ad campaign",
    desc: "Connected to Meta Ads API and scoped an ISK win-back campaign — targeting users who started a trial but didn't convert. $15/day budget, 3 custom audiences built from Supabase. Ready to launch.",
  },
  {
    emoji: "🚨",
    agent: "Dana",
    agentColor: "#3b82f6",
    title: "Diagnosed a live production outage",
    desc: "ISK blog went down mid-day. Dana traced the exact bottleneck in minutes — interview transcripts were being written line-by-line instead of batched, exhausting the database IO budget.",
  },
  {
    emoji: "🚀",
    agent: "Devin",
    agentColor: "#f59e0b",
    title: "Shipped a full SaaS in one week",
    desc: "Login system, payment flow, creator analytics dashboard, onboarding, brand design — all shipped and live at getviralytics.com. Zero agency, zero freelancers, zero meetings.",
  },
  {
    emoji: "🎧",
    agent: "Cara",
    agentColor: "#ec4899",
    title: "Caught a silent billing bug",
    desc: "A stale Stripe webhook was arriving after new checkouts and cancelling fresh subscriptions. Cara caught and fixed it before a single Viralytics user was affected.",
  },
  {
    emoji: "📱",
    agent: "Mia",
    agentColor: "#f97316",
    title: "Ranked all 8 UGC creators by ROI",
    desc: "Nick is #1 with 3.2M TikTok views. Sophie (Flo) leads on CPM at $0.70. Mia delivers a weekly performance breakdown — who to pay more, who to cut, who's trending.",
  },
  {
    emoji: "🔍",
    agent: "Miles",
    agentColor: "#10b981",
    title: "Found traffic coming in from ChatGPT",
    desc: "Miles noticed chatgpt.com appearing as a referrer in Datafast — AI search is already sending visitors to our products. That's a GEO content opportunity most people don't know to look for.",
  },
];

export default function SlideB() {
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
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">What they&apos;ve shipped</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Real tasks from this past week. No hand-holding.</p>
      </div>

      {/* 3×2 wins grid */}
      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        {WINS.map((win, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${100 + i * 70}ms`,
            }}
          >
            {/* Agent badge + emoji */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{win.emoji}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${win.agentColor}14`, color: win.agentColor }}
              >
                {win.agent}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-gray-900 leading-snug">{win.title}</h3>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed flex-1">{win.desc}</p>

            {/* Accent line */}
            <div className="h-0.5 w-6 rounded-full mt-auto" style={{ background: win.agentColor }} />
          </div>
        ))}
      </div>
    </div>
  );
}
