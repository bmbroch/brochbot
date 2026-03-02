"use client";
import { useState } from "react";

const CORAL = "#FF5A5F";

const AGENTS = [
  { emoji: "🛠️", name: "Devin", desc: "I tell him what to build — he ships it", color: "#f59e0b" },
  { emoji: "📣", name: "Marco", desc: "Runs my Instagram & Google Ads", color: "#8b5cf6" },
  { emoji: "📊", name: "Dana", desc: "Pulls revenue & analytics every morning", color: "#06b6d4" },
  { emoji: "🚀", name: "Miles", desc: "Handles SEO & growth strategy", color: "#10b981" },
  { emoji: "🎧", name: "Cara", desc: "Monitors Stripe & billing issues", color: "#ec4899" },
];

export default function Slide3() {
  const [lightbox, setLightbox] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 gap-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          How it all works
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          One chief of staff. Ten agents. All on Telegram.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8 w-full max-w-5xl items-start">

        {/* LEFT — Org chart */}
        <div className="flex-1 flex flex-col items-center gap-0">
          {/* Sam — head honcho with avatar */}
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg"
            style={{ background: CORAL, color: "#fff", minWidth: 280 }}
          >
            <img
              src="/avatars/sam.png"
              alt="Sam"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              style={{ outline: "2px solid rgba(255,255,255,0.4)" }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
              }}
            />
            <div>
              <div className="font-bold text-xl leading-tight">🤝 Sam</div>
              <div className="text-sm opacity-90 font-medium">
                Head honcho — directs &amp; orchestrates
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div style={{ width: 2, height: 24, background: "#e5e7eb" }} />

          {/* Horizontal bar */}
          <div style={{ width: "90%", height: 2, background: "#e5e7eb" }} />

          {/* Agent cards row */}
          <div className="flex gap-2 w-full justify-center">
            {AGENTS.map((a, i) => (
              <div key={i} className="flex flex-col items-center" style={{ flex: 1 }}>
                <div style={{ width: 2, height: 18, background: "#e5e7eb" }} />
                <div className="w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                    style={{ background: `${a.color}18` }}
                  >
                    {a.emoji}
                  </div>
                  <div className="font-bold text-gray-900 text-xs">{a.name}</div>
                  <div className="text-xs text-gray-500 text-center leading-snug" style={{ fontSize: 10 }}>
                    {a.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Telegram badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mt-4"
            style={{ background: "#e8f4fd", color: "#1a8ccd" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.04 9.608c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.903.613z"/>
            </svg>
            Most stuff just runs through Telegram chat
          </div>
        </div>

        {/* RIGHT — Telegram screenshot */}
        <div
          className="flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 cursor-zoom-in hover:shadow-3xl transition-shadow"
          style={{ width: 360 }}
          onClick={() => setLightbox(true)}
          title="Click to expand"
        >
          <img
            src="/telegram-screenshot.jpg"
            alt="Telegram inbox showing all agent chats"
            className="w-full block"
          />
          <div
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium"
            style={{ background: "#f8fafc", color: "#94a3b8" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}>
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Click to expand
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightbox(false)}
        >
          <img
            src="/telegram-screenshot.jpg"
            alt="Telegram inbox"
            className="rounded-2xl shadow-2xl max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-6 right-8 text-white text-4xl leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
