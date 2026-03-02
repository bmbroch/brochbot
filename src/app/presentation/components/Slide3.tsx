"use client";

const CORAL = "#FF5A5F";

const AGENTS = [
  {
    emoji: "🛠️",
    name: "Devin",
    desc: "I tell him what to build — he ships it",
    color: "#f59e0b",
  },
  {
    emoji: "📣",
    name: "Marco",
    desc: "Runs my Instagram & Google Ads",
    color: "#8b5cf6",
  },
  {
    emoji: "📊",
    name: "Dana",
    desc: "Pulls revenue & analytics every morning",
    color: "#06b6d4",
  },
  {
    emoji: "🚀",
    name: "Miles",
    desc: "Handles SEO & growth strategy",
    color: "#10b981",
  },
  {
    emoji: "🎧",
    name: "Cara",
    desc: "Monitors Stripe & billing issues",
    color: "#ec4899",
  },
];

export default function Slide3() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-8">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          How it all works
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          One boss. Five specialists. All on Telegram.
        </p>
      </div>

      {/* Org chart */}
      <div className="flex flex-col items-center gap-0 w-full max-w-3xl">
        {/* Sam — head honcho */}
        <div
          className="flex items-center gap-4 px-8 py-5 rounded-2xl shadow-lg z-10"
          style={{ background: CORAL, color: "#fff", minWidth: 300 }}
        >
          <span className="text-4xl">🤝</span>
          <div>
            <div className="font-bold text-2xl leading-tight">Sam</div>
            <div className="text-sm opacity-90 font-medium">
              Head honcho — directs &amp; orchestrates
            </div>
          </div>
        </div>

        {/* Connector line */}
        <div
          style={{
            width: 2,
            height: 28,
            background: "#e5e7eb",
          }}
        />

        {/* Horizontal bar */}
        <div
          style={{
            width: "85%",
            height: 2,
            background: "#e5e7eb",
            position: "relative",
          }}
        />

        {/* Agent cards row */}
        <div className="flex gap-3 w-full justify-center mt-0">
          {AGENTS.map((a, i) => (
            <div key={i} className="flex flex-col items-center" style={{ flex: 1, maxWidth: 160 }}>
              {/* Connector drop */}
              <div style={{ width: 2, height: 20, background: "#e5e7eb" }} />
              <div
                className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: `${a.color}18` }}
                >
                  {a.emoji}
                </div>
                <div className="font-bold text-gray-900 text-sm">{a.name}</div>
                <div className="text-xs text-gray-500 text-center leading-snug">
                  {a.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram footnote */}
      <div
        className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium"
        style={{ background: "#e8f4fd", color: "#1a8ccd" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.04 9.608c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.903.613z"/>
        </svg>
        Most stuff just runs through Telegram chat
      </div>
    </div>
  );
}
