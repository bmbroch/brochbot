"use client";

import { useEffect, useState } from "react";

const CREATORS = [
  {
    name: "Riley Brown",
    handle: "@rileybrown_ai",
    subs: "150K subscribers",
    avatar: "https://yt3.googleusercontent.com/Cm_AOGXEC3TYdp2iOXTUj07zgqBkCMJjh4C-0iD0DJOALbMb-D2tz9fJ2e-EDE5DJnJCnd3PaA=s176-c-k-c0x00ffffff-no-rj",
    bannerVideoId: "ISb0nrlNoKQ",
    channelUrl: "https://www.youtube.com/@rileybrown_ai",
    accentColor: "#f59e0b",
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
    avatar: "https://yt3.googleusercontent.com/5wiiTxMamM0NnCmGOt0iJ6eoVRmFLNIGF-BEiTZ_AVqaS02YIxAsB-2XY6xwLCUWQfoENG1MHKo=s176-c-k-c0x00ffffff-no-rj",
    bannerVideoId: "i13XK-uUOLQ",
    channelUrl: "https://www.youtube.com/@gregisenberg",
    accentColor: "#6366f1",
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
        {CREATORS.map((c, ci) => (
          <div
            key={ci}
            className="flex-1 flex flex-col rounded-2xl shadow-lg bg-white"
            style={{
              border: "1px solid #e5e7eb",
              overflow: "visible",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: `${150 + ci * 120}ms`,
            }}
          >
            {/* ── Banner: blurred video thumbnail ── */}
            <div className="relative flex-shrink-0" style={{ height: 110 }}>
              {/* Inner wrapper clips image to rounded top corners only */}
              <div className="absolute inset-0 rounded-t-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${c.bannerVideoId}/maxresdefault.jpg`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "blur(6px) brightness(0.55) saturate(1.3)", transform: "scale(1.08)" }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
              </div>

              {/* Subscribe button */}
              <a
                href={c.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity z-10"
                style={{ background: "#fff", color: "#111" }}
                onClick={(e) => e.stopPropagation()}
              >
                Subscribe
              </a>

              {/* Avatar — overflows banner, not clipped */}
              <div
                className="absolute rounded-full overflow-hidden z-10"
                style={{ width: 62, height: 62, bottom: -24, left: 18, border: "3px solid #fff", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* ── Channel info ── */}
            <div className="px-4 pt-7 pb-2 flex-shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">{c.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.handle} · {c.subs}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 leading-snug">{c.tagline}</p>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-gray-100 flex-shrink-0 my-2" />

            {/* ── Video grid ── */}
            <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 flex-1 min-h-0">
              {c.videos.map((video, vi) => (
                <a
                  key={vi}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Thumbnail */}
                  <div className="relative rounded-xl overflow-hidden w-full" style={{ aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Duration */}
                    <span
                      className="absolute bottom-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(0,0,0,0.82)", color: "#fff" }}
                    >
                      {video.duration}
                    </span>
                    {/* Play on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.25)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 shadow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={c.accentColor}><polygon points="5,3 19,12 5,21" /></svg>
                      </div>
                    </div>
                  </div>
                  {/* Title + views */}
                  <p className="text-[11px] font-semibold text-gray-800 leading-snug line-clamp-2">{video.title}</p>
                  <p className="text-[10px] text-gray-400">{video.views}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
