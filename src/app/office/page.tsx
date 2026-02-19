"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Shell from "@/components/Shell";
import AgentDrawer from "@/components/AgentDrawer";
import AgentSidePanel from "@/components/AgentSidePanel";
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

// Positions are pixel offsets inside a 1000×600 container
// Top row (5): Ben, Sam, Devin, Cara, Frankie
// Bottom row (4): Dana, Miles, Penny, Mia
const deskLayout: Record<
  string,
  { x: number; y: number; facing: "down" | "left" | "right" | "up" }
> = {
  ben:    { x: 100,  y: 50,  facing: "down" },
  sam:    { x: 300,  y: 50,  facing: "down" },
  devin:  { x: 500,  y: 50,  facing: "down" },
  cara:   { x: 700,  y: 50,  facing: "down" },
  frankie:{ x: 900,  y: 50,  facing: "down" },
  dana:   { x: 150,  y: 380, facing: "down" },
  miles:  { x: 383,  y: 380, facing: "down" },
  penny:  { x: 617,  y: 380, facing: "down" },
  mia:    { x: 850,  y: 380, facing: "down" },
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

        {/* Top-down office (responsive) — 1000×600 */}
        <OfficeCanvas
          selected={selected}
          setSelected={setSelected}
          activities={activities}
          getAgentActivities={getAgentActivities}
          selectedMember={selectedMember}
        />
      </div>
    </Shell>
  );
}

function OfficeCanvas({
  selected,
  setSelected,
  activities,
  getAgentActivities,
  selectedMember,
}: {
  selected: string | null;
  setSelected: (id: string | null) => void;
  activities: Activity[];
  getAgentActivities: (id: string) => Activity[];
  selectedMember: TeamMember | null | undefined;
}) {
  const OFFICE_W = 1000;
  const OFFICE_H = 600;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const recalc = useCallback(() => {
    if (!wrapperRef.current) return;
    const w = wrapperRef.current.clientWidth;
    setScale(Math.min(w / OFFICE_W, 1));
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [recalc]);

  return (
    <>
      <div ref={wrapperRef} className="flex flex-1 items-start justify-center overflow-auto p-4 md:p-6 md:items-center">
        <div
          style={{
            width: OFFICE_W * scale,
            height: OFFICE_H * scale,
          }}
        >
          <div
            className="relative"
            style={{
              width: OFFICE_W,
              height: OFFICE_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              backgroundImage: `repeating-conic-gradient(#1a1a1a 0% 25%, #151515 0% 50%)`,
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

              {/* Desktop side panel rendered outside scaled container */}
          </div>
        </div>
      </div>

      {/* Desktop: Side Panel */}
      {!isMobile && selectedMember && (
        <AgentSidePanel
          member={selectedMember}
          activities={activities}
          isOpen={true}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Mobile bottom drawer */}
      {isMobile && selectedMember && (
        <AgentDrawer
          member={selectedMember}
          activities={activities}
          isOpen={true}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
