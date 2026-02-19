"use client";

import Shell from "@/components/Shell";
import AgentDrawer from "@/components/AgentDrawer";
import AgentSidePanel from "@/components/AgentSidePanel";
import { useState, useEffect } from "react";
import { agentColors, useTeam, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";
import Image from "next/image";

function relativeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const days = Math.floor(diff / 86_400_000);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function lastActiveLabel(ts: number | null): string {
  if (ts === null) return "Never";
  return `Last active ${relativeAgo(ts)}`;
}

const agentOrder = ["ben", "sam", "devin", "cara", "dana", "miles", "penny", "mia", "frankie"];

const gradientMap: Record<string, string> = {
  ben: "from-zinc-700/30 to-slate-800/20",
  sam: "from-blue-700/30 to-blue-900/20",
  cara: "from-purple-700/30 to-purple-900/20",
  dana: "from-green-700/30 to-green-900/20",
  miles: "from-orange-600/30 to-orange-900/20",
  penny: "from-rose-600/30 to-pink-900/20",
  mia: "from-fuchsia-600/30 to-fuchsia-900/20",
  frankie: "from-emerald-600/30 to-emerald-900/20",
};

function MemberDetail({ member, activities }: { member: TeamMember; activities: Activity[] }) {
  const recent = activities.filter(a => a.agent === member.id).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Description */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">About</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{member.description}</p>
      </div>

      {/* Recurring Tasks */}
      {member.recurringTasks && member.recurringTasks.length > 0 && (
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Recurring Tasks</p>
          <div className="space-y-1">
            {member.recurringTasks.map(task => (
              <div key={task} className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-zinc-600">⏰</span>
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
  const teamMembers = useTeam();
  const [mcActivities, setMcActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [agentStatusTs, setAgentStatusTs] = useState<Record<string, number>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch agentStatus fallback timestamps + activities from mc-data
  useEffect(() => {
    fetch("/api/mc-data")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        if (d.agentStatus) {
          const ts: Record<string, number> = {};
          for (const [key, val] of Object.entries(d.agentStatus as Record<string, { lastActive?: string }>)) {
            if (val.lastActive) ts[key] = new Date(val.lastActive).getTime();
          }
          setAgentStatusTs(ts);
        }
        if (Array.isArray(d.activities)) {
          const mapped: Activity[] = (d.activities as Array<{
            id: string; agent: string; title: string; date?: string;
            type?: string; description?: string; status?: string; product?: string;
          }>).map(a => ({
            _id: a.id,
            agent: a.agent,
            type: (a.type as Activity["type"]) || "task",
            title: a.title,
            description: a.description,
            product: a.product as Activity["product"] | undefined,
            status: (a.status as Activity["status"]) || "success",
            createdAt: a.date ? new Date(a.date).getTime() : Date.now(),
          }));
          setMcActivities(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Build a map of agentId → latest activity timestamp
  const latestActivityTs: Record<string, number> = {};
  for (const a of mcActivities) {
    if (!latestActivityTs[a.agent] || a.createdAt > latestActivityTs[a.agent]) {
      latestActivityTs[a.agent] = a.createdAt;
    }
  }

  // Resolve final lastActive for an agent: activities first, agentStatus fallback
  function getLastActive(id: string): number | null {
    const fromActivities = latestActivityTs[id] ?? 0;
    const fromStatus = agentStatusTs[id] ?? 0;
    const best = Math.max(fromActivities, fromStatus);
    return best > 0 ? best : null;
  }

  const selectedMember = selectedId ? teamMembers.find(m => m.id === selectedId) : null;

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">The Team</h1>
          <p className="text-sm text-zinc-500">Meet the crew behind the operation</p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
          {agentOrder.map(id => {
            const member = teamMembers.find(m => m.id === id)!;
            const color = agentColors[id] || "#3b82f6";
            const lastActive = getLastActive(id);
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
                  {member.avatar ? (
                    <Image src={member.avatar} alt={member.name} width={150} height={150} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[50px] sm:text-[80px] leading-none select-none">{member.emoji}</span>
                  )}
                </div>
                {/* Name */}
                <span className="text-[14px] sm:text-[16px] font-semibold text-white leading-tight mt-1">{member.name}</span>
                {/* Role */}
                <span className="text-[11px] sm:text-[13px] font-medium leading-tight text-center" style={{ color }}>{member.role}</span>
                {/* Last active */}
                <span className="text-[11px] text-zinc-600 text-center leading-tight">
                  {lastActiveLabel(lastActive)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop: Side Panel */}
        {!isMobile && selectedMember && (
          <AgentSidePanel
            member={selectedMember}
            activities={mcActivities}
            isOpen={true}
            onClose={() => setSelectedId(null)}
          />
        )}

        {/* Mobile: Bottom Sheet */}
        {isMobile && selectedMember && (
          <AgentDrawer
            member={selectedMember}
            activities={mcActivities}
            isOpen={true}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </Shell>
  );
}
// 2026-02-19T12:04Z
