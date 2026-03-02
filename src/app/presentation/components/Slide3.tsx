"use client";

const CORAL = "#FF5A5F";

const CHATGPT = [
  "You ask a question",
  "It answers",
  "You come back tomorrow",
  "Ask again",
  "It forgot everything",
];

const OPENCLAW = [
  "Runs on your own server, 24/7",
  "Executes real tasks autonomously",
  "Sends you updates while you sleep",
  "Has persistent memory across sessions",
  "Works even when you're offline",
];

export default function Slide3() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-10">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Not ChatGPT
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          ChatGPT waits for you. OpenClaw works while you&apos;re gone.
        </p>
      </div>

      {/* Comparison */}
      <div className="flex gap-6 w-full max-w-3xl">
        {/* ChatGPT column */}
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ background: "#f9fafb", borderBottom: "1px solid #f1f5f9" }}
          >
            <span className="text-2xl">💬</span>
            <span className="font-bold text-gray-700 text-lg">ChatGPT</span>
            <span className="ml-auto text-xs text-gray-400 font-medium">Reactive</span>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3">
            {CHATGPT.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 text-gray-300 text-lg">✕</span>
                <span className="text-gray-600 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* vs divider */}
        <div className="flex items-center justify-center">
          <div
            className="text-base font-black px-3 py-2 rounded-xl"
            style={{ background: "#f1f5f9", color: "#9ca3af" }}
          >
            vs
          </div>
        </div>

        {/* OpenClaw column */}
        <div
          className="flex-1 rounded-2xl overflow-hidden shadow-lg"
          style={{ border: `2px solid ${CORAL}` }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ background: CORAL }}
          >
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-white text-lg">OpenClaw</span>
            <span
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}
            >
              Agentic
            </span>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3 bg-white">
            {OPENCLAW.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" style={{ color: CORAL }}>✓</span>
                <span className="text-gray-800 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom callout */}
      <div
        className="px-6 py-3 rounded-xl text-sm font-semibold text-center max-w-lg"
        style={{ background: "#fff7ed", color: "#c2410c" }}
      >
        🌙 My agents ran 47 tasks last night while I was asleep. ChatGPT ran 0.
      </div>
    </div>
  );
}
