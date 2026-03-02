"use client";

const CORAL = "#FF5A5F";

export default function Slide2() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-8">
      {/* Heading */}
      <div className="text-center max-w-2xl">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: `${CORAL}18`, color: CORAL }}
        >
          The Platform
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Meet OpenClaw
        </h2>
        <p className="mt-3 text-xl text-gray-500 font-medium">
          The layer that turns Claude into a team of autonomous agents.
        </p>
      </div>

      {/* Screenshot */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
        style={{ maxWidth: 700, width: "100%" }}
      >
        <img
          src="/openclaw-screenshot.jpg"
          alt="OpenClaw homepage — The AI that actually does things"
          className="w-full block"
          style={{ display: "block" }}
        />
      </div>

      {/* tagline pull */}
      <p
        className="text-sm font-semibold tracking-wide uppercase"
        style={{ color: CORAL }}
      >
        "The AI that actually does things." — openclawai.com
      </p>
    </div>
  );
}
