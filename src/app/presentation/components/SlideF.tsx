"use client";

import { useEffect, useState } from "react";

const CREATORS = [
  {
    name: "Riley Brown",
    handle: "@rileybrown_ai",
    subs: "150K subscribers",
    avatar: "https://yt3.googleusercontent.com/Cm_AOGXEC3TYdp2iOXTUj07zgqBkCMJjh4C-0iD0DJOALbMb-D2tz9fJ2e-EDE5DJnJCnd3PaA=s176-c-k-c0x00ffffff-no-rj",
    channelUrl: "https://www.youtube.com/@rileybrown_ai",
    accentColor: "#f59e0b",
    tagline: "Best for: how to build it",
    videos: [
      { id: "ISb0nrlNoKQ", title: "Why Specialized Agents are Superior", views: "48K views", duration: "18:16" },
      { id: "Yt6imPC1FhA", title: "OpenClaw Replaced 1,000 Hours of Video Editing Tutorials", views: "53K views", duration: "12:06" },
    ],
  },
  {
    name: "Greg Isenberg",
    handle: "@gregisenberg",
    subs: "541K subscribers",
    avatar: "https://yt3.googleusercontent.com/5wiiTxMamM0NnCmGOt0iJ6eoVRmFLNIGF-BEiTZ_AVqaS02YIxAsB-2XY6xwLCUWQfoENG1MHKo=s176-c-k-c0x00ffffff-no-rj",
    channelUrl: "https://www.youtube.com/@gregisenberg",
    accentColor: "#6366f1",
    tagline: "Best for: why it matters",
    videos: [
      { id: "i13XK-uUOLQ", title: "Making $$$ with OpenClaw", views: "138K views", duration: "52:04" },
      { id: "U8kXfk8enrY", title: "Clawdbot / OpenClaw Clearly Explained", views: "317K views", duration: "35:14" },
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

      {/* Two channel cards */}
      <div className="flex gap-5 flex-1 min-h-0">
        {CREATORS.map((c, ci) => (
          <div
            key={ci}
            className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-md bg-white"
            style={{
              border: `1.5px solid ${c.accentColor}40`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: `${150 + ci * 120}ms`,
            }}
          >
            {/* Banner */}
            <div
              className="relative flex-shrink-0"
              style={{
                height: 80,
                background: `linear-gradient(120deg, ${c.accentColor} 0%, ${c.accentColor}88 100%)`,
              }}
            >
              {/* Subtle noise/texture */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 8px)`
              }} />
              {/* Channel name large in banner */}
              <div className="absolute bottom-3 right-4 text-white/40 font-black text-2xl tracking-tight select-none">
                {c.name.split(" ")[0].toUpperCase()}
              </div>
            </div>

            {/* Avatar + info row */}
            <div className="flex items-end gap-3 px-4 pt-0 pb-3 flex-shrink-0" style={{ marginTop: -28 }}>
              {/* Avatar */}
              <div
                className="rounded-full overflow-hidden flex-shrink-0"
                style={{ width: 56, height: 56, border: "3px solid #fff", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pt-7">
                <div className="font-bold text-gray-900 text-sm leading-tight truncate">{c.name}</div>
                <div className="text-xs text-gray-400 truncate">{c.handle} · {c.subs}</div>
              </div>
              <a
                href={c.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg mt-7 hover:opacity-80 transition-opacity"
                style={{ background: c.accentColor, color: "#fff" }}
                onClick={(e) => e.stopPropagation()}
              >
                Subscribe
              </a>
            </div>

            {/* Tagline */}
            <div className="px-4 pb-3 flex-shrink-0">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${c.accentColor}14`, color: c.accentColor }}
              >
                {c.tagline}
              </span>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px flex-shrink-0" style={{ background: "#f3f4f6" }} />

            {/* Video grid — 2×1 stack, big thumbnails */}
            <div className="flex flex-col gap-3 p-4 flex-1 min-h-0">
              {c.videos.map((video, vi) => (
                <a
                  key={vi}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 items-start hover:bg-gray-50 rounded-xl p-1.5 transition-colors flex-1 min-h-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Thumbnail */}
                  <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: 140, aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute bottom-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(0,0,0,0.82)", color: "#fff" }}
                    >
                      {video.duration}
                    </span>
                    {/* Play hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.25)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={c.accentColor}><polygon points="5,3 19,12 5,21" /></svg>
                      </div>
                    </div>
                  </div>
                  {/* Meta */}
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-3">{video.title}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{video.views} · {video.duration}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
