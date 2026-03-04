"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const MILESTONES = [
  { label: "Launch", stars: "9K", note: "Feb 2026", color: "#9ca3af" },
  { label: "10 days in", stars: "190K", note: "fastest ever", color: "#f59e0b" },
  { label: "1 month", stars: "247K", note: "passed React", color: CORAL },
  { label: "Today", stars: "250K+", note: "& climbing", color: "#10b981" },
];

const FACTS = [
  { icon: "⚡", stat: "190K", label: "stars in 14 days", sub: "no project has ever grown this fast" },
  { icon: "🍴", stat: "47.7K", label: "forks", sub: "people building on top of it" },
  { icon: "🌍", stat: "8", label: "language ports", sub: "Rust, Go, Python, Shell + more" },
  { icon: "🏆", stat: "#1", label: "on GitHub", sub: "dethroned React after years at the top" },
];

export default function SlideI() {
  const [visible, setVisible] = useState(false);
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setBarVisible(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-5">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          The most starred project in GitHub history
        </h2>
        <p className="mt-1 text-lg text-gray-600 font-medium">
          It beat React. In under 4 months.
        </p>
      </div>

      {/* Big star count hero */}
      <div
        className="flex items-center justify-center gap-4 flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.15s" }}
      >
        <div
          className="flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg"
          style={{ background: "#0d1117", border: "1px solid #30363d" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-4xl font-black text-white tracking-tight">250,000+</span>
          <span className="text-xl text-gray-300 font-medium">GitHub stars</span>
        </div>
      </div>

      {/* Growth bar / timeline */}
      <div
        className="flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.25s" }}
      >
        <div className="flex items-end gap-3 w-full max-w-3xl mx-auto">
          {MILESTONES.map((m, i) => {
            const heights = [8, 55, 85, 100];
            const h = heights[i];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-gray-600 font-semibold">{m.note}</span>
                <span className="text-base font-black" style={{ color: m.color }}>{m.stars}</span>
                <div className="w-full rounded-t-lg transition-all duration-700" style={{
                  height: barVisible ? h * 0.7 : 0,
                  background: m.color,
                  transitionDelay: `${i * 120}ms`,
                  opacity: 0.85,
                }} />
                <span className="text-xs text-gray-700 font-semibold text-center">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {FACTS.map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-2xl px-4 py-5 shadow-sm gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${400 + i * 80}ms`,
            }}
          >
            <div className="text-5xl">{f.icon}</div>
            <div className="text-5xl font-black text-gray-900 leading-none">{f.stat}</div>
            <div className="text-base font-bold text-gray-800">{f.label}</div>
            <div className="text-sm text-gray-600 leading-snug">{f.sub}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p
        className="text-sm text-center text-gray-500 flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.9s" }}
      >
        Open source · free forever · anyone can contribute · github.com/openclaw/openclaw
      </p>
    </div>
  );
}
