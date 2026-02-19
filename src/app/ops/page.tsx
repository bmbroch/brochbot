"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Shell from "@/components/Shell";
import { useTeam, agentColors } from "@/lib/data-provider";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = "Working" | "Idle" | "Never been used";

interface LiveAgent {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: AgentStatus;
  lastActivity: string;
  lastActive: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(lastActive: number | null): AgentStatus {
  if (lastActive === null) return "Never been used";
  const diffMs = Date.now() - lastActive;
  if (diffMs < 2 * 60 * 60 * 1000) return "Working";
  if (diffMs < 24 * 60 * 60 * 1000) return "Idle";
  return "Idle";
}

function formatCAT(ts: number | null): string {
  if (ts === null) return "—";
  const diffMs = Date.now() - ts;
  if (diffMs < 60_000) return "just now";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  const days = Math.floor(diffMs / 86_400_000);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

// ─── Static sections (historical) ────────────────────────────────────────────

interface TaskRow {
  time: string;
  task: string;
  assignedTo: string;
  status: string;
  violation?: boolean;
}

const TASKS: TaskRow[] = [
  { time: "00:00", task: "Nightly MC Sync", assignedTo: "Sam", status: "✅" },
  { time: "00:00", task: "Team page accordion fix + mobile responsiveness", assignedTo: "Sam ⚠️", status: "✅", violation: true },
  { time: "06:00", task: "Morning Analytics Report", assignedTo: "Dana", status: "✅" },
  { time: "06:20", task: "Enable GSC API check", assignedTo: "Miles", status: "✅" },
  { time: "06:25", task: "ISK keyword snapshot", assignedTo: "Miles", status: "✅" },
  { time: "06:30", task: "ISK keyword trends (6-month)", assignedTo: "Miles", status: "✅" },
  { time: "06:35", task: "ISK month-over-month comparison", assignedTo: "Miles", status: "✅" },
  { time: "06:45", task: "ISK weekly report (new format)", assignedTo: "Miles", status: "✅" },
  { time: "07:00", task: "Create agent knowledge briefs", assignedTo: "Sam", status: "✅" },
  { time: "07:30", task: "Create Dev agent", assignedTo: "Sam", status: "✅" },
  { time: "07:45", task: "Set up delegation audit cron", assignedTo: "Sam", status: "✅" },
  { time: "07:50", task: "Team page avatars (Personas style)", assignedTo: "Devin", status: "✅" },
  { time: "07:50", task: "Fix PostCSS breakage", assignedTo: "Sam", status: "✅", violation: true },
  { time: "07:55", task: "Office page v1", assignedTo: "Devin", status: "✅" },
  { time: "07:58", task: "Fix office meeting table overlap", assignedTo: "Sam → Dev", status: "✅" },
  { time: "08:00", task: "Build ops infrastructure", assignedTo: "Sam", status: "✅" },
  { time: "08:05", task: "Add Devin agent to team + office", assignedTo: "Devin", status: "✅" },
  { time: "08:08", task: "Ops infrastructure overhaul", assignedTo: "Penny", status: "✅" },
  { time: "08:15", task: "Office mobile responsive fix", assignedTo: "Devin", status: "✅" },
];

interface CronJob {
  name: string;
  schedule: string;
  owner: string;
  status: "healthy" | "pending";
  lastRun: string;
  nextRun: string;
}

const CRON_JOBS: CronJob[] = [
  { name: "Morning Analytics Report", schedule: "8 AM CAT daily", owner: "Dana", status: "healthy", lastRun: "Today 06:00 UTC", nextRun: "Tomorrow 06:00 UTC" },
  { name: "Nightly MC Sync", schedule: "2 AM CAT daily", owner: "Sam", status: "healthy", lastRun: "Today 00:00 UTC", nextRun: "Tomorrow 00:00 UTC" },
  { name: "Weekly GSC Report", schedule: "Mon 8 AM CAT", owner: "Miles", status: "pending", lastRun: "Mon Feb 16", nextRun: "Mon Feb 23" },
  { name: "Delegation Audit", schedule: "6 PM CAT daily", owner: "System", status: "pending", lastRun: "Yesterday 16:00 UTC", nextRun: "Today 16:00 UTC" },
  { name: "Penny Daily Check", schedule: "4 PM CAT daily", owner: "Penny", status: "pending", lastRun: "—", nextRun: "Today 14:00 UTC" },
  { name: "Penny Weekly Audit", schedule: "Fri 9 AM CAT", owner: "Penny", status: "pending", lastRun: "—", nextRun: "Fri Feb 20" },
];

interface Decision {
  date: string;
  title: string;
  description: string;
  madeBy: string;
}

const DECISIONS: Decision[] = [
  { date: "Feb 19", title: "Agent Knowledge Briefs", description: "Persistent briefs in /agents/ so sub-agents load context from files", madeBy: "Ben + Sam" },
  { date: "Feb 19", title: "Dev Agent Created", description: "Web Developer agent to own MC codebase — Sam was writing code directly", madeBy: "Ben + Sam" },
  { date: "Feb 19", title: "Weekly GSC Report Format", description: "Date ranges as column headers, not ambiguous labels", madeBy: "Ben" },
  { date: "Feb 19", title: "Delegation Audit", description: "Daily cron at 6 PM CAT to review Sam's compliance", madeBy: "Ben" },
  { date: "Feb 19", title: "ISK Keyword Focus", description: "Track 'during interview' keywords, not prep keywords", madeBy: "Ben" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: AgentStatus }) {
  const color =
    status === "Working"
      ? "bg-green-400 animate-pulse"
      : status === "Idle"
      ? "bg-yellow-400"
      : "bg-zinc-600";
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function CronDot({ status }: { status: CronJob["status"] }) {
  const color = status === "healthy" ? "bg-green-400" : "bg-zinc-500";
  return <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />;
}

const agentOrder = ["ben", "sam", "devin", "cara", "dana", "miles", "penny", "mia", "frankie"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OpsPage() {
  const teamMembers = useTeam();
  const [liveAgents, setLiveAgents] = useState<LiveAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mc-data")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const agentStatus: Record<string, { lastActive?: string | null; statusText?: string }> =
          data?.agentStatus ?? {};

        // Sort by agentOrder, with any extras at the end
        const ordered = [...agentOrder, ...teamMembers.filter(m => !agentOrder.includes(m.id)).map(m => m.id)];

        const agents: LiveAgent[] = ordered
          .map(id => teamMembers.find(m => m.id === id))
          .filter((m): m is NonNullable<typeof m> => m !== undefined)
          .map(member => {
            const entry = agentStatus[member.id];
            const rawTs = entry?.lastActive ? new Date(entry.lastActive).getTime() : null;
            const lastActive = rawTs && !isNaN(rawTs) ? rawTs : null;
            const statusText = entry?.statusText?.trim() || "";
            return {
              id: member.id,
              name: member.name,
              avatar: member.avatar,
              role: member.role,
              status: deriveStatus(lastActive),
              lastActivity: statusText || (lastActive ? "Last seen recently" : "No activity recorded"),
              lastActive,
            };
          });

        setLiveAgents(agents);
      })
      .catch(() => {
        // Fallback: build from teamMembers with no status data
        const agents: LiveAgent[] = agentOrder
          .map(id => teamMembers.find(m => m.id === id))
          .filter((m): m is NonNullable<typeof m> => m !== undefined)
          .map(member => ({
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            role: member.role,
            status: "Never been used" as AgentStatus,
            lastActivity: "Status unavailable",
            lastActive: null,
          }));
        setLiveAgents(agents);
      })
      .finally(() => setLoading(false));
  }, [teamMembers]);

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🕵️ Surveillance</h1>
          <p className="text-zinc-500 text-sm mt-1">We see everything. Even the one-line fixes.</p>
        </div>

