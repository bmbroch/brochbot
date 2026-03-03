"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const AGENDA = [
  "Connect Google Ads API + spin up new agent",
  "Meta Ads Library — find winning ad angles for ISK",
  "Build first retargeting audience from Supabase data",
  "Launch ISK trial win-back campaign ($15/day)",
];

const OUTCOMES = [
  "Set up your own OpenClaw server in an afternoon",
  "Connect it to your tools (Stripe, Supabase, Google, Meta)",
  "Have agents running overnight while you sleep",
];

function CheckItem({
  text,
  delay,
  accentColor,
  visible,
  checked = false,
}: {
  text: string;
  delay: number;
  accentColor: string;
  visible: boolean;
  checked?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-3 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: checked ? accentColor : "transparent",
          border: `2px solid ${accentColor}`,
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-base text-gray-700 leading-snug">{text}</span>
    </div>
  );
}

export default function SlideC() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 py-10 gap-8">
      {/* Heading */}
      <div
        className="text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Let&apos;s build together
        </h2>
        <p className="mt-3 text-xl text-gray-500 font-medium">
          Here&apos;s what we&apos;re tackling live.
        </p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Left — On the agenda */}
        <div
          className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm flex flex-col gap-5 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(14px)",
            transitionDelay: "100ms",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔧</span>
            <h3 className="text-lg font-bold text-gray-900">On the agenda</h3>
          </div>
          <div className="flex flex-col gap-4">
            {AGENDA.map((item, i) => (
              <CheckItem
                key={i}
                text={item}
                delay={200 + i * 80}
                accentColor={CORAL}
                visible={visible}
                checked={false}
              />
            ))}
          </div>
        </div>

        {/* Right — After this class */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-5 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(14px)",
            transitionDelay: "180ms",
            background: "linear-gradient(135deg, #fff5f5, #fff9f5)",
            border: `1.5px solid ${CORAL}30`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💡</span>
            <h3 className="text-lg font-bold text-gray-900">
              After this class you&apos;ll be able to:
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {OUTCOMES.map((item, i) => (
              <CheckItem
                key={i}
                text={item}
                delay={280 + i * 80}
                accentColor={CORAL}
                visible={visible}
                checked={true}
              />
            ))}
          </div>

          {/* Decorative coral line */}
          <div
            className="mt-auto pt-4 border-t flex items-center gap-2"
            style={{ borderColor: `${CORAL}30` }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: CORAL }}
            />
            <span className="text-sm font-semibold" style={{ color: CORAL }}>
              You leave with a working system. Not just theory.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
