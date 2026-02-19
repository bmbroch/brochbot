"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useActivities, agentColors, teamMembers, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

const agentOrder = ["ben", "sam", "cara", "dana", "miles", "penny", "mia"];

const gradientMap: Record<string, string> = {
  ben: "from-zinc-700/30 to-slate-800/20",
  sam: "from-blue-700/30 to-blue-900/20",
  cara: "from-purple-700/30 to-purple-900/20",
  dana: "from-green-700/30 to-green-900/20",
  miles: "from-orange-600/30 to-orange-900/20",
  penny: "from-rose-600/30 to-pink-900/20",
  mia: "from-fuchsia-600/30 to-fuchsia-900/20",
};

function AccordionPanel({ member, activities }: { member: TeamMember; activities: Activity[] }) {
  const color = agentColors[member.id] || "#3b82f6";
  const recent = activities.filter(a => a.agent === member.id).slice(0, 5);

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
      {/* Description */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">About</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{member.description}</p>
      </div>

      {/* Data Sources */}
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

  const selectedMember = selectedId ? teamMembers.find(m => m.id === selectedId) : null;

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  return (
    <Shell>
      <div className="p-6 lg:p-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">The Team</h1>
          <p className="text-sm text-zinc-500">Meet the crew behind the operation</p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
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
                className="flex flex-col items-center gap-2 group cursor-pointer p-2 sm:p-3 rounded-2xl"
              >
                {/* Avatar Circle */}
                <div
                  className={`w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] rounded-full flex items-center justify-center bg-gradient-to-br ${gradientMap[id] || "from-zinc-700/30 to-zinc-900/20"} transition-all duration-200 group-hover:scale-105`}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 30px ${color}30, 0 4px 20px rgba(0,0,0,0.4)`
                      : "0 4px 20px rgba(0,0,0,0.3)",
                    border: isSelected ? `2px solid ${color}40` : "2px solid transparent",
                  }}
                >
                  <span className="text-[50px] sm:text-[80px] leading-none select-none">{member.emoji}</span>
                </div>
                {/* Name */}
                <span className="text-[14px] sm:text-[16px] font-semibold text-white leading-tight mt-1">{member.name}</span>
                {/* Role */}
                <span className="text-[11px] sm:text-[13px] font-medium leading-tight text-center" style={{ color }}>{member.role}</span>
                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400" : "bg-zinc-700"}`} />
                  <span className={`text-[11px] ${isActive ? "text-green-400" : "text-zinc-600"}`}>
                    {isActive ? "Active" : "Idle"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Accordion Panel */}
        <div
          className="transition-[grid-template-rows] duration-300 ease-in-out grid max-w-6xl mx-auto"
          style={{ gridTemplateRows: selectedMember ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="mt-6 rounded-xl border border-[#262626] bg-[#0e0e0e]">
              {selectedMember && (
                <>
                  <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-[#1e1e1e] flex items-center gap-2">
                    <span className="text-base">{selectedMember.emoji}</span>
                    <span className="text-sm font-semibold">{selectedMember.name}</span>
                    <span className="text-xs text-zinc-500">— {selectedMember.role}</span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    <AccordionPanel member={selectedMember} activities={activities} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
