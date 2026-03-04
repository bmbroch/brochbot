"use client";

import { useEffect, useRef, useState } from "react";

const INITIAL_CARDS = [
  {
    emoji: "📈",
    title: "Connect Google Ads to OpenClaw",
    desc: "Hook up the Google Ads API so an agent can monitor spend, flag underperforming campaigns, and report back daily — no dashboard required.",
    tags: ["ads", "api", "automation"],
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
  {
    emoji: "💰",
    title: "Personal Expense Tracker",
    desc: "Drop your bank statement and the agent builds you a Google Sheet — categorized spending, monthly totals, anomaly flags. Your finances, organized in 60 seconds.",
    tags: ["finance", "google sheets", "personal"],
    color: "#8b5cf6",
  },
  {
    emoji: "💼",
    title: "Build in Public on Autopilot",
    desc: "Agent reads what you built today, drafts 3 LinkedIn post options in different tones, and pings you to pick one. Ship daily content without the daily effort.",
    tags: ["linkedin", "personal brand", "content"],
    color: "#0077b5",
  },
];

const RANK_COLORS = ["#FF5A5F", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6", "#9ca3af"];

export default function SlideC() {
  const [visible, setVisible] = useState(false);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const dragCard = useRef<number | null>(null);

  const toggleComplete = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleDragStart = (i: number) => {
    dragCard.current = i;
    setDraggingIdx(i);
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setOverIdx(i);
  };

  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragCard.current;
    if (from === null || from === i) {
      setDraggingIdx(null);
      setOverIdx(null);
      return;
    }
    const next = [...cards];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setCards(next);
    setDraggingIdx(null);
    setOverIdx(null);
    dragCard.current = null;
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setOverIdx(null);
    dragCard.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6 gap-5">
      {/* Heading */}
      <div
        className="text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">Pick our homework</h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Drag to rank · #1 is what we build live
        </p>
      </div>

      {/* 3×2 draggable grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-5xl">
        {cards.map((card, i) => {
          const isDragging = draggingIdx === i;
          const isOver = overIdx === i && draggingIdx !== i;
          const isDone = completed.has(card.title);
          return (
            <div
              key={card.title}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className="relative flex flex-col rounded-2xl overflow-hidden select-none"
              style={{
                opacity: isDragging ? 0.35 : visible ? 1 : 0,
                transform: isOver
                  ? "scale(1.03)"
                  : visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                transition: "opacity 0.3s ease, transform 0.2s ease",
                transitionDelay: isDragging || isOver ? "0ms" : `${150 + i * 60}ms`,
                background: isDone ? "#f0fdf4" : "#fff",
                border: isDone
                  ? "2px solid #22c55e"
                  : isOver ? `2px solid ${card.color}` : "1.5px solid #e5e7eb",
                boxShadow: isDone
                  ? "0 4px 16px rgba(34,197,94,0.15)"
                  : isOver ? `0 8px 24px ${card.color}30` : "0 2px 8px rgba(0,0,0,0.04)",
                cursor: "grab",
              }}
            >
              {/* Done overlay checkmark */}
              {isDone && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div
                    className="text-6xl opacity-10 font-black"
                    style={{ color: "#16a34a", transform: "rotate(-15deg)" }}
                  >
                    ✓
                  </div>
                </div>
              )}

              {/* Rank / done badge */}
              <button
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white z-10 shadow-sm transition-transform hover:scale-110 active:scale-95"
                style={{ background: isDone ? "#22c55e" : RANK_COLORS[i], cursor: "pointer" }}
                onClick={(e) => toggleComplete(e, card.title)}
                title={isDone ? "Mark incomplete" : "Mark complete"}
              >
                {isDone ? "✓" : i + 1}
              </button>

              {/* Color top bar */}
              <div
                className="h-1.5 w-full flex-shrink-0 transition-all duration-300"
                style={{ background: isDone ? "#22c55e" : card.color }}
              />

              {/* Card body */}
              <div className="flex flex-col flex-1 px-5 pt-4 pb-4 gap-2.5">
                <div className="flex items-center gap-2.5 pr-6">
                  <span className="text-3xl leading-none" style={{ opacity: isDone ? 0.5 : 1 }}>{card.emoji}</span>
                  <h3
                    className="text-base font-bold leading-tight transition-all duration-300"
                    style={{
                      color: isDone ? "#6b7280" : "#111827",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed flex-1 transition-colors duration-300" style={{ color: isDone ? "#9ca3af" : "#4b5563" }}>{card.desc}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-opacity duration-300"
                      style={{
                        background: isDone ? "#f3f4f6" : `${card.color}14`,
                        color: isDone ? "#9ca3af" : card.color,
                        opacity: isDone ? 0.7 : 1,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
