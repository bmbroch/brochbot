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

// Light-friendly gradient map — subtle colored tints
const gradientMapDark: Record<string, string> = {
  ben: "from-zinc-700/30 to-slate-800/20",
  sam: "from-blue-700/30 to-blue-900/20",
  cara: "from-purple-700/30 to-purple-900/20",
  dana: "from-green-700/30 to-green-900/20",
  miles: "from-orange-600/30 to-orange-900/20",
  penny: "from-rose-600/30 to-pink-900/20",
  mia: "from-fuchsia-600/30 to-fuchsia-900/20",
  frankie: "from-emerald-600/30 to-emerald-900/20",
};

const gradientMapLight: Record<string, string> = {
  ben: "from-zinc-100 to-zinc-50",
  sam: "from-blue-50 to-sky-100",
  cara: "from-purple-50 to-violet-100",
  dana: "from-green-50 to-emerald-100",
  miles: "from-orange-50 to-amber-100",
  penny: "from-rose-50 to-pink-100",
  mia: "from-fuchsia-50 to-pink-100",
  frankie: "from-emerald-50 to-teal-100",
};

export default function TeamPage() {
  const teamMembers = useTeam();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [agentStatusTs, setAgentStatusTs] = useState<Record<string, number>>({});
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Detect current theme
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Fetch mc-data for agentStatus fallback timestamps + history for activity feed
  useEffect(() => {
    Promise.all([
      fetch("/api/mc-data").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/agent-runs-history.json").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([mcData, historyData]) => {
      if (mcData?.agentStatus) {
        const ts: Record<string, number> = {};
        for (const [key, val] of Object.entries(mcData.agentStatus as Record<string, { lastActive?: string }>)) {
          if (val.lastActive) ts[key] = new Date(val.lastActive).getTime();
        }
        setAgentStatusTs(ts);
      }

      const historyArr: Array<{
        id: string; agent: string; label?: string; task: string;
        status: string; timestamp: string;
      }> = Array.isArray(historyData) ? historyData : [];

      const historyActivities: Activity[] = historyArr.map(h => ({
        _id: h.id,
        agent: h.agent,
        type: "task" as Activity["type"],
        title: h.label || h.task.slice(0, 80),
        description: h.task,
        status: (h.status as Activity["status"]) || "success",
        createdAt: new Date(h.timestamp).getTime(),
      }));

      historyActivities.sort((a, b) => b.createdAt - a.createdAt);
      setActivities(historyActivities);
    });
  }, []);

  // Build a map of agentId → latest activity timestamp
  const latestActivityTs: Record<string, number> = {};
  for (const a of activities) {
    if (!latestActivityTs[a.agent] || a.createdAt > latestActivityTs[a.agent]) {
      latestActivityTs[a.agent] = a.createdAt;
    }
  }

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

  const gradientMap = isDark ? gradientMapDark : gradientMapLight;

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">The Team</h1>
          <p className="text-sm text-[var(--text-muted)]">Meet the crew behind the operation</p>
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
                  className={`w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] rounded-full flex items-center justify-center bg-gradient-to-br ${gradientMap[id] || (isDark ? "from-zinc-700/30 to-zinc-900/20" : "from-zinc-100 to-zinc-50")} transition-all duration-200 group-hover:scale-105`}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 30px ${color}30, 0 4px 20px rgba(0,0,0,0.2)`
                      : "0 4px 20px rgba(0,0,0,0.1)",
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
                <span className="text-[14px] sm:text-[16px] font-semibold text-[var(--text-primary)] leading-tight mt-1">{member.name}</span>
                {/* Role */}
                <span className="text-[11px] sm:text-[13px] font-medium leading-tight text-center" style={{ color }}>{member.role}</span>
                {/* Last active */}
                <span className="text-[11px] text-[var(--text-faint)] text-center leading-tight">
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
            activities={activities}
            isOpen={true}
            onClose={() => setSelectedId(null)}
            lastActiveTs={getLastActive(selectedMember.id) ?? undefined}
          />
        )}

        {/* Mobile: Bottom Sheet */}
        {isMobile && selectedMember && (
          <AgentDrawer
            member={selectedMember}
            activities={activities}
            isOpen={true}
            onClose={() => setSelectedId(null)}
            lastActiveTs={getLastActive(selectedMember.id) ?? undefined}
          />
        )}
      </div>
    </Shell>
  );
}
// 2026-02-19T15:05Z
