"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

export default function SlideEnd() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-8">
      {/* Lobster emoji */}
      <div
        className="text-8xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        🦞
      </div>

      {/* Heading */}
      <div
        className="text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
        }}
      >
        <h2 className="text-6xl font-black tracking-tight text-gray-900">
          Now go build something.
        </h2>
        <p className="mt-3 text-xl text-gray-500 font-medium">
          You have everything you need.
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-16 h-1 rounded-full"
        style={{
          background: CORAL,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}
      />

      {/* Links */}
      <div
        className="flex items-center gap-8 text-sm text-gray-500"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.4s",
        }}
      >
        <span>
          𝕏 <span className="font-semibold text-gray-700">@brochchain</span>
        </span>
        <span className="text-gray-300">·</span>
        <span>
          GitHub{" "}
          <span className="font-semibold text-gray-700">
            github.com/openclaw/openclaw
          </span>
        </span>
        <span className="text-gray-300">·</span>
        <span>
          Docs{" "}
          <span className="font-semibold text-gray-700">docs.openclaw.ai</span>
        </span>
      </div>
    </div>
  );
}
