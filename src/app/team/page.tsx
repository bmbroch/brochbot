"use client";

import Shell from "@/components/Shell";
import { useState, useRef, useEffect } from "react";
import { useActivities, agentColors, teamMembers, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

const agentOrder = ["sam", "cara", "dana", "miles", "penny", "mia", "ben"];

function AccordionPanel({ member, activities }: { member: TeamMember; activities: Activity[] }) {
  const color = agentColors[member.id] || "#3b82f6";
  const recent = activities.filter(a => a.agent === member.id).slice(0, 5);
  const todayCount = activities.filter(a => a.agent === member.id && Date.now() - a.createdAt < 86400000).length;
  const lastAct = activities.find(a => a.agent === member.id);

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex items-start gap-6 flex-wrap">
        {/* About */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">About</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{member.description}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Actions Today</p>
            <p className="text-2xl font-bold" style={{ color }}>{todayCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1">Last Active</p>
            <p className="text-sm text-zinc-400">{lastAct ? formatRelativeDate(lastAct.createdAt) : "—"}</p>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Data Sources</p>
        <div className="flex flex-wrap gap-1.5">
          {member.dataSources.map(ds => (
            <span key={ds} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-[#262626]">{ds}</span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Recent Activity</p>
        {recent.length === 0 ? (
          <p className="text-xs text-zinc-600">No recent activity</p>
        ) : (
          <div className="space-y-1.5">
            {recent.map(a => (
              <div key={a._id} className="flex items-center gap-3 text-xs">
                <span className="text-zinc-600 shrink-0 w-20 text-right">{formatRelativeDate(a.createdAt)}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                <span className="text-zinc-400">{a.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const activities = useActivities();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  const selectedMember = selectedId ? teamMembers.find(m => m.id === selectedId) : null;

  useEffect(() => {
    if (panelRef.current) {
      setPanelHeight(panelRef.current.scrollHeight);
    }
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  return (
    <Shell>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold tracking-tight">The Team</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-500 border border-[#262626]">7 agents</span>
          </div>
          <p className="text-sm text-zinc-500">Meet the crew that runs the show</p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-4xl">
          {agentOrder.map(id => {
            const member = teamMembers.find(m => m.id === id)!;
            const color = agentColors[id] || "#3b82f6";
            const todayCount = activities.filter(a => a.agent === id && Date.now() - a.createdAt < 86400000).length;
            const isActive = todayCount > 0;
            const isSelected = selectedId === id;

            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#444] bg-[#1a1a1a]"
                    : "border-transparent hover:border-[#333] hover:bg-[#111]"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                    boxShadow: isSelected ? `0 0 20px ${color}20` : undefined,
                  }}
                >
                  {member.emoji}
                </div>
                {/* Name */}
                <span className="text-sm font-semibold leading-tight">{member.name}</span>
                {/* Role */}
                <span className="text-[11px] font-medium leading-tight" style={{ color }}>{member.role}</span>
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400" : "bg-zinc-700"}`} />
              </button>
            );
          })}
        </div>

        {/* Accordion Panel */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out max-w-4xl"
          style={{ maxHeight: selectedMember ? `${panelHeight}px` : "0px" }}
        >
          <div ref={panelRef} className="mt-3 rounded-xl border border-[#262626] bg-[#0e0e0e]">
            {selectedMember && (
              <>
                <div className="px-6 pt-4 pb-2 border-b border-[#1e1e1e] flex items-center gap-2">
                  <span className="text-base">{selectedMember.emoji}</span>
                  <span className="text-sm font-semibold">{selectedMember.name}</span>
                  <span className="text-xs text-zinc-500">— {selectedMember.role}</span>
                </div>
                <AccordionPanel member={selectedMember} activities={activities} />
              </>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
