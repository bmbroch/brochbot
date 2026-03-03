"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const ITEMS = [
  {
    icon: "🔒",
    title: "SSH via Tailscale only",
    desc: "Block public port 22 with UFW. Your server is invisible to the internet — only reachable through your Tailscale network.",
    color: "#6366f1",
  },
  {
    icon: "🔑",
    title: "Lock your SSH keys",
    desc: "Run chattr +i on authorized_keys so nothing — not even root — can modify or overwrite it. One command, permanently safe.",
    color: "#f59e0b",
  },
  {
    icon: "💬",
    title: "Whitelist Telegram IDs",
    desc: "Set allowed_chat_ids in OpenClaw config to your Telegram user ID only. No one else can send commands to your bots.",
    color: "#10b981",
  },
  {
    icon: "🔍",
    title: "Read-only API keys",
    desc: "Use restricted Stripe keys, GSC viewer access, and Supabase read-only roles. Agents get the minimum they need — nothing more.",
    color: "#3b82f6",
  },
  {
    icon: "👤",
    title: "Agents = employees",
    desc: "Invite to Google Sheets as Viewer. Add to GSC. Grant Supabase access by role. Revoking access is as easy as removing any team member.",
    color: "#8b5cf6",
  },
  {
    icon: "🚨",
    title: "Keep an emergency backdoor",
    desc: "Enable AWS Serial Console or EC2 Instance Connect before you need it. When you get locked out — and you will — you'll thank yourself.",
    color: CORAL,
  },
];

export default function SlideD() {
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
          Lock it down
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Agents are powerful. Treat them like employees, not toys.
        </p>
      </div>

      {/* 3×2 grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-5xl">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${150 + i * 70}ms`,
            }}
          >
            {/* Icon + title */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${item.color}15` }}
              >
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.title}</h3>
            </div>
            {/* Desc */}
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            {/* Accent bar */}
            <div className="h-0.5 w-8 rounded-full mt-auto" style={{ background: item.color }} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <p
        className="text-sm text-gray-400 text-center transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transitionDelay: "600ms" }}
      >
        Rule of thumb: if you&apos;d give it to a new hire, you can give it to an agent. And revoke it the same way.
      </p>
    </div>
  );
}
