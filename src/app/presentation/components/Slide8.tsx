"use client";

const CORAL = "#FF5A5F";

export default function Slide4() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 gap-10">
      {/* Heading */}
      <div className="text-center max-w-2xl">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Want to build yours?
        </h2>
        <p className="mt-3 text-xl text-gray-500 font-medium">
          I&apos;m walking through the full setup live on Skillshare.
        </p>
      </div>

      {/* Event block */}
      <div className="bg-white border border-gray-200 rounded-2xl px-10 py-8 shadow-sm flex flex-col items-center gap-4 w-full max-w-md">
        <div className="text-5xl">📅</div>
        <div className="text-center">
          <div className="font-bold text-gray-900 text-2xl">
            Wednesday &middot; 11:00 AM
          </div>
          <div className="text-gray-500 text-sm mt-2 leading-relaxed">
            Step-by-step: server setup, OpenClaw install,
            <br />
            building your first agent
          </div>
        </div>

        {/* CTA */}
        <a
          href="#"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 w-full text-center font-bold text-lg py-4 px-8 rounded-xl transition-opacity hover:opacity-90 shadow-lg"
          style={{ background: CORAL, color: "#fff" }}
        >
          Save your spot →
        </a>
      </div>

      {/* Secondary link */}
      <a
        href="https://openclawai.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-base hover:underline"
        style={{ color: CORAL }}
        onClick={(e) => e.stopPropagation()}
      >
        openclawai.com
      </a>
    </div>
  );
}
