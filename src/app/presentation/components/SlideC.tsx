"use client";

import { useEffect, useState } from "react";

const CARDS = [
  {
    emoji: "💼",
    title: "LinkedIn Post Generator",
    desc: "Agent reads your daily work log, drafts 3 post options in different tones, and pings you on Telegram each evening. You pick one and post. Consistent content without the effort.",
    tags: ["content", "linkedin", "daily"],
    color: "#0077b5",
  },
  {
    emoji: "🤖",
    title: "AI Search Monitor",
    desc: "Ask ChatGPT, Perplexity, and Claude 'what's the best tool for X?' every week. Track whether your product shows up, what competitors they recommend, and how the answers shift over time.",
    tags: ["GEO", "AI search", "competitive"],
    color: "#6366f1",
  },
  {
    emoji: "🕵️",
    title: "Competitor Price Stalker",
    desc: "Agent monitors your top 3 competitors' pricing pages. The second anything changes — a price, a tier, a new feature — you get a Telegram alert with a before/after diff.",
    tags: ["scraping", "automation", "competitive"],
    color: "#f59e0b",
  },
  {
    emoji: "⚠️",
    title: "Churn Early Warning",
    desc: "Query your database weekly for users who were active then suddenly went quiet. Agent drafts a personal check-in message for each one. Catch them before they cancel.",
    tags: ["retention", "saas", "revenue"],
    color: "#10b981",
  },
];

export default function SlideC() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 gap-6">
      {/* Heading */}
      <div
        className="text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Pick our homework
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Group decides. We build it live.
        </p>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${150 + i * 80}ms`,
              background: "#fff",
              border: `1.5px solid #e5e7eb`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Color top bar */}
            <div className="h-1.5 w-full flex-shrink-0" style={{ background: card.color }} />

            {/* Card body */}
            <div className="flex flex-col flex-1 px-5 pt-4 pb-4 gap-2.5">
              {/* Emoji + title */}
              <div className="flex items-center gap-2.5">
                <span className="text-3xl leading-none">{card.emoji}</span>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{card.title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {card.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${card.color}14`, color: card.color }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
