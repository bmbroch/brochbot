"use client";

import { useCallback, useEffect, useState } from "react";
import Slide1 from "./components/Slide1";
import Slide2 from "./components/Slide2";
import Slide3 from "./components/Slide3";
import Slide4 from "./components/Slide4";
import Slide5 from "./components/Slide5";
import Slide6 from "./components/Slide6";
import Slide7 from "./components/Slide7";
import SlideA from "./components/SlideA";
import SlideB from "./components/SlideB";
import SlideC from "./components/SlideC";
import SlideD from "./components/SlideD";
import SlideE from "./components/SlideE";
import SlideF from "./components/SlideF";
import SlideH from "./components/SlideH";
import SlideH2 from "./components/SlideH2";
import SlideI from "./components/SlideI";
import SlideJ from "./components/SlideJ";
import SlideEnd from "./components/SlideEnd";

const CORAL = "#FF5A5F";
const TOTAL = 18;

const SLIDES = [Slide1, Slide2, Slide3, Slide4, SlideH, SlideH2, SlideJ, SlideI, Slide5, Slide6, Slide7, SlideA, SlideB, SlideC, SlideF, SlideE, SlideD, SlideEnd];

const SLIDE_META = [
  { emoji: "💬", title: "It started with a text" },
  { emoji: "👤", title: "A little about me" },
  { emoji: "🦞", title: "Meet OpenClaw" },
  { emoji: "⚙️", title: "How it all works" },
  { emoji: "📜", title: "It thinks like a person" },
  { emoji: "⏰", title: "Built for autonomy" },
  { emoji: "🧠", title: "Brain meets spine" },
  { emoji: "⭐", title: "Most starred on GitHub" },
  { emoji: "🤝", title: "Meet the team" },
  { emoji: "🎬", title: "Agents in action" },
  { emoji: "🖥️", title: "How I set it up" },
  { emoji: "🔌", title: "Under the hood" },
  { emoji: "✅", title: "What they've shipped" },
  { emoji: "📝", title: "Pick our homework" },
  { emoji: "▶️", title: "Go deeper" },
  { emoji: "🚀", title: "Get started tonight" },
  { emoji: "🔒", title: "Lock it down" },
  { emoji: "🦞", title: "That's a wrap" },
];

function ChevronLeft({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(TOTAL - 1, c + 1)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const SlideComponent = SLIDES[current];

  return (
    <div
      className="relative flex flex-col"
      style={{ width: "100vw", height: "100vh", background: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}
      onMouseMove={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Slide counter */}
      <div className="absolute top-6 right-8 text-sm font-semibold z-20 select-none" style={{ color: "#9ca3af" }}>
        {current + 1}/{TOTAL}
      </div>

      {/* Left arrow */}
      <button
        onClick={prev}
        disabled={current === 0}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full"
        style={{
          opacity: showArrows && current > 0 ? 1 : 0,
          pointerEvents: current > 0 ? "auto" : "none",
          background: "rgba(0,0,0,0.06)", color: "#374151",
          transform: "translateY(-50%)", transition: "opacity 0.2s ease",
        }}
      >
        <ChevronLeft />
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        disabled={current === TOTAL - 1}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full"
        style={{
          opacity: showArrows && current < TOTAL - 1 ? 1 : 0,
          pointerEvents: current < TOTAL - 1 ? "auto" : "none",
          background: "rgba(0,0,0,0.06)", color: "#374151",
          transform: "translateY(-50%)", transition: "opacity 0.2s ease",
        }}
      >
        <ChevronRight />
      </button>

      {/* Slide content */}
      <div className="flex-1 flex flex-col min-h-0">
        <SlideComponent key={current} />
      </div>

      {/* Bottom dots nav */}
      <div className="flex items-center justify-center gap-3 py-5" style={{ height: 64 }}>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const meta = SLIDE_META[i];
          const isFirst3 = i <= 2;
          const isLast3 = i >= TOTAL - 3;
          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setHoveredDot(i)}
              onMouseLeave={() => setHoveredDot(null)}
            >
              {/* Hover preview card */}
              {hoveredDot === i && (
                <div
                  className="absolute z-30 flex flex-col items-center gap-1 pointer-events-none"
                  style={{
                    bottom: "calc(100% + 10px)",
                    left: isFirst3 ? "0" : isLast3 ? "auto" : "50%",
                    right: isLast3 ? "0" : "auto",
                    transform: (!isFirst3 && !isLast3) ? "translateX(-50%)" : "none",
                    animation: "dotPreviewIn 0.15s ease both",
                  }}
                >
                  {/* Card */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg select-none"
                    style={{
                      background: "#1f2937",
                      border: `1px solid ${i === current ? CORAL : "rgba(255,255,255,0.08)"}`,
                      minWidth: 140,
                      maxWidth: 180,
                    }}
                  >
                    <span className="text-base flex-shrink-0">{meta.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-gray-500 leading-none mb-0.5">Slide {i + 1}</div>
                      <div className="text-xs font-semibold text-white leading-snug truncate">{meta.title}</div>
                    </div>
                  </div>
                  {/* Arrow pointer */}
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid #1f2937",
                    marginTop: -1,
                  }} />
                </div>
              )}

              {/* Dot */}
              <button
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? CORAL : hoveredDot === i ? "#9ca3af" : "#d1d5db",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  display: "block",
                }}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes dotPreviewIn {
          from { opacity: 0; transform: translateY(4px) translateX(var(--tx, -50%)); }
          to   { opacity: 1; transform: translateY(0)  translateX(var(--tx, -50%)); }
        }
      `}</style>
    </div>
  );
}