        {/* Agent Status Board */}
        <section>
          <h2 className="text-lg font-semibold mb-4">👁️ Agent Status Board</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {agentOrder.map(id => (
                <div key={id} className="rounded-xl border border-[#222] bg-[#111] p-4 animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {liveAgents.map(a => {
                const color = agentColors[a.id] || "#6b7280";
                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-[#222] bg-[#111] p-4 hover:border-[#333] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {a.avatar ? (
                        <Image
                          src={a.avatar}
                          alt={a.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {a.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-[11px] text-zinc-500">{a.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusDot status={a.status} />
                      <span
                        className={`text-xs ${
                          a.status === "Working"
                            ? "text-green-400"
                            : a.status === "Idle"
                            ? "text-yellow-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {a.status}
                      </span>
                      <span className="text-[10px] text-zinc-600 ml-auto">
                        {formatCAT(a.lastActive)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{a.lastActivity}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Task Log (Feb 19 — historical) */}
        <section>
          <h2 className="text-lg font-semibold mb-1">📋 Feb 19 Task Log</h2>
          <p className="text-[11px] text-zinc-600 mb-4">Historical — from first full operational day</p>
          <div className="rounded-xl border border-[#222] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222] bg-[#111]">
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Time</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Task</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Assigned To</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {TASKS.map((t, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[#1a1a1a] ${t.violation ? "bg-red-500/[0.04]" : "hover:bg-white/[0.02]"}`}
                    >
                      <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{t.time}</td>
                      <td className={`px-4 py-2 ${t.violation ? "text-red-400" : ""}`}>{t.task}</td>
                      <td className={`px-4 py-2 ${t.violation ? "text-red-400 font-medium" : "text-zinc-400"}`}>{t.assignedTo}</td>
                      <td className="px-4 py-2">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cron Job Monitor */}
        <section>
          <h2 className="text-lg font-semibold mb-4">⏰ Cron Job Monitor</h2>
          <div className="grid gap-2">
            {CRON_JOBS.map(j => (
              <div key={j.name} className="rounded-xl border border-[#222] bg-[#111] px-4 py-3 flex items-center gap-4">
                <CronDot status={j.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{j.name}</p>
                  <p className="text-[11px] text-zinc-500">{j.schedule} · {j.owner}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-400">{j.lastRun}</p>
                  <p className="text-[10px] text-zinc-600">Next: {j.nextRun}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Decision Log */}
        <section>
          <h2 className="text-lg font-semibold mb-4">📜 Decision Log</h2>
          <div className="space-y-0 border-l-2 border-[#222] ml-3">
            {DECISIONS.map((d, i) => (
              <div key={i} className="pl-6 pb-6 relative">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-400" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{d.date} · {d.madeBy}</p>
                <p className="text-sm font-semibold">{d.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{d.description}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-zinc-700 text-xs pb-8">🕵️ This page is always watching. Behave accordingly.</p>
      </div>
    </Shell>
  );
}
