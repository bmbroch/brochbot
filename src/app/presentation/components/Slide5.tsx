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
    examples: [
      "Built the full UGC analytics dashboard",
      "Ships multiple features per day",
      "Fixes bugs without me touching a line of code",
    ],
  },
  {
    emoji: "🚀",
    name: "Miles",
    role: "GTM Lead",
    avatar: "/avatars/miles.png",
    color: "#10b981",
    what: "Organic SEO & keyword strategy",
    how: "Every morning he pulls Google Search Console data across all 3 products — tells me what's trending up, what's falling, and which keywords I should be targeting.",
    examples: [
      "Daily GSC report across 3 products",
      "Tracks impression & click trends",
      "Surfaces new keyword opportunities",
    ],
  },
  {
    emoji: "📣",
    name: "Marco",
    role: "Paid Ads",
    avatar: "/avatars/marco.png",
    color: "#8b5cf6",
    what: "Instagram & Google Ads",
    how: "Plugged directly into the Meta Ads API. I tell him the budget and goal, he sets up the targeting, builds the audiences, and monitors performance.",
    examples: [
      "Retargeting campaigns on Meta",
      "Custom Supabase audiences (trial drop-offs)",
      "No ad agency. No account manager.",
    ],
  },
];

export default function Slide5() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-8">
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
            className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}
            >
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <div className="font-bold text-gray-900">
                  {agent.emoji} {agent.name}
                </div>
                <div className="text-xs text-gray-500">{agent.role}</div>
              </div>
              <div
                className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${agent.color}18`, color: agent.color }}
              >
                {agent.what}
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-4 flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">{agent.how}</p>

              <div className="flex flex-col gap-2 mt-auto">
                {agent.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: CORAL }}>
                      →
                    </span>
                    <span className="text-xs text-gray-700">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
