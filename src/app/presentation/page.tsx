"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
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
import Slide8 from "./components/Slide8";

const CORAL = "#FF5A5F";
const TOTAL = 11;

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, SlideA, SlideB, SlideC, Slide8];

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
  const [current, setCurrent] = useState(0); // 0-indexed
  const [showArrows, setShowArrows] = useState(false);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(0, c - 1));
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => Math.min(TOTAL - 1, c + 1));
  }, []);

  // Keyboard navigation
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
    <Shell>
    <div
      className="relative flex flex-col flex-1"
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
      onMouseMove={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Slide counter — top right */}
      <div
        className="absolute top-6 right-8 text-sm font-semibold z-20 select-none"
        style={{ color: "#9ca3af" }}
      >
        {current + 1}/{TOTAL}
      </div>

      {/* Left arrow */}
      <button
        onClick={prev}
        disabled={current === 0}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200"
        style={{
          opacity: showArrows && current > 0 ? 1 : 0,
          pointerEvents: current > 0 ? "auto" : "none",
          background: "rgba(0,0,0,0.06)",
          color: "#374151",
          transform: "translateY(-50%)",
          transition: "opacity 0.2s ease",
        }}
      >
        <ChevronLeft />
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        disabled={current === TOTAL - 1}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200"
        style={{
          opacity: showArrows && current < TOTAL - 1 ? 1 : 0,
          pointerEvents: current < TOTAL - 1 ? "auto" : "none",
          background: "rgba(0,0,0,0.06)",
          color: "#374151",
          transform: "translateY(-50%)",
          transition: "opacity 0.2s ease",
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
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? CORAL : "#d1d5db",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        ))}
      </div>
    </div>
    </Shell>
  );
}
