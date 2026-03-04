"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const SOURCES = [
  { emoji: "💳", name: "Stripe", desc: "Revenue & billing", color: "#635BFF" },
  { emoji: "🗄️", name: "Supabase", desc: "3 app databases", color: "#3ECF8E" },
  { emoji: "📊", name: "Datafast", desc: "Web analytics", color: "#6366f1" },
  { emoji: "🔍", name: "Google Search Console", desc: "SEO & organic", color: "#4285F4" },
  { emoji: "📋", name: "Google Sheets", desc: "Creator tracking", color: "#0F9D58" },
  { emoji: "📣", name: "Meta Ads", desc: "Ad performance", color: "#0081FB" },
  { emoji: "🎬", name: "Apify", desc: "TikTok / IG data", color: "#FF7518" },
  { emoji: "🏦", name: "Mercury", desc: "Banking & payouts", color: "#6D28D9" },
  { emoji: "💻", name: "GitHub", desc: "Code & deploys", color: "#24292e" },
  { emoji: "💬", name: "Telegram", desc: "Commands & alerts", color: "#2AABEE" },
  { emoji: "🚀", name: "Vercel", desc: "Frontend hosting", color: "#000000" },
  { emoji: "✍️", name: "Ghost CMS", desc: "Blog & content", color: "#15171A" },
];

export default function SlideA() {
  const [visible, setVisible] = useState(false);
  const [linesIn, setLinesIn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setLinesIn(true), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const n = SOURCES.length;
  // Compute positions around an ellipse: rx=40%, ry=36%
  const positions = SOURCES.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI / n);
    return {
      x: 50 + 40 * Math.cos(angle),
      y: 50 + 36 * Math.sin(angle),
    };
  });

  return (
    <div className="flex flex-col h-full px-8 py-5 gap-3">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Under the hood</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Everything feeding into one hub.</p>
      </div>

      {/* Diagram */}
      <div className="flex-1 relative min-h-0">

        {/* SVG lines — drawn from center to each node */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
        >
          {positions.map((pos, i) => (
            <line
              key={i}
              x1="50" y1="50"
              x2={pos.x} y2={pos.y}
              stroke="#e5e7eb"
              strokeWidth="0.35"
              strokeDasharray="1.4,0.7"
              style={{
                opacity: linesIn ? 1 : 0,
                transition: `opacity 0.4s ease ${100 + i * 50}ms`,
              }}
            />
          ))}
        </svg>

        {/* OpenClaw hub — center */}
        <div
          style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.2s",
          }}
        >
          <div
            className="flex flex-col items-center justify-center rounded-2xl shadow-xl px-5 py-4 text-center"
            style={{ background: CORAL, minWidth: 100, border: `2px solid ${CORAL}` }}
          >
            <div className="text-3xl mb-1">🦞</div>
            <div className="text-white font-black text-sm leading-tight">OpenClaw</div>
            <div className="text-white/70 text-[10px] mt-0.5 font-medium">hub</div>
          </div>
        </div>

        {/* Source nodes */}
        {SOURCES.map((src, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${positions[i].x}%`,
              top: `${positions[i].y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              opacity: visible ? 1 : 0,
              transition: `opacity 0.4s ease ${120 + i * 55}ms`,
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm bg-white"
              style={{ border: `1.5px solid ${src.color}30`, minWidth: 130, maxWidth: 160 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: `${src.color}15` }}
              >
                {src.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 leading-tight truncate">{src.name}</div>
                <div className="text-[10px] text-gray-400 leading-tight truncate">{src.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
