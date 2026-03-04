"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const CREATORS = [
  {
    name: "Riley Brown",
    handle: "@rileybrown_ai",
    subs: "150K subscribers",
    avatar: "https://yt3.googleusercontent.com/Cm_AOGXEC3TYdp2iOXTUj07zgqBkCMJjh4C-0iD0DJOALbMb-D2tz9fJ2e-EDE5DJnJCnd3PaA=s900-c-k-c0x00ffffff-no-rj",
    channelUrl: "https://www.youtube.com/@rileybrown_ai",
    bannerColor: "#f59e0b",
    tagline: "Building an AI superteam in public. Every step documented.",
    videos: [
      { id: "ISb0nrlNoKQ", title: "Why Specialized Agents are Superior (How I Built an OpenClaw Superteam)", views: "48K views", duration: "18:16" },
      { id: "Yt6imPC1FhA", title: "OpenClaw Just Replaced 1,000 Hours of Video Editing Tutorials", views: "53K views", duration: "12:06" },
    ],
  },
  {
    name: "Greg Isenberg",
    handle: "@gregisenberg",
    subs: "541K subscribers",
    avatar: "https://yt3.googleusercontent.com/5wiiTxMamM0NnCmGOt0iJ6eoVRmFLNIGF-BEiTZ_AVqaS02YIxAsB-2XY6xwLCUWQfoENG1MHKo=s900-c-k-c0x00ffffff-no-rj",
    channelUrl: "https://www.youtube.com/@gregisenberg",
    bannerColor: "#6366f1",
    tagline: "How entrepreneurs are turning OpenClaw into real revenue.",
    videos: [
      { id: "i13XK-uUOLQ", title: "Making $$$ with OpenClaw", views: "138K views", duration: "52:04" },
      { id: "U8kXfk8enrY", title: "Clawdbot / OpenClaw Clearly Explained (and how to use it)", views: "317K views", duration: "35:14" },
    ],
  },
];

export default function SlideF() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-4">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Go deeper</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Two channels worth subscribing to.</p>
      </div>

      {/* Channel cards */}
      <div className="flex gap-5 flex-1 min-h-0">
        {CREATORS.map((creator, ci) => (
          <a
            key={ci}
            href={creator.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white"
            style={{
              border: "1px solid #e5e7eb",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: `${150 + ci * 120}ms`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div
              className="flex-shrink-0 relative"
              style={{
                height: 90,
                background: `linear-gradient(135deg, ${creator.bannerColor}cc 0%, ${creator.bannerColor}55 100%)`,
              }}
            >
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)"
              }} />

              {/* Subscribe button top right */}
              <div
                className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: "#fff", color: "#111" }}
              >
                Subscribe
              </div>

              {/* Avatar — overlaps banner */}
              <div
                className="absolute rounded-full overflow-hidden flex-shrink-0"
                style={{ width: 64, height: 64, bottom: -24, left: 20, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Channel info */}
            <div className="px-5 pt-8 pb-3 flex-shrink-0">
              <div className="text-base font-bold text-gray-900">{creator.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{creator.handle} · {creator.subs}</div>
              <p className="text-sm text-gray-500 mt-2 leading-snug">{creator.tagline}</p>
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-gray-100 flex-shrink-0" />

            {/* Videos grid */}
            <div className="grid grid-cols-2 gap-3 p-4 flex-1">
              {creator.videos.map((video, vi) => (
                <div key={vi} className="flex flex-col gap-1.5">
                  {/* Thumbnail */}
                  <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Duration */}
                    <span
                      className="absolute bottom-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }}
                    >
                      {video.duration}
                    </span>
                  </div>
                  {/* Title + views */}
                  <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{video.title}</p>
                  <p className="text-[10px] text-gray-400">{video.views}</p>
                </div>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
