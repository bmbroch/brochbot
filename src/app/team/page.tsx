"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useActivities, agentColors, teamMembers, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";
import Ben from "@/components/characters/Ben";
import Sam from "@/components/characters/Sam";
import Cara from "@/components/characters/Cara";
import Dana from "@/components/characters/Dana";
import Miles from "@/components/characters/Miles";
import Penny from "@/components/characters/Penny";
import Mia from "@/components/characters/Mia";

// ─── Detail Panel ────────────────────────────────────────────────────────────

function DetailPanel({ member, activities, onClose }: { member: TeamMember; activities: Activity[]; onClose: () => void }) {
  const color = agentColors[member.id] || "#3b82f6";
  const recent = activities.filter(a => a.agent === member.id).slice(0, 5);
  const todayCount = activities.filter(a => a.agent === member.id && Date.now() - a.createdAt < 86400000).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#262626]" style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${color}20` }}>
                {member.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold">{member.name}</h2>
                <p className="text-sm font-medium" style={{ color }}>{member.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${todayCount > 0 ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
                  <span className="text-xs text-zinc-500">{todayCount > 0 ? "Active" : "Idle"} · {todayCount} actions today</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl leading-none p-1">×</button>
          </div>
        </div>
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">About</p>
            <p className="text-sm text-zinc-400 leading-relaxed">{member.description}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Data Sources</p>
            <div className="flex flex-wrap gap-1.5">
              {member.dataSources.map(ds => (
                <span key={ds} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-[#262626]">{ds}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Recent Activity</p>
            {recent.length === 0 ? (
              <p className="text-xs text-zinc-600">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recent.map(a => (
                  <div key={a._id} className="flex items-start gap-2 text-xs">
                    <span className="text-zinc-600 w-16 flex-shrink-0">{formatRelativeDate(a.createdAt)}</span>
                    <span className="text-zinc-400">{a.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Character Components Map ────────────────────────────────────────────────

const characterComponents: Record<string, React.FC<{ hover: boolean }>> = {
  ben: Ben,
  sam: Sam,
  cara: Cara,
  dana: Dana,
  miles: Miles,
  penny: Penny,
  mia: Mia,
};

// ─── Office Layout ───────────────────────────────────────────────────────────

const officePositions = [
  { id: "sam", row: 0, col: 1, label: "center" },
  { id: "cara", row: 1, col: 0, label: "left" },
  { id: "dana", row: 1, col: 2, label: "right" },
  { id: "penny", row: 2, col: 0, label: "left" },
  { id: "miles", row: 2, col: 1, label: "center" },
  { id: "mia", row: 2, col: 2, label: "right" },
  { id: "ben", row: 3, col: 1, label: "center" },
];

// ─── Workstation Card ────────────────────────────────────────────────────────

function WorkstationCard({
  member,
  activities,
  onSelect,
}: {
  member: TeamMember;
  activities: Activity[];
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = agentColors[member.id] || "#3b82f6";
  const todayCount = activities.filter(a => a.agent === member.id && Date.now() - a.createdAt < 86400000).length;
  const isActive = todayCount > 0;
  const lastAct = activities.find(a => a.agent === member.id);
  const CharComp = characterComponents[member.id];

  return (
    <div
      className="relative group cursor-pointer transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `radial-gradient(circle, ${color}15, transparent)` }}
      />

      <div
        className="relative rounded-2xl border border-[#1e1e1e] bg-[#0e0e0e] overflow-hidden transition-all duration-300 group-hover:border-[#333] group-hover:bg-[#111]"
        style={{
          boxShadow: hovered ? `0 0 30px ${color}08, 0 8px 32px rgba(0,0,0,0.4)` : '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        {/* Character scene */}
        <div className="relative h-44 overflow-hidden">
          {/* Ambient desk lamp glow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30"
            style={{ background: `radial-gradient(ellipse at center bottom, ${color}15, transparent)` }}
          />
          {CharComp && <CharComp hover={hovered} />}
        </div>

        {/* Info bar */}
        <div className="relative px-4 py-3 border-t border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{member.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold leading-tight">{member.name}</h3>
                <p className="text-[11px] font-medium" style={{ color }}>{member.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <span className="text-[10px] text-zinc-500">{todayCount}</span>
              )}
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-green-400" : "bg-zinc-700"}`}>
                {isActive && (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                )}
              </div>
            </div>
          </div>
          {/* Last activity */}
          <p className="text-[10px] text-zinc-600 mt-1.5 truncate">
            {lastAct ? lastAct.title : "No recent activity"}
          </p>
        </div>
      </div>

      {/* Tooltip on hover */}
      {hovered && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] shadow-xl whitespace-nowrap">
          <p className="text-xs font-medium text-white">{member.emoji} {member.name} — {member.role}</p>
          <p className="text-[10px] text-zinc-500">{isActive ? `${todayCount} actions today` : "Idle"} · Click for details</p>
        </div>
      )}
    </div>
  );
}

// ─── Office Environment Elements ─────────────────────────────────────────────

function OfficeEnvironment() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Grid floor */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      {/* Ceiling ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[200px] bg-gradient-to-b from-blue-500/[0.015] to-transparent rounded-full" />
      {/* Warm side glow */}
      <div className="absolute top-1/3 -left-20 w-[300px] h-[400px] bg-gradient-to-r from-amber-500/[0.01] to-transparent rounded-full" />
      <div className="absolute top-1/4 -right-20 w-[300px] h-[400px] bg-gradient-to-l from-blue-500/[0.01] to-transparent rounded-full" />
    </div>
  );
}

// ─── Main Team/Office Page ───────────────────────────────────────────────────

export default function TeamPage() {
  const activities = useActivities();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMember = selectedId ? teamMembers.find(m => m.id === selectedId) : null;

  return (
    <Shell>
      <div className="p-6 lg:p-8 relative min-h-screen">
        <OfficeEnvironment />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">The Office</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-500 border border-[#262626]">7 agents</span>
            </div>
            <p className="text-sm text-zinc-500">Where the magic happens — click anyone to learn more ✨</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-zinc-500">Active today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="text-xs text-zinc-500">Idle</span>
            </div>
          </div>

          {/* Office Grid */}
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Row 0: Sam center */}
            <div className="grid grid-cols-3 gap-6">
              <div /> {/* empty */}
              {officePositions.filter(p => p.row === 0).map(pos => {
                const member = teamMembers.find(m => m.id === pos.id)!;
                return (
                  <WorkstationCard
                    key={pos.id}
                    member={member}
                    activities={activities}
                    onSelect={() => setSelectedId(pos.id)}
                  />
                );
              })}
              <div /> {/* empty */}
            </div>

            {/* Row 1: Cara + empty + Dana */}
            <div className="grid grid-cols-3 gap-6">
              {(() => {
                const row1 = officePositions.filter(p => p.row === 1);
                return [0, 1, 2].map(col => {
                  const pos = row1.find(p => p.col === col);
                  if (!pos) return <div key={col} />;
                  const member = teamMembers.find(m => m.id === pos.id)!;
                  return (
                    <WorkstationCard
                      key={pos.id}
                      member={member}
                      activities={activities}
                      onSelect={() => setSelectedId(pos.id)}
                    />
                  );
                });
              })()}
            </div>

            {/* Row 2: Penny + Miles + Mia */}
            <div className="grid grid-cols-3 gap-6">
              {officePositions.filter(p => p.row === 2).map(pos => {
                const member = teamMembers.find(m => m.id === pos.id)!;
                return (
                  <WorkstationCard
                    key={pos.id}
                    member={member}
                    activities={activities}
                    onSelect={() => setSelectedId(pos.id)}
                  />
                );
              })}
            </div>

            {/* Row 3: Ben center */}
            <div className="grid grid-cols-3 gap-6">
              <div /> {/* empty */}
              {officePositions.filter(p => p.row === 3).map(pos => {
                const member = teamMembers.find(m => m.id === pos.id)!;
                return (
                  <WorkstationCard
                    key={pos.id}
                    member={member}
                    activities={activities}
                    onSelect={() => setSelectedId(pos.id)}
                  />
                );
              })}
              <div /> {/* empty */}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMember && (
        <DetailPanel member={selectedMember} activities={activities} onClose={() => setSelectedId(null)} />
      )}
    </Shell>
  );
}
