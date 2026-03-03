"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const CREATORS = [
  {
    name: "Riley Brown",
    handle: "@rileybrown_ai",
    avatar: "R",
    avatarColor: "#f59e0b",
    tagline: "Building an AI superteam in public",
    why: "Riley documents every step of his OpenClaw setup — from building specialized agents to giving them new skills. If you want to see what's possible, this is the channel.",
    tags: ["agent building", "vibe coding", "creative use cases"],
    videos: [
      { id: "ISb0nrlNoKQ", title: "Why Specialized Agents are Superior", views: "48K views", duration: "18:16" },
      { id: "Yt6imPC1FhA", title: "OpenClaw Replaced 1,000 Hours of Video Editing Tutorials", views: "53K views", duration: "12:06" },
    ],
    channelUrl: "https://www.youtube.com/@rileybrown_ai",
  },
  {
    name: "Greg Isenberg",
    handle: "@gregisenberg",
    avatar: "G",
    avatarColor: "#6366f1",
    tagline: "How to actually make money with OpenClaw",
    why: "Greg breaks down the business side — how entrepreneurs are turning OpenClaw into real revenue. If Riley shows you how to build it, Greg shows you why it matters.",
    tags: ["business", "solopreneur", "making money"],
    videos: [
      { id: "i13XK-uUOLQ", title: "Making $$$ with OpenClaw", views: "138K views", duration: "52:04" },
      { id: "U8kXfk8enrY", title: "Clawdbot / OpenClaw Clearly Explained", views: "317K views", duration: "35:14" },
    ],
    channelUrl: "https://www.youtube.com/@gregisenberg",
  },
];

export default function SlideF() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-5">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Go deeper</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Two creators worth following if you want to keep learning.</p>
      </div>

      {/* Creator cards */}
      <div className="flex gap-5 flex-1 min-h-0">
        {CREATORS.map((creator, ci) => (
          <div
            key={ci}
            className="flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: `${150 + ci * 120}ms`,
            }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full flex-shrink-0" style={{ background: creator.avatarColor }} />

            <div className="flex flex-col flex-1 px-5 pt-4 pb-4 gap-3 min-h-0">
              {/* Creator identity */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                  style={{ background: creator.avatarColor }}
                >
                  {creator.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-base">{creator.name}</div>
                  <div className="text-xs text-gray-400">{creator.handle}</div>
                </div>
                <a
                  href={creator.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: creator.avatarColor, color: "#fff" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Follow →
                </a>
              </div>

              {/* Tagline */}
              <p className="text-sm font-semibold text-gray-800 italic">&ldquo;{creator.tagline}&rdquo;</p>

              {/* Why follow */}
              <p className="text-xs text-gray-500 leading-relaxed">{creator.why}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {creator.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${creator.avatarColor}14`, color: creator.avatarColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Videos — compact list */}
              <div className="flex flex-col gap-2 mt-auto">
                {creator.videos.map((video, vi) => (
                  <a
                    key={vi}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    style={{ border: "1px solid #f3f4f6" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Mini thumbnail */}
                    <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 72, height: 40 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/default.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 leading-snug line-clamp-2">{video.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{video.views} · {video.duration}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
