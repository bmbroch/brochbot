"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const PATHS = [
  {
    icon: "🐦",
    label: "Ben's way",
    title: "AWS EC2",
    subtitle: "Follow along step by step",
    steps: ["Spin up a free-tier EC2 instance", "SSH in, install OpenClaw", "Connect your Telegram + Claude", "Deploy your first agent"],
    url: "https://x.com/ThisWeeknAI/status/2022067742925275147",
    color: "#000000",
    cta: "Follow the thread →",
  },
  {
    icon: "🚀",
    label: "Easy way",
    title: "Hostinger VPS",
    subtitle: "One-click Docker deploy",
    steps: ["Pick a VPS plan ($6/mo)", "Deploy OpenClaw via Docker", "Connect your Telegram + Claude", "Deploy your first agent"],
    url: "https://www.hostinger.com/vps/docker/openclaw",
    color: "#6739b7",
    cta: "Get started →",
  },
];

function qrSrc(url: string, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=4`;
}

export default function SlideE() {
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
          Get started tonight
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Two paths. Both work. Pick one.
        </p>
      </div>

      {/* Two cards */}
      <div className="flex gap-6 w-full max-w-3xl">
        {PATHS.map((path, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${200 + i * 120}ms`,
            }}
          >
            {/* Top bar */}
            <div className="h-1.5 w-full" style={{ background: path.color }} />

            <div className="flex flex-col flex-1 px-6 pt-5 pb-6 gap-4">
              {/* Label + title */}
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${path.color}12`, color: path.color }}
                >
                  {path.label}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{path.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{path.subtitle}</p>
              </div>

              {/* Steps */}
              <ol className="flex flex-col gap-1.5">
                {path.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: `${path.color}15`, color: path.color }}
                    >
                      {j + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* QR code */}
              <div className="flex flex-col items-center gap-2 mt-auto pt-2">
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm p-1 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSrc(path.url)}
                    alt={`QR code for ${path.title}`}
                    width={160}
                    height={160}
                    className="block"
                  />
                </div>
                <p className="text-xs font-semibold" style={{ color: path.color }}>{path.cta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
