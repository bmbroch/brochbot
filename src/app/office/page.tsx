"use client";

import { useState } from "react";
import Image from "next/image";
import Shell from "@/components/Shell";
import {
  teamMembers,
  useActivities,
  agentColors,
  type TeamMember,
  type Activity,
} from "@/lib/data-provider";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── desk layout config ──────────────────────────────────────────────────── */

// Positions are pixel offsets inside a 900×600 container
const deskLayout: Record<
  string,
  { x: number; y: number; facing: "down" | "left" | "right" | "up" }
> = {
  ben:   { x: 150, y: 50,  facing: "down" },
  sam:   { x: 450, y: 50,  facing: "down" },
  cara:  { x: 750, y: 50,  facing: "down" },
  dana:  { x: 100, y: 380, facing: "down" },
  miles: { x: 300, y: 380, facing: "down" },
  penny: { x: 600, y: 380, facing: "down" },
  mia:   { x: 800, y: 380, facing: "down" },
};

/* ── components ──────────────────────────────────────────────────────────── */

function Desk({
  member,
  latestActivity,
  isActive,
  isSelected,
  onClick,
}: {
  member: TeamMember;
  latestActivity: Activity | undefined;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const pos = deskLayout[member.id];
  const color = agentColors[member.id] || "#666";

  // desk rectangle + monitor on top, avatar below desk
  return (
    <div
      className="absolute group cursor-pointer"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, 0)" }}
      onClick={onClick}
    >
      {/* Desk surface */}
      <div
        className={`relative w-[120px] h-[56px] rounded-sm transition-transform duration-200 ${
          isSelected ? "scale-105" : "group-hover:scale-[1.04]"
        }`}
        style={{ backgroundColor: "#3a3a3a", boxShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
      >
        {/* Monitor */}
        <div
          className="absolute rounded-sm"
          style={{
            width: 32,
            height: 20,
            backgroundColor: "#2563eb",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 0 8px rgba(37,99,235,0.4)",
          }}
        />
        {/* Monitor stand */}
        <div
          className="absolute"
          style={{
            width: 6,
            height: 8,
            backgroundColor: "#555",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        {/* Keyboard */}
        <div
          className="absolute rounded-sm"
          style={{
            width: 28,
            height: 8,
            backgroundColor: "#4a4a4a",
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Avatar sitting at desk */}
      <div className="flex flex-col items-center mt-1">
        <div className="relative">
          <div
            className={`w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] transition-transform duration-200 ${
              isSelected ? "scale-110" : "group-hover:scale-105"
            }`}
            style={{ borderColor: color }}
          >
            <Image
              src={member.avatar || ""}
              alt={member.name}
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Status dot */}
          <div
            className={`absolute bottom-0 right-0 w-[14px] h-[14px] rounded-full border-2 border-[#1a1a1a] ${
              isActive ? "animate-pulse" : ""
            }`}
            style={{ backgroundColor: isActive ? "#22c55e" : "#52525b" }}
          />
        </div>
        <span className="text-[11px] text-white/80 mt-1 font-medium">{member.name}</span>
      </div>
    </div>
  );
}

function Tooltip({
  member,
  activities,
  onClose,
}: {
  member: TeamMember;
  activities: Activity[];
  onClose: () => void;
}) {
  const color = agentColors[member.id] || "#666";
  const pos = deskLayout[member.id];

  return (
    <div
      className="absolute z-30 w-56 rounded-lg border border-white/10 bg-[#1e1e1e] shadow-xl p-3"
      style={{
        left: Math.min(Math.max(pos.x, 130), 770),
        top: pos.y + 160,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white/30 hover:text-white/60 text-xs"
      >
        ✕
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full overflow-hidden border-2"
          style={{ borderColor: color }}
        >
          <Image
            src={member.avatar || ""}
            alt={member.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{member.name}</p>
          <p className="text-[10px] text-white/40">{member.role}</p>
        </div>
      </div>
      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">
        Latest activity
      </p>
      {activities.length === 0 ? (
        <p className="text-[10px] text-white/30">Idle</p>
      ) : (
        <div className="space-y-1.5">
          {activities.slice(0, 3).map((a) => (
            <div key={a._id} className="text-[10px]">
              <p className="text-white/60 leading-snug">{a.title}</p>
              <p className="text-white/25">{timeAgo(a.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function OfficePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const activities = useActivities();

  const getAgentActivities = (id: string) =>
    activities.filter((a) => a.agent === id).slice(0, 8);

  const selectedMember = selected
    ? teamMembers.find((m) => m.id === selected)
    : null;

  return (
    <Shell>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-white/[0.06]">
          <h1 className="text-lg font-semibold text-white">🏢 Virtual Office</h1>
          <p className="text-xs text-white/30 mt-0.5">
            Click an agent to see their activity
          </p>
        </div>

        {/* Desktop: top-down office */}
        <div className="hidden md:flex flex-1 items-center justify-center overflow-auto p-6">
          <div
            className="relative"
            style={{
              width: 900,
              height: 600,
              backgroundImage: `
                repeating-conic-gradient(#1a1a1a 0% 25%, #151515 0% 50%)
              `,
              backgroundSize: "40px 40px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            {/* ── Furniture ──────────────────────────────── */}

            {/* Meeting table (center ellipse) */}
            <div
              className="absolute rounded-full"
              style={{
                width: 200,
                height: 100,
                backgroundColor: "#4a4038",
                border: "2px solid #5a5048",
                left: "50%",
                top: 250,
                transform: "translateX(-50%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            />
            {/* Table label */}
            <div
              className="absolute text-[9px] text-white/20 text-center"
              style={{
                left: "50%",
                top: 285,
                transform: "translateX(-50%)",
              }}
            >
              Meeting Table
            </div>

            {/* Plants */}
            <div className="absolute text-2xl" style={{ left: 20, top: 20 }}>
              🌳
            </div>
            <div className="absolute text-2xl" style={{ right: 20, top: 20 }}>
              🌿
            </div>
            <div className="absolute text-2xl" style={{ left: 20, bottom: 20 }}>
              🪴
            </div>
            <div className="absolute text-xl" style={{ right: 24, bottom: 24 }}>
              🌳
            </div>

            {/* Water cooler */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: 445, top: 230 }}
            >
              <div
                className="rounded-sm"
                style={{
                  width: 22,
                  height: 34,
                  backgroundColor: "#3b82f6",
                  boxShadow: "0 0 10px rgba(59,130,246,0.3)",
                }}
              />
              <span className="text-[8px] text-white/20 mt-1">Water</span>
            </div>

            {/* Whiteboard */}
            <div
              className="absolute rounded-sm"
              style={{
                width: 140,
                height: 10,
                backgroundColor: "#e8e8e8",
                top: 4,
                left: "50%",
                transform: "translateX(-50%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            />
            <div
              className="absolute text-[8px] text-white/15"
              style={{ top: 16, left: "50%", transform: "translateX(-50%)" }}
            >
              Whiteboard
            </div>

            {/* ── Agents ─────────────────────────────────── */}
            {teamMembers.map((member) => {
              const agentActs = getAgentActivities(member.id);
              const latest = agentActs[0];
              const isActive =
                !!latest && Date.now() - latest.createdAt < 24 * 3600000;

              return (
                <Desk
                  key={member.id}
                  member={member}
                  latestActivity={latest}
                  isActive={isActive}
                  isSelected={selected === member.id}
                  onClick={() =>
                    setSelected(selected === member.id ? null : member.id)
                  }
                />
              );
            })}

            {/* Tooltip */}
            {selectedMember && (
              <Tooltip
                member={selectedMember}
                activities={getAgentActivities(selectedMember.id)}
                onClose={() => setSelected(null)}
              />
            )}
          </div>
        </div>

        {/* Mobile: simplified list */}
        <div className="md:hidden flex-1 overflow-auto p-4 space-y-2">
          {teamMembers.map((member) => {
            const color = agentColors[member.id] || "#666";
            const agentActs = getAgentActivities(member.id);
            const latest = agentActs[0];
            const isActive =
              !!latest && Date.now() - latest.createdAt < 24 * 3600000;

            return (
              <div
                key={member.id}
                className={`rounded-lg border p-3 transition-all cursor-pointer ${
                  selected === member.id
                    ? "border-white/20 bg-white/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
                onClick={() =>
                  setSelected(selected === member.id ? null : member.id)
                }
              >
                <div className="flex items-center gap-3">
                  {/* Mini desk icon */}
                  <div className="relative shrink-0">
                    <div
                      className="w-5 h-3 rounded-sm"
                      style={{ backgroundColor: "#3a3a3a" }}
                    />
                    <div
                      className="absolute w-2 h-1.5 rounded-sm"
                      style={{
                        backgroundColor: "#2563eb",
                        top: 1,
                        left: 6,
                      }}
                    />
                  </div>
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border-2"
                      style={{ borderColor: color }}
                    >
                      <Image
                        src={member.avatar || ""}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
                        isActive ? "animate-pulse" : ""
                      }`}
                      style={{
                        backgroundColor: isActive ? "#22c55e" : "#52525b",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-white/30">{member.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/40 line-clamp-1 max-w-[110px]">
                      {latest ? latest.title : "Idle"}
                    </p>
                    {latest && (
                      <p className="text-[9px]" style={{ color: `${color}80` }}>
                        {timeAgo(latest.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                {selected === member.id && agentActs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5">
                    {agentActs.slice(0, 4).map((a) => (
                      <div key={a._id} className="flex items-start gap-2">
                        <span
                          className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                            a.status === "success"
                              ? "bg-green-400"
                              : "bg-blue-400"
                          }`}
                        />
                        <div>
                          <p className="text-[11px] text-white/50 leading-snug">
                            {a.title}
                          </p>
                          <p className="text-[9px] text-white/25">
                            {timeAgo(a.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
