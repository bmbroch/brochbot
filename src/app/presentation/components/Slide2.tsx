"use client";

const CORAL = "#FF5A5F";

const PRODUCTS = [
  {
    name: "Cover Letter Copilot",
    url: "coverlettercopilot.ai",
    icon: "✉️",
    desc: "AI-powered cover letters tailored to any job in seconds",
    color: "#3b82f6",
    stat: "19K+ users",
  },
  {
    name: "Interview Sidekick",
    url: "interviewsidekick.com",
    icon: "🎙️",
    desc: "Real-time AI coaching during live interviews — answers in your ear",
    color: CORAL,
    stat: "93K+ sessions",
  },
  {
    name: "SalesEcho",
    url: "sales-echo.com",
    icon: "📞",
    desc: "Live sales call support and mock call practice powered by AI",
    color: "#10b981",
    stat: "238 active subs",
  },
];

export default function Slide2() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-8">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          A little about me
        </h2>
        <p className="mt-3 text-xl text-gray-500 font-medium">
          Solo founder. 3 subscription products. Running it all with AI.
        </p>
      </div>

      {/* Bio strip */}
      <div
        className="flex items-center gap-5 px-7 py-4 rounded-2xl w-full max-w-3xl"
        style={{ background: "#f8fafc", border: "1.5px solid #e5e7eb" }}
      >
        <img
          src="/avatars/ben.jpg"
          alt="Ben"
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
          }}
        />
        <div>
          <div className="font-bold text-gray-900 text-lg">Ben Broch</div>
          <div className="text-sm text-gray-500 leading-relaxed mt-0.5">
            NYC-based solopreneur, 3 years in &mdash; building AI-powered SaaS products
            for job seekers and sales professionals.
            No employees. No co-founders. Just AI agents and good vibes.
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="flex gap-5 w-full max-w-3xl">
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="flex-1 flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden"
            style={{ border: "1.5px solid #f1f5f9", borderTop: `4px solid ${p.color}` }}
          >
            <div className="px-5 pt-5 pb-3">
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-bold text-gray-900 text-base leading-tight">{p.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-2">{p.url}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
            <div
              className="mt-auto px-5 py-2.5 flex items-center"
              style={{ background: `${p.color}10`, borderTop: `1px solid ${p.color}20` }}
            >
              <span className="text-xs font-bold" style={{ color: p.color }}>
                {p.stat}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
