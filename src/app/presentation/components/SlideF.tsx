"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const VIDEOS = [
  {
    id: "ISb0nrlNoKQ",
    title: "Why Specialized Agents are Superior",
    creator: "Riley Brown",
    views: "48K views",
    duration: "18:16",
    creatorColor: "#f59e0b",
  },
  {
    id: "i13XK-uUOLQ",
    title: "Making $$$ with OpenClaw",
    creator: "Greg Isenberg",
    views: "138K views",
    duration: "52:04",
    creatorColor: "#6366f1",
  },
  {
    id: "Yt6imPC1FhA",
    title: "OpenClaw Replaced 1,000 Hours of Video Editing Tutorials",
    creator: "Riley Brown",
    views: "53K views",
    duration: "12:06",
    creatorColor: "#f59e0b",
  },
  {
    id: "U8kXfk8enrY",
    title: "Clawdbot/OpenClaw Clearly Explained",
    creator: "Greg Isenberg",
    views: "317K views",
    duration: "35:14",
    creatorColor: "#6366f1",
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
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Learn from the best
        </h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">
          Real people building real things with OpenClaw.
        </p>
      </div>

      {/* 2×2 grid — thumbnails fill the space */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {VIDEOS.map((video, i) => (
          <a
            key={i}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.97)",
              transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s ease",
              transitionDelay: `${150 + i * 70}ms`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thumbnail fills the entire card */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay — always on at bottom */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0) 100%)",
              }}
            />

            {/* Duration — top right */}
            <span
              className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{ background: "rgba(0,0,0,0.72)", color: "#fff" }}
            >
              {video.duration}
            </span>

            {/* Creator badge — top left */}
            <span
              className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: video.creatorColor, color: "#fff" }}
            >
              {video.creator}
            </span>

            {/* Play button — center, shows on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "rgba(255,255,255,0.92)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={CORAL}>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>

            {/* Title + views — bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
              <p className="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow">
                {video.title}
              </p>
              <p className="text-xs text-white/60 mt-0.5 font-medium">{video.views}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
