"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const FEATURES = [
  {
    icon: "📜",
    title: "It has a soul",
    file: "SOUL.md",
    color: CORAL,
    desc: "Every agent has a SOUL.md — a file that defines who they are. Their personality, their opinions, how they talk, what they care about. Not a chatbot. A character.",
    detail: "personality · voice · values · opinions",
  },
  {
    icon: "🧠",
    title: "It remembers",
    file: "MEMORY.md",
    color: "#6366f1",
    desc: "Agents wake up each session and read their memory. Long-term curated facts in MEMORY.md. Daily raw logs. Session transcripts indexed for search. It knows what happened last week.",
    detail: "MEMORY.md · daily notes · searchable transcripts",
  },
  {
    icon: "⏰",
    title: "It acts without being asked",
    file: "HEARTBEAT",
    color: "#10b981",
    desc: "Cron jobs fire at 6am. Heartbeats check in every 30 minutes. Agents send reports, catch bugs, and flag problems — without you ever opening a chat.",
    detail: "cron jobs · heartbeats · proactive alerts",
  },
  {
    icon: "🎯",
    title: "Each agent owns a domain",
    file: "agents/dana.md",
    color: "#f59e0b",
    desc: "Every agent has a brief that defines their job, their tools, and their scope. Dana does data. Miles does SEO. They don't step on each other — and they can't go rogue.",
    detail: "specialized · scoped · briefed",
  },
  {
    icon: "🔧",
    title: "Skills are learnable",
    file: "SKILL.md",
    color: "#8b5cf6",
    desc: "Agents can load new skills on demand — web scraping, weather, YouTube transcripts. Each skill is a file with instructions. New capability = drop in a file.",
    detail: "pluggable · extensible · no code needed",
  },
  {
    icon: "🔒",
    title: "Your server. Your data.",
    file: ".env",
    color: "#64748b",
    desc: "It runs on a $6/mo VPS you own. Your API keys, your Telegram, your agents. No vendor owns your setup. Delete the subscription any time — your agents stay yours.",
    detail: "open source · self-hosted · full control",
  },
];

export default function SlideH() {
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
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Why it works so well
        </h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">
          It&apos;s not just a chatbot with a cron job. It&apos;s built to behave like a person.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${130 + i * 70}ms`,
            }}
          >
            {/* Icon + title row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${f.color}15` }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{f.title}</h3>
              </div>
              {/* File badge */}
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 font-mono"
                style={{ background: `${f.color}12`, color: f.color }}
              >
                {f.file}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed flex-1">{f.desc}</p>

            {/* Detail tags */}
            <div
              className="text-[9px] font-semibold tracking-wide pt-1 border-t border-gray-50"
              style={{ color: f.color }}
            >
              {f.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
