"use client";

const CORAL = "#FF5A5F";

const PRODUCTS = [
  {
    name: "Cover Letter Copilot",
    url: "coverlettercopilot.ai",
    logo: "/cover-letter-logo.svg",
    desc: "AI-powered cover letters tailored to any job posting",
    color: "#3b82f6",
  },
  {
    name: "Interview Sidekick",
    url: "interviewsidekick.com",
    logo: "/interview-sidekick-logo.svg",
    desc: "Real-time AI coaching for live interviews",
    color: CORAL,
  },
  {
    name: "SalesEcho",
    url: "sales-echo.com",
    logo: "/sales-echo-logo.svg",
    desc: "Live sales call support and mock call practice",
    color: "#10b981",
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
          Solo founder. 3 SaaS products. Running it all with AI.
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
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <div className="font-bold text-gray-900 text-lg">Ben Broch</div>
          <div className="text-sm text-gray-500 leading-relaxed mt-0.5">
            NYC-based solopreneur — I build and run subscription software products
            for job seekers and sales professionals. No employees. No co-founders.
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="flex gap-5 w-full max-w-3xl">
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="flex-1 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-6 shadow-sm"
            style={{ border: "1.5px solid #f1f5f9", borderTop: `4px solid ${p.color}` }}
          >
            <img
              src={p.logo}
              alt={p.name}
              className="h-10 object-contain"
              style={{ maxWidth: 140 }}
            />
            <div className="text-center">
              <div className="font-bold text-gray-900 text-sm">{p.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{p.url}</div>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
