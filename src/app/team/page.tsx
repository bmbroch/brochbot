"use client";

import Shell from "@/components/Shell";
import { useTeam, useActivities, agentColors } from "@/lib/data-provider";

export default function TeamPage() {
  const team = useTeam();
  const activities = useActivities();

  return (
    <Shell>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-zinc-500 mt-1">Your AI agent workforce</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {team.map((member) => {
            const color = agentColors[member.id] || "#3b82f6";
            const recentActivities = activities.filter((a) => a.agent === member.id);
            const recentCount = recentActivities.filter((a) => Date.now() - a.createdAt < 86400000).length;
            const isActive = recentCount > 0;

            return (
              <div
                key={member.id}
                className="p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {member.emoji}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${isActive ? "bg-green-400" : "bg-zinc-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{member.name}</h3>
                    <p className="text-xs font-medium mt-0.5" style={{ color }}>{member.role}</p>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{member.description}</p>
                  </div>
                </div>

                {/* Data sources */}
                <div className="mt-4">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Data Sources</p>
                  <div className="flex flex-wrap gap-1">
                    {member.dataSources.map((ds) => (
                      <span key={ds} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-[#262626]">
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
                    <span className="text-[11px] text-zinc-500">{isActive ? "Active" : "Idle"}</span>
                  </div>
                  <span className="text-[11px] text-zinc-600">{recentCount} actions today</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
