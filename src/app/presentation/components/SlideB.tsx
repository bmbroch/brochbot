"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const METRICS = [
  { value: "$4.9K", label: "per week", sub: "across all 3 products", color: "#10b981" },
  { value: "917", label: "active subscribers", sub: "ISK + CLCP + SalesEcho", color: "#3b82f6" },
  { value: "10", label: "agents", sub: "running 24/7, no days off", color: CORAL },
  { value: "5+", label: "automated reports", sub: "delivered every morning", color: "#8b5cf6" },
];

const WINS = [
  { emoji: "🚀", title: "Launched a SaaS", desc: "Viralytics went from zero to live product — auth, payments, onboarding, domain — in one week.", date: "Mar 1" },
  { emoji: "🔥", title: "Survived a production outage", desc: "ISK blog went down mid-day. Agents diagnosed the root cause and coordinated the fix.", date: "Mar 2" },
  { emoji: "📣", title: "Connected paid ads", desc: "Marco is wired into Meta Ads and ready to run retargeting campaigns autonomously.", date: "Feb 24" },
  { emoji: "🌱", title: "Found a new traffic channel", desc: "Miles spotted ChatGPT already sending visitors. GEO content strategy is now live.", date: "Feb 22" },
];

export default function SlideB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-5">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">What they&apos;ve shipped</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Real outcomes. Not demos.</p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {METRICS.map((m, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${100 + i * 70}ms`,
            }}
          >
            <div className="text-3xl font-black tracking-tight" style={{ color: m.color }}>{m.value}</div>
            <div className="text-sm font-bold text-gray-800 mt-0.5">{m.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Wins */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {WINS.map((win, i) => (
          <div
            key={i}
            className="flex gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${350 + i * 80}ms`,
            }}
          >
            <div className="text-2xl flex-shrink-0 mt-0.5">{win.emoji}</div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{win.title}</span>
                <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{win.date}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{win.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
