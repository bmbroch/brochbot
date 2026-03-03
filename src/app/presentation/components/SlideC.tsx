"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const CARDS = [
  {
    emoji: "📈",
    title: "Fix My Google Ads",
    desc: "Connect Google Ads API and find out why my customer acquisition cost sucks — then fix it.",
    tags: ["ads", "api", "growth"],
    color: "#FF5A5F",
  },
  {
    emoji: "🌊",
    title: "WiFi Tribe Trip Alerts",
    desc: "Scrape wifitribe.com with Brave API or a script. Auto-ping me when any trip shows 'low on spots' before it sells out.",
    tags: ["scraping", "automation", "travel"],
    color: "#6366f1",
  },
  {
    emoji: "🍕",
    title: "Vibe Code a Client Website",
    desc: "Pick a local business. Build them a website with their menu in 10 minutes. Walk in and pitch $20/month to run it.",
    tags: ["freelance", "vibe coding", "hustle"],
    color: "#f59e0b",
  },
  {
    emoji: "📧",
    title: "Live Customer Support",
    desc: "I got an email from a customer earlier today. Let's handle it together — AI-assisted, start to finish.",
    tags: ["support", "email", "real work"],
    color: "#10b981",
  },
];

export default function SlideC() {
  const [visible, setVisible] = useState(false);
  const [voted, setVoted] = useState<number | null>(null);
  const [votes, setVotes] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleVote = (i: number) => {
    if (voted !== null) return; // one vote only
    setVoted(i);
    setVotes((prev) => prev.map((v, idx) => (idx === i ? v + 1 : v)));
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

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
        {CARDS.map((card, i) => {
          const isWinner = voted !== null && i === voted;
          const isLoser = voted !== null && i !== voted;
          const pct = totalVotes > 0 ? Math.round((votes[i] / totalVotes) * 100) : 0;

          return (
            <div
              key={i}
              onClick={() => handleVote(i)}
              className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 select-none"
              style={{
                opacity: visible ? (isLoser ? 0.45 : 1) : 0,
                transform: visible
                  ? isWinner ? "scale(1.02)" : "scale(1)"
                  : "translateY(20px) scale(0.97)",
                transitionDelay: `${150 + i * 80}ms`,
                background: "#fff",
                border: isWinner
                  ? `2.5px solid ${card.color}`
                  : `1.5px solid #e5e7eb`,
                boxShadow: isWinner
                  ? `0 8px 32px ${card.color}22, 0 2px 8px rgba(0,0,0,0.06)`
                  : "0 2px 8px rgba(0,0,0,0.04)",
                cursor: voted === null ? "pointer" : "default",
              }}
            >
              {/* Winner crown badge */}
              {isWinner && (
                <div
                  className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full z-10"
                  style={{ background: card.color, color: "#fff" }}
                >
                  ✓ Voted!
                </div>
              )}

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
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {card.desc}
                </p>

                {/* Tags + Vote row */}
                <div className="flex items-end justify-between gap-2 mt-1">
                  {/* Tag pills */}
                  <div className="flex flex-wrap gap-1">
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

                  {/* Vote button / result */}
                  {voted === null ? (
                    <button
                      className="flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: card.color,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${card.color}44`,
                      }}
                    >
                      VOTE
                    </button>
                  ) : (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold" style={{ color: isWinner ? card.color : "#9ca3af" }}>
                        {pct}%
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {votes[i]} vote{votes[i] !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vote bar — shows after voting */}
                {voted !== null && (
                  <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: isWinner ? card.color : "#d1d5db",
                        transitionDelay: "200ms",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <p
        className="text-sm text-gray-400 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transitionDelay: "600ms" }}
      >
        {voted === null
          ? "Click a card to cast your vote"
          : `${totalVotes} vote${totalVotes !== 1 ? "s" : ""} cast · we're building that →`}
      </p>
    </div>
  );
}
