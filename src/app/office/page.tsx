"use client";

import { useState } from "react";
import Image from "next/image";
import Shell from "@/components/Shell";
import { teamMembers, useActivities, agentColors, type TeamMember, type Activity } from "@/lib/data-provider";

const deskAccessories: Record<string, string[]> = {
  ben: ["☕", "🖥️", "🏆"],
  sam: ["💻", "📋", "🔗"],
  cara: ["🎧", "💬", "☕"],
  dana: ["📊", "🧮", "🌿"],
  miles: ["🚀", "📈", "🎯"],
  penny: ["📌", "✏️", "🌸"],
  mia: ["📱", "🎨", "🪴"],
};

// Desk positions for natural office layout (percentage-based)
const deskPositions: Record<string, { top: string; left: string; rotate: number }> = {
  ben:   { top: "8%",  left: "65%", rotate: -3 },   // Corner office, top right
  sam:   { top: "30%", left: "15%", rotate: 2 },     // Near the door, coordinating
  cara:  { top: "30%", left: "55%", rotate: -1 },    // Middle cluster
  dana:  { top: "55%", left: "35%", rotate: 1 },     // Center, data hub
  miles: { top: "55%", left: "70%", rotate: -2 },    // Near Miles, facing Dana
  penny: { top: "75%", left: "15%", rotate: 3 },     // Quiet corner
  mia:   { top: "75%", left: "60%", rotate: -1 },    // Social corner
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AgentDesk({
  member,
  activities,
  onClick,
  isSelected,
}: {
  member: TeamMember;
  activities: Activity[];
  onClick: () => void;
  isSelected: boolean;
}) {
  const color = agentColors[member.id] || "#666";
  const latest = activities[0];
  const isActive = latest && Date.now() - latest.createdAt < 24 * 3600000;
  const pos = deskPositions[member.id];
  const accessories = deskAccessories[member.id] || [];

  return (
    <div
      className="absolute transition-all duration-300 group cursor-pointer"
      style={{ top: pos.top, left: pos.left, transform: `translate(-50%, -50%)` }}
      onClick={onClick}
    >
      {/* Desk surface */}
      <div
        className={`relative w-44 rounded-2xl border p-4 pt-3 transition-all duration-300
          ${isSelected ? "border-white/30 bg-white/[0.08] scale-105 shadow-2xl" : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] hover:scale-[1.03]"}
        `}
        style={{
          transform: `rotate(${pos.rotate}deg)`,
          boxShadow: isActive ? `0 0 30px ${color}15, 0 4px 20px rgba(0,0,0,0.4)` : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Active glow ring */}
        {isActive && (
          <div
            className="absolute -inset-[1px] rounded-2xl opacity-40 animate-pulse pointer-events-none"
            style={{ boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}10` }}
          />
        )}

        {/* Avatar */}
        <div className="flex justify-center mb-2">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-2 transition-transform duration-500 group-hover:scale-105"
              style={{ borderColor: `${color}60` }}
            >
              <Image
                src={member.avatar || ""}
                alt={member.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Status dot */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${isActive ? "animate-pulse" : ""}`}
              style={{ backgroundColor: isActive ? "#22c55e" : "#52525b" }}
            />
          </div>
        </div>

        {/* Name */}
        <p className="text-center text-sm font-semibold text-white/90 mb-0.5">{member.name}</p>

        {/* Role tooltip on hover */}
        <p className="text-center text-[10px] text-white/30 mb-2 group-hover:text-white/50 transition-colors">
          {member.role}
        </p>

        {/* Status bubble */}
        <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5">
          <p className="text-[10px] text-white/50 leading-snug line-clamp-2">
            {latest ? latest.title : "Idle"}
          </p>
          {latest && (
            <p className="text-[9px] mt-0.5" style={{ color: `${color}99` }}>
              {timeAgo(latest.createdAt)}
            </p>
          )}
        </div>

        {/* Desk accessories */}
        <div className="flex gap-1 mt-2 justify-center">
          {accessories.map((a, i) => (
            <span key={i} className="text-xs opacity-40 group-hover:opacity-60 transition-opacity">{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityPanel({ member, activities, onClose }: { member: TeamMember; activities: Activity[]; onClose: () => void }) {
  const color = agentColors[member.id] || "#666";
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-[#111] border-l border-white/[0.06] z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: `${color}60` }}>
              <Image src={member.avatar || ""} alt={member.name} width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{member.name}</p>
              <p className="text-xs text-white/40">{member.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-lg transition-colors">✕</button>
        </div>

        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Recent Activity</p>

        {activities.length === 0 ? (
          <p className="text-xs text-white/30">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a._id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-xs text-white/70 leading-snug">{a.title}</p>
                {a.description && <p className="text-[10px] text-white/30 mt-1 leading-snug">{a.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${a.status === "success" ? "bg-green-400" : a.status === "error" ? "bg-red-400" : "bg-blue-400"}`} />
                  <span className="text-[10px] text-white/30">{timeAgo(a.createdAt)}</span>
                  {a.product && <span className="text-[10px] text-white/20">· {a.product}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {member.dataSources.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-white/30 mt-5 mb-2">Data Sources</p>
            <div className="flex flex-wrap gap-1.5">
              {member.dataSources.map((ds) => (
                <span key={ds} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40">{ds}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OfficePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const activities = useActivities();

  const getAgentActivities = (id: string) =>
    activities.filter((a) => a.agent === id).slice(0, 8);

  const selectedMember = selected ? teamMembers.find((m) => m.id === selected) : null;

  return (
    <Shell>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-white/[0.06]">
          <h1 className="text-lg font-semibold text-white">Virtual Office</h1>
          <p className="text-xs text-white/30 mt-0.5">Click on an agent to view their activity</p>
        </div>

        {/* Office floor — desktop: absolute positioned, mobile: stacked */}
        <div className="flex-1 overflow-auto relative">
          {/* Desktop layout */}
          <div className="hidden md:block relative w-full h-full min-h-[700px]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          >
            {teamMembers.map((member) => (
              <AgentDesk
                key={member.id}
                member={member}
                activities={getAgentActivities(member.id)}
                onClick={() => setSelected(selected === member.id ? null : member.id)}
                isSelected={selected === member.id}
              />
            ))}
          </div>

          {/* Mobile layout — stacked cards */}
          <div className="md:hidden p-4 space-y-3">
            {teamMembers.map((member) => {
              const color = agentColors[member.id] || "#666";
              const agentActs = getAgentActivities(member.id);
              const latest = agentActs[0];
              const isActive = latest && Date.now() - latest.createdAt < 24 * 3600000;

              return (
                <div
                  key={member.id}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    selected === member.id ? "border-white/20 bg-white/[0.06]" : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                  onClick={() => setSelected(selected === member.id ? null : member.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: `${color}60` }}>
                        <Image src={member.avatar || ""} alt={member.name} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${isActive ? "animate-pulse" : ""}`}
                        style={{ backgroundColor: isActive ? "#22c55e" : "#52525b" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90">{member.name}</p>
                      <p className="text-[10px] text-white/30">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 line-clamp-1 max-w-[120px]">{latest ? latest.title : "Idle"}</p>
                      {latest && <p className="text-[9px]" style={{ color: `${color}80` }}>{timeAgo(latest.createdAt)}</p>}
                    </div>
                  </div>

                  {selected === member.id && agentActs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                      {agentActs.slice(0, 4).map((a) => (
                        <div key={a._id} className="flex items-start gap-2">
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${a.status === "success" ? "bg-green-400" : "bg-blue-400"}`} />
                          <div>
                            <p className="text-[11px] text-white/50 leading-snug">{a.title}</p>
                            <p className="text-[9px] text-white/25">{timeAgo(a.createdAt)}</p>
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
      </div>

      {/* Side panel — desktop only */}
      {selectedMember && (
        <div className="hidden md:block">
          <ActivityPanel
            member={selectedMember}
            activities={getAgentActivities(selectedMember.id)}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </Shell>
  );
}
