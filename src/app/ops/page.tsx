"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Shell from "@/components/Shell";
import { useAgentMap } from "@/lib/data-provider";
import { TZ as CAT_TZ } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubAgentRun {
  id: string;
  label?: string;
  agent: string;
  task: string;
  model?: string;
  tokens?: number;
  cost?: number;
  durationSec?: number;
  status: string;
  timestamp: string;
}

interface McActivity {
  id: string;
  agent: string;
  title: string;
  description?: string;
  status: string;
  date: string;
  tokens?: number;
  cost?: number;
  model?: string;
  durationSec?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// CAT_TZ imported from @/lib/utils as TZ

function formatCAT(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60_000) return "just now";
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
    const days = Math.floor(diffMs / 86_400_000);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-ZA", { timeZone: CAT_TZ, month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return { start: monday, end: sunday };
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const { start, end } = getWeekBounds();
  return d >= start && d < end;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type AgentMap = Record<string, { name: string; color: string; emoji: string; avatar?: string; role: string }>;

function AgentAvatar({ agentId, size = 32, agentMap }: { agentId: string; size?: number; agentMap: AgentMap }) {
  const info = agentMap[agentId];
  const avatar = info?.avatar;
  const color = info?.color || "#6b7280";
  const name = info?.name || agentId.charAt(0).toUpperCase() + agentId.slice(1);

  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: `${color}20`, color }}
    >
      {name[0]}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const styles =
    s === "success"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : s === "error" || s === "failed"
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : s === "running" || s === "in-progress" || s === "in_progress"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const label =
    s === "success" ? "done" : s === "running" || s === "in-progress" || s === "in_progress" ? "running" : s;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${styles} uppercase tracking-wide`}>
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SurveillancePage() {
  const agentMap = useAgentMap();
  const [runs, setRuns] = useState<SubAgentRun[]>([]);
  const [samActivities, setSamActivities] = useState<McActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/sub-agent-runs").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/mc-data").then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([runsData, mcData]) => {
      const runsArr: SubAgentRun[] = Array.isArray(runsData) ? runsData : [];
      const mcDataObj = mcData as { activities?: McActivity[] } | null;
      const activitiesArr: McActivity[] = Array.isArray(mcDataObj?.activities) ? (mcDataObj?.activities ?? []) : [];
      const samActs = activitiesArr.filter(a => a.agent === "sam");
      setRuns(runsArr.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setSamActivities(samActs);
    }).finally(() => setLoading(false));
  }, []);

  // ── Delegation Ratio ──────────────────────────────────────────────────────
  const weekRuns = runs.filter(r => isThisWeek(r.timestamp));
  const weekSamActs = samActivities.filter(a => isThisWeek(a.date));
  const delegated = weekRuns.length;
  const samDirect = weekSamActs.length;
  const total = delegated + samDirect;
  const ratio = total > 0 ? delegated / total : 0;
  const ratioColor =
    ratio > 0.8 ? "text-green-400" : ratio >= 0.5 ? "text-yellow-400" : "text-red-400";
  const barColor =
    ratio > 0.8 ? "bg-green-500" : ratio >= 0.5 ? "bg-yellow-500" : "bg-red-500";

  // ── All-time fallback for feed ────────────────────────────────────────────
  const feedRuns = runs;

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🕵️ Surveillance</h1>
          <p className="text-zinc-500 text-sm mt-1">Did Sam do work she should have delegated?</p>
        </div>

        {/* Delegation Ratio Card */}
        <section>
          <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-1">
                  Delegation Ratio — This Week
                </p>
                {loading ? (
                  <div className="h-9 w-48 bg-[#222] rounded animate-pulse" />
                ) : (
                  <p className={`text-3xl font-bold ${ratioColor}`}>
                    {delegated}{" "}
                    <span className="text-zinc-600 font-normal text-xl">/ {total} tasks</span>
                  </p>
                )}
              </div>
              {!loading && (
                <div className="text-right">
                  <p className={`text-2xl font-bold ${ratioColor}`}>
                    {total > 0 ? Math.round(ratio * 100) : "—"}
                    {total > 0 && <span className="text-lg">%</span>}
                  </p>
                  <p className="text-[11px] text-zinc-600">delegated</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {!loading && total > 0 && (
              <div className="w-full h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            )}

            {!loading && (
              <div className="flex gap-6 mt-4 text-[12px] text-zinc-500">
                <span>
                  <span className="text-white font-medium">{delegated}</span> delegated to agents
                </span>
                <span>
                  <span className={samDirect > 0 ? "text-red-400 font-medium" : "text-white font-medium"}>
                    {samDirect}
                  </span>{" "}
                  Sam did herself
                </span>
                {total === 0 && (
                  <span className="text-zinc-600 italic">No tasks recorded this week yet</span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Delegation Feed */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span>🤖</span> Delegation Feed
            {!loading && (
              <span className="text-[11px] text-zinc-600 font-normal ml-1">
                {feedRuns.length} total
              </span>
            )}
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-[#111] border border-[#222] animate-pulse" />
              ))}
            </div>
          ) : feedRuns.length === 0 ? (
            <div className="rounded-xl border border-[#222] bg-[#111] px-5 py-8 text-center">
              <p className="text-zinc-600 text-sm">No sub-agent runs found.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#222] overflow-hidden">
              <div className="max-h-[480px] overflow-y-auto">
                {feedRuns.map((run, i) => {
                  const info = agentMap[run.agent];
                  const color = info?.color || "#6b7280";
                  const agentName = info?.name || run.agent.charAt(0).toUpperCase() + run.agent.slice(1);
                  return (
                    <div
                      key={run.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors ${
                        i < feedRuns.length - 1 ? "border-b border-[#1a1a1a]" : ""
                      }`}
                    >
                      <AgentAvatar agentId={run.agent} size={32} agentMap={agentMap} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color }}>
                          {agentName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{run.task}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={run.status} />
                        {run.cost != null && (
                          <span className="text-[11px] text-zinc-500">${run.cost.toFixed(2)}</span>
                        )}
                        <span className="text-[11px] text-zinc-600 w-16 text-right">
                          {formatCAT(run.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Violations Log */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span>🚨</span> Violations Log
          </h2>
          <div className="rounded-xl border border-[#222] bg-[#111] px-5 py-5">
            <p className="text-zinc-600 text-sm text-center">
              No violations logged.{" "}
              <span className="text-zinc-700">Add entries to ops/violations.md</span>
            </p>
          </div>
        </section>

        <p className="text-center text-zinc-700 text-xs pb-8">
          🕵️ This page is always watching. Behave accordingly.
        </p>
      </div>
    </Shell>
  );
}
