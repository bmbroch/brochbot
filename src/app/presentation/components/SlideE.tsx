"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const PATHS = [
  {
    label: "Ben's way",
    title: "AWS EC2",
    subtitle: "Follow along step by step",
    steps: [
      "Spin up a free-tier EC2 instance",
      "SSH in, install OpenClaw",
      "Connect your Telegram + Claude",
      "Deploy your first agent",
    ],
    url: "https://x.com/ThisWeeknAI/status/2022067742925275147",
    bg: "#0d1117",
    accent: CORAL,
    cta: "Follow the thread →",
  },
  {
    label: "Easy way",
    title: "Hostinger VPS",
    subtitle: "One-click Docker deploy",
    steps: [
      "Pick a VPS plan ($6/mo)",
      "Deploy OpenClaw via Docker",
      "Connect your Telegram + Claude",
      "Deploy your first agent",
    ],
    url: "https://www.hostinger.com/vps/docker/openclaw",
    bg: "#1e1b4b",
    accent: "#a78bfa",
    cta: "Get started →",
  },
];

function qrSrc(url: string, size = 140) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=6`;
}

export default function SlideE() {
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
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Get started tonight</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Two paths. Both work. Pick one.</p>
      </div>

      {/* Cards */}
      <div className="flex gap-5 flex-1 min-h-0">
        {PATHS.map((path, i) => (
          <div
            key={i}
            className="flex-1 flex rounded-2xl overflow-hidden shadow-xl"
            style={{
              background: path.bg,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: `${180 + i * 130}ms`,
              border: `1.5px solid ${path.accent}30`,
            }}
          >
            {/* Left: content */}
            <div className="flex flex-col justify-between flex-1 px-7 py-6 gap-4">
              {/* Label + title */}
              <div className="flex flex-col gap-3">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start"
                  style={{ background: `${path.accent}22`, color: path.accent }}
                >
                  {path.label}
                </span>
                <div>
                  <h3 className="text-3xl font-black text-white leading-tight">{path.title}</h3>
                  <p className="text-sm mt-1" style={{ color: `${path.accent}bb` }}>{path.subtitle}</p>
                </div>
              </div>

              {/* Steps */}
              <ol className="flex flex-col gap-3 flex-1">
                {path.steps.map((step, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: path.accent, color: path.bg }}
                    >
                      {j + 1}
                    </span>
                    <span className="text-sm font-medium text-white/90">{step}</span>
                  </li>
                ))}
              </ol>

              {/* CTA */}
              <a
                href={path.url}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-sm font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
                style={{ background: path.accent, color: path.bg }}
                onClick={(e) => e.stopPropagation()}
              >
                {path.cta}
              </a>
            </div>

            {/* Right: QR code */}
            <div
              className="flex flex-col items-center justify-center px-6 gap-3 flex-shrink-0"
              style={{ background: `${path.accent}10`, borderLeft: `1px solid ${path.accent}20` }}
            >
              <div className="rounded-xl overflow-hidden p-2 bg-white shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc(path.url)}
                  alt={`QR for ${path.title}`}
                  width={140}
                  height={140}
                  className="block"
                />
              </div>
              <p className="text-xs font-semibold text-center" style={{ color: path.accent }}>
                Scan to open
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
