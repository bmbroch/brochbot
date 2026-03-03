"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const CREATORS = [
  {
    name: "Riley Brown",
    handle: "@rileybrown_ai",
    color: "#f59e0b",
    videos: [
      {
        id: "ISb0nrlNoKQ",
        title: "Why Specialized Agents are Superior (How I Built an OpenClaw Superteam)",
        views: "48K views",
        duration: "18:16",
      },
      {
        id: "Yt6imPC1FhA",
        title: "OpenClaw Just Replaced 1,000 Hours of Video Editing Tutorials",
        views: "53K views",
        duration: "12:06",
      },
    ],
  },
  {
    name: "Greg Isenberg",
    handle: "@gregisenberg",
    color: "#6366f1",
    videos: [
      {
        id: "i13XK-uUOLQ",
        title: "Making $$$ with OpenClaw",
        views: "138K views",
        duration: "52:04",
      },
      {
        id: "U8kXfk8enrY",
        title: "Clawdbot/OpenClaw Clearly Explained (and how to use it)",
        views: "317K views",
        duration: "35:14",
      },
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
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 gap-6">
      {/* Heading */}
      <div
        className="text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Learn from the best
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          Real people building real things with OpenClaw.
        </p>
      </div>

      {/* Two creator columns */}
      <div className="flex gap-6 w-full max-w-4xl">
        {CREATORS.map((creator, ci) => (
          <div
            key={ci}
            className="flex-1 flex flex-col gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: `${180 + ci * 120}ms`,
            }}
          >
            {/* Creator header */}
            <div className="flex items-center gap-2 px-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: creator.color }}
              />
              <span className="font-bold text-gray-900 text-sm">{creator.name}</span>
              <span className="text-xs text-gray-400">{creator.handle}</span>
            </div>

            {/* Video cards */}
            {creator.videos.map((video, vi) => (
              <a
                key={vi}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                  transitionDelay: `${220 + ci * 120 + vi * 80}ms`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Thumbnail */}
                <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Duration badge */}
                  <span
                    className="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }}
                  >
                    {video.duration}
                  </span>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={CORAL}>
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="px-3 py-2.5 flex flex-col gap-1">
                  <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{video.title}</p>
                  <span className="text-[10px] text-gray-400 font-medium">{video.views}</span>
                </div>

                {/* Accent bottom line */}
                <div className="h-0.5 w-full" style={{ background: creator.color }} />
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
