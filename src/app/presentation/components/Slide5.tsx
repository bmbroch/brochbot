"use client";

const CORAL = "#FF5A5F";

const SPOTLIGHTS = [
  {
    emoji: "🛠️",
    name: "Devin",
    role: "Web Developer",
    avatar: "/avatars/dev.png",
    color: "#f59e0b",
    tagline: "Builds & ships the product",
    bullets: [
      "I describe what I want in Telegram",
      "He codes it, pushes to GitHub",
      "Vercel deploys automatically",
    ],
    update: "Done ✅ Built the UGC analytics dashboard. Pushed to main — live at brochbot.com",
    updateTime: "2:14 AM",
  },
  {
    emoji: "🚀",
    name: "Miles",
    role: "GTM Lead",
    avatar: "/avatars/miles.png",
    color: "#10b981",
    tagline: "Organic SEO & keyword strategy",
    bullets: [
      "Daily Google Search Console report",
      "Tracks trends across all 3 products",
      "Surfaces new keyword opportunities",
    ],
    update: "📊 GSC Report — ISK impressions +12% WoW. New opportunity: 'cover letter for career change' (2.4K/mo, low competition)",
    updateTime: "8:01 AM",
  },
  {
    emoji: "📣",
    name: "Marco",
    role: "Paid Ads",
    avatar: "/avatars/marco.png",
    color: "#8b5cf6",
    tagline: "Instagram & Google Ads",
    bullets: [
      "Plugged into Meta Ads API directly",
      "Builds audiences from Supabase data",
      "No ad agency. No account manager.",
    ],
    update: "✅ ISK Trial Win-Back live — $15/day, 3 audiences. CTR 3.2%, CPM $8.40.",
    updateTime: "11:30 AM",
  },
];

export default function Slide5() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 gap-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Agents in action
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Real work, every day. No micromanaging.
        </p>
      </div>

      {/* Cards */}
      <div className="flex gap-5 w-full max-w-5xl">
        {SPOTLIGHTS.map((agent) => (
          <div
            key={agent.name}
            className="flex-1 flex flex-col rounded-2xl overflow-hidden bg-white shadow-md"
            style={{ border: `1.5px solid #f1f5f9`, borderTop: `4px solid ${agent.color}` }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div>
                <div className="font-bold text-gray-900 text-lg leading-tight">
                  {agent.emoji} {agent.name}
                </div>
                <div
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: agent.color }}
                >
                  {agent.tagline}
                </div>
              </div>
            </div>

            {/* Bullets */}
            <div
              className="flex flex-col gap-2 px-5 pb-4"
              style={{ borderBottom: "1px solid #f1f5f9" }}
            >
              {agent.bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: agent.color }}
                  />
                  <span className="text-sm text-gray-700">{b}</span>
                </div>
              ))}
            </div>

            {/* Telegram update */}
            <div className="px-4 py-4 flex flex-col gap-2" style={{ background: "#0e1621" }}>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="#4da6d9" width={12} height={12}>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.04 9.608c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.903.613z"/>
                </svg>
                <span className="text-xs font-semibold" style={{ color: "#6b8a9e" }}>
                  Latest message
                </span>
                <span className="ml-auto text-xs" style={{ color: "#4a6272" }}>
                  {agent.updateTime}
                </span>
              </div>
              <div
                className="text-xs leading-relaxed rounded-xl rounded-tl-sm px-3 py-2.5"
                style={{ background: "#182533", color: "#d4e6f1" }}
              >
                {agent.update}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
