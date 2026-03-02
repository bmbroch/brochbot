"use client";

const CORAL = "#FF5A5F";

const SPOTLIGHTS = [
  {
    emoji: "🛠️",
    name: "Devin",
    role: "Web Developer",
    avatar: "/avatars/dev.png",
    color: "#f59e0b",
    what: "Develops & ships Mission Control",
    how: "I describe what I want in Telegram. He reads the codebase, writes the code, runs builds, pushes to GitHub. Vercel deploys automatically.",
    update: "Done ✅ Built the UGC analytics dashboard — 4 chart types, org-scoped data, Stripe paywall overlay. Pushed to main, Vercel deployed. Live at brochbot.com",
    updateTime: "2:14 AM",
  },
  {
    emoji: "🚀",
    name: "Miles",
    role: "GTM Lead",
    avatar: "/avatars/miles.png",
    color: "#10b981",
    what: "Organic SEO & keyword strategy",
    how: "Every morning he pulls Google Search Console data across all 3 products — tells me what's trending up, what's falling, and which keywords I should be targeting.",
    update: "📊 GSC Report — ISK impressions +12% WoW. Top mover: 'AI interview prep' (↑340 clicks). CLCP down 8% — blog needs attention. New opportunity: 'cover letter for career change' (2.4K/mo, low competition)",
    updateTime: "8:01 AM",
  },
  {
    emoji: "📣",
    name: "Marco",
    role: "Paid Ads",
    avatar: "/avatars/marco.png",
    color: "#8b5cf6",
    what: "Instagram & Google Ads",
    how: "Plugged directly into the Meta Ads API. I tell him the budget and goal, he sets up the targeting, builds the audiences, and monitors performance.",
    update: "✅ ISK Trial Win-Back campaign live — $15/day, 3 custom audiences (trial drop-offs, churned subs, pricing page visitors). CTR 3.2%, CPM $8.40. First conversions expected within 48h",
    updateTime: "11:30 AM",
  },
];

function TelegramBubble({
  agent,
  message,
  time,
}: {
  agent: { avatar: string; emoji: string; name: string; color: string };
  message: string;
  time: string;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#0e1621" }}
    >
      {/* mini header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: "#17212b", borderBottom: "1px solid #2b3a4a" }}
      >
        <img
          src={agent.avatar}
          alt={agent.name}
          className="w-5 h-5 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-white text-xs font-semibold">
          {agent.emoji} {agent.name}
        </span>
        <span className="ml-auto text-xs" style={{ color: "#6b8a9e" }}>
          {time}
        </span>
      </div>
      {/* bubble */}
      <div className="px-3 py-3">
        <div
          className="text-xs leading-relaxed rounded-xl rounded-tl-sm px-3 py-2.5"
          style={{ background: "#182533", color: "#d4e6f1" }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

export default function Slide5() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 gap-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Agents in action
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Real work, every day, no micromanaging.
        </p>
      </div>

      {/* Cards */}
      <div className="flex gap-5 w-full max-w-5xl">
        {SPOTLIGHTS.map((agent) => (
          <div
            key={agent.name}
            className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Card header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}
            >
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm">
                  {agent.emoji} {agent.name}
                </div>
                <div className="text-xs text-gray-500">{agent.role}</div>
              </div>
              <div
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${agent.color}18`, color: agent.color }}
              >
                {agent.what}
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 leading-relaxed">{agent.how}</p>
            </div>

            {/* Telegram update */}
            <div className="px-3 pb-3 mt-auto">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                Latest update
              </div>
              <TelegramBubble
                agent={agent}
                message={agent.update}
                time={agent.updateTime}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
