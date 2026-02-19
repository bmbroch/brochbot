"use client";

import React, { useState, useMemo, useEffect } from "react";
import Shell from "@/components/Shell";

/* ─── Types ──────────────────────────────────────────────────────────── */

type Model = "Opus" | "Sonnet" | "unknown";
type RunStatus = "success" | "failed";

interface SubAgentRun {
  id: string;
  label: string;
  agent: string;
  task: string;
  model: Model;
  tokens: number;
  cost: number;
  durationSec: number;
  status: RunStatus;
  timestamp: string;
}

type SortKey =
  | "agent"
  | "label"
  | "model"
  | "tokens"
  | "cost"
  | "durationSec"
  | "status"
  | "timestamp";

/* ─── Helpers ─────────────────────────────────────────────────────────── */

/** Returns the most recent Thursday noon UTC (CAT = UTC+2, noon CAT = 10:00 UTC) */
function lastThursdayNoonUTC(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 4=Thu
  const daysBack = ((day - 4) + 7) % 7;
  const thursday = new Date(now);
  thursday.setUTCDate(now.getUTCDate() - daysBack);
  thursday.setUTCHours(10, 0, 0, 0);
  if (thursday > now) thursday.setUTCDate(thursday.getUTCDate() - 7);
  return thursday;
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function fmtCost(n: number): string {
  if (n >= 10) return `$${n.toFixed(2)}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(3)}`;
}

function fmtDuration(sec: number): string {
  if (!sec || sec === 0) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m${s}s`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/* ─── Agent colors ────────────────────────────────────────────────────── */

interface AgentStyle {
  bg: string;
  text: string;
  border: string;
  bar: string;
}

const AGENT_COLORS: Record<string, AgentStyle> = {
  Devin:   { bg: "bg-purple-500/15", text: "text-purple-300",  border: "border-purple-500/20",  bar: "bg-purple-500"  },
  Frankie: { bg: "bg-pink-500/15",   text: "text-pink-300",    border: "border-pink-500/20",    bar: "bg-pink-500"    },
  Sam:     { bg: "bg-cyan-500/15",   text: "text-cyan-300",    border: "border-cyan-500/20",    bar: "bg-cyan-400"    },
  Miles:   { bg: "bg-blue-500/15",   text: "text-blue-300",    border: "border-blue-500/20",    bar: "bg-blue-500"    },
  Dana:    { bg: "bg-orange-500/15", text: "text-orange-300",  border: "border-orange-500/20",  bar: "bg-orange-500"  },
  Penny:   { bg: "bg-rose-500/15",   text: "text-rose-300",    border: "border-rose-500/20",    bar: "bg-rose-500"    },
  System:  { bg: "bg-zinc-500/15",   text: "text-zinc-300",    border: "border-zinc-500/20",    bar: "bg-zinc-500"    },
};

const DEFAULT_STYLE: AgentStyle = {
  bg: "bg-zinc-500/15",
  text: "text-zinc-300",
  border: "border-zinc-500/20",
  bar: "bg-zinc-500",
};

function agentStyle(agent: string): AgentStyle {
  return AGENT_COLORS[agent] ?? DEFAULT_STYLE;
}

function modelBadgeClass(model: Model): string {
  if (model === "Opus")   return "bg-violet-500/15 text-violet-300 border-violet-500/20";
  if (model === "Sonnet") return "bg-sky-500/15 text-sky-300 border-sky-500/20";
  return "bg-zinc-500/15 text-zinc-500 border-zinc-500/20";
}

/* ─── Shared UI ────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#222] bg-[#111] p-5 hover:border-[#333] transition-colors">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-3xl font-black tabular-nums tracking-tight ${accent ?? "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${className}`}
    >
      {children}
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="text-zinc-700 ml-1">↕</span>;
  return <span className="text-blue-400 ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

/* ─── Agent Cost Breakdown ─────────────────────────────────────────────── */

function AgentCostBreakdown({ runs }: { runs: SubAgentRun[] }) {
  const byAgent = useMemo(() => {
    const map: Record<string, { tokens: number; cost: number; runCount: number }> = {};
    for (const r of runs) {
      if (!map[r.agent]) map[r.agent] = { tokens: 0, cost: 0, runCount: 0 };
      map[r.agent].tokens += r.tokens;
      map[r.agent].cost += r.cost;
      map[r.agent].runCount += 1;
    }
    return Object.entries(map)
      .map(([agent, data]) => ({ agent, ...data }))
      .sort((a, b) => b.cost - a.cost);
  }, [runs]);

  const maxCost = Math.max(...byAgent.map((a) => a.cost), 0.01);

  if (byAgent.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">💸 Agent Cost Breakdown</h2>
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6 space-y-5">
        {byAgent.map(({ agent, tokens, cost, runCount }) => {
          const s = agentStyle(agent);
          const pct = (cost / maxCost) * 100;
          const rankLabel = cost === maxCost ? " 🔥 top spender" : "";
          return (
            <div key={agent} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={`${s.bg} ${s.text} ${s.border}`}>{agent}</Badge>
                  <span className="text-zinc-500 text-xs">
                    {runCount} run{runCount !== 1 ? "s" : ""} · {fmtTokens(tokens)} tokens
                    {rankLabel}
                  </span>
                </div>
                <span className="font-bold text-white tabular-nums">{fmtCost(cost)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Per-Agent Model Breakdown ──────────────────────────────────────────── */

function AgentModelBreakdown({ runs }: { runs: SubAgentRun[] }) {
  const byAgent = useMemo(() => {
    const map: Record<
      string,
      { opusTok: number; sonnetTok: number; opusCost: number; sonnetCost: number }
    > = {};
    for (const r of runs) {
      if (!map[r.agent])
        map[r.agent] = { opusTok: 0, sonnetTok: 0, opusCost: 0, sonnetCost: 0 };
      if (r.model === "Opus") {
        map[r.agent].opusTok += r.tokens;
        map[r.agent].opusCost += r.cost;
      } else if (r.model === "Sonnet") {
        map[r.agent].sonnetTok += r.tokens;
        map[r.agent].sonnetCost += r.cost;
      }
    }
    return Object.entries(map)
      .map(([agent, d]) => ({ agent, ...d }))
      .sort((a, b) => b.opusTok + b.sonnetTok - (a.opusTok + a.sonnetTok));
  }, [runs]);

  if (byAgent.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">🧠 Model Usage by Agent</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {byAgent.map(({ agent, opusTok, sonnetTok, opusCost, sonnetCost }) => {
          const total = opusTok + sonnetTok;
          if (total === 0) return null;
          const opusPct = Math.round((opusTok / total) * 100);
          const sonnetPct = 100 - opusPct;
          const s = agentStyle(agent);
          return (
            <div
              key={agent}
              className="rounded-xl border border-[#222] bg-[#111] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge className={`${s.bg} ${s.text} ${s.border}`}>{agent}</Badge>
                <span className="text-xs text-zinc-500">{fmtTokens(total)}</span>
              </div>

              {/* Split bar */}
              <div className="h-3 rounded-full overflow-hidden bg-[#1a1a1a] flex">
                {opusTok > 0 && (
                  <div
                    className="h-full bg-violet-500 transition-all duration-700"
                    style={{ width: `${opusPct}%` }}
                  />
                )}
                {sonnetTok > 0 && (
                  <div
                    className="h-full bg-sky-400 transition-all duration-700"
                    style={{ width: `${sonnetPct}%` }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {opusTok > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                      <span className="text-zinc-400">Opus {opusPct}%</span>
                    </div>
                    <p className="text-violet-300 font-semibold">{fmtTokens(opusTok)}</p>
                    <p className="text-zinc-600">{fmtCost(opusCost)}</p>
                  </div>
                )}
                {sonnetTok > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                      <span className="text-zinc-400">Sonnet {sonnetPct}%</span>
                    </div>
                    <p className="text-sky-300 font-semibold">{fmtTokens(sonnetTok)}</p>
                    <p className="text-zinc-600">{fmtCost(sonnetCost)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Sub-Agent Runs Table ─────────────────────────────────────────────── */

function RunsTable({
  runs,
  modelFilter,
  agentFilter,
}: {
  runs: SubAgentRun[];
  modelFilter: string;
  agentFilter: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (modelFilter !== "All" && r.model !== modelFilter) return false;
      if (agentFilter !== "All" && r.agent !== agentFilter) return false;
      return true;
    });
  }, [runs, modelFilter, agentFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const aVal = typeof av === "string" ? av.toLowerCase() : (av as number);
      const bVal = typeof bv === "string" ? bv.toLowerCase() : (bv as number);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const totalTokens = filtered.reduce((s, r) => s + r.tokens, 0);
  const totalCost = filtered.reduce((s, r) => s + r.cost, 0);

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "agent",      label: "Agent" },
    { key: "label",      label: "Task" },
    { key: "model",      label: "Model" },
    { key: "tokens",     label: "Tokens",   align: "text-right" },
    { key: "cost",       label: "Cost",     align: "text-right" },
    { key: "durationSec",label: "Duration", align: "text-right" },
    { key: "status",     label: "Status",   align: "text-center" },
    { key: "timestamp",  label: "Time",     align: "text-right" },
  ];

  return (
    <div className="rounded-xl border border-[#222] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222] bg-[#0d0d0d]">
              {cols.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-[11px] text-zinc-500 uppercase tracking-wider font-medium cursor-pointer hover:text-zinc-300 select-none whitespace-nowrap ${c.align ?? "text-left"}`}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                  <SortIcon active={sortKey === c.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const s = agentStyle(r.agent);
              const isExpanded = expanded === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr
                    className={`border-b border-[#1a1a1a] cursor-pointer transition-colors ${
                      r.status === "failed"
                        ? "bg-red-500/[0.03] hover:bg-red-500/[0.06]"
                        : isExpanded
                        ? "bg-white/[0.03]"
                        : "hover:bg-white/[0.025]"
                    }`}
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    {/* Agent */}
                    <td className="px-4 py-2.5">
                      <Badge className={`${s.bg} ${s.text} ${s.border}`}>{r.agent}</Badge>
                    </td>
                    {/* Task label */}
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <span
                        className="text-zinc-300 text-xs font-mono truncate block"
                        title={r.label}
                      >
                        {r.label}
                      </span>
                    </td>
                    {/* Model */}
                    <td className="px-4 py-2.5">
                      <Badge className={modelBadgeClass(r.model)}>
                        {r.model === "unknown" ? "—" : r.model}
                      </Badge>
                    </td>
                    {/* Tokens */}
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300 text-xs">
                      {r.tokens > 0 ? fmtTokens(r.tokens) : "—"}
                    </td>
                    {/* Cost */}
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs font-semibold text-emerald-400">
                      {r.cost > 0 ? fmtCost(r.cost) : "—"}
                    </td>
                    {/* Duration */}
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400 text-xs">
                      {fmtDuration(r.durationSec)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-2.5 text-center">
                      {r.status === "success" ? (
                        <span className="text-emerald-400 text-xs">✓</span>
                      ) : (
                        <span className="text-red-400 text-xs">✗</span>
                      )}
                    </td>
                    {/* Timestamp */}
                    <td className="px-4 py-2.5 text-right text-xs whitespace-nowrap">
                      <span className="text-zinc-400">{fmtDate(r.timestamp)}</span>{" "}
                      <span className="text-zinc-600">{fmtTime(r.timestamp)}</span>
                    </td>
                  </tr>

                  {/* Expandable task detail */}
                  {isExpanded && (
                    <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                      <td colSpan={8} className="px-6 py-4">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">
                          Task Prompt
                        </p>
                        <p className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
                          {r.task}
                        </p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-600 text-sm">
                  No runs match the current filters.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className="border-t border-[#333] bg-[#0d0d0d]">
              <td colSpan={3} className="px-4 py-2.5 text-[11px] text-zinc-500">
                {sorted.length} run{sorted.length !== 1 ? "s" : ""}
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-zinc-300 tabular-nums">
                {fmtTokens(totalTokens)}
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-bold text-emerald-400 tabular-nums">
                {fmtCost(totalCost)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ─── Usage by Agent (from agent-runs-history.json) ──────────────────────── */

interface AgentRunEntry {
  id: string;
  label: string;
  agent: string;
  task: string;
  model: Model;
  tokens: number;
  cost: number;
  durationSec: number;
  status: RunStatus;
  timestamp: string;
}

interface AgentSummary {
  agent: string;
  runs: number;
  tokens: number;
  cost: number;
  topModel: string;
}

function UsageByAgent({ entries }: { entries: AgentRunEntry[] }) {
  const summaries = useMemo((): AgentSummary[] => {
    const map: Record<string, { runs: number; tokens: number; cost: number; models: Record<string, number> }> = {};
    for (const e of entries) {
      const key = e.agent;
      if (!map[key]) map[key] = { runs: 0, tokens: 0, cost: 0, models: {} };
      map[key].runs += 1;
      map[key].tokens += e.tokens ?? 0;
      map[key].cost += e.cost ?? 0;
      const m = e.model ?? "unknown";
      map[key].models[m] = (map[key].models[m] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([agent, d]) => ({
        agent,
        runs: d.runs,
        tokens: d.tokens,
        cost: d.cost,
        topModel: Object.entries(d.models).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [entries]);

  if (summaries.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold">👤 Usage by Agent</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Aggregated from agent-runs-history.json · all time</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {summaries.map(({ agent, runs, tokens, cost, topModel }) => {
          const s = agentStyle(agent);
          return (
            <div
              key={agent}
              className="rounded-2xl border border-[#222] bg-[#111] p-4 hover:border-[#333] transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge className={`${s.bg} ${s.text} ${s.border} capitalize`}>{agent}</Badge>
                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                  {runs} run{runs !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium mb-0.5">Cost</p>
                  <p className="text-emerald-400 font-bold tabular-nums">{fmtCost(cost)}</p>
                </div>
                <div>
                  <p className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium mb-0.5">Tokens</p>
                  <p className="text-zinc-200 font-semibold tabular-nums">{fmtTokens(tokens)}</p>
                </div>
              </div>
              <div className="pt-1 border-t border-[#1a1a1a] flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">Top model</span>
                <Badge className={modelBadgeClass(topModel as Model)}>
                  {topModel === "unknown" ? "—" : topModel}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

const MODEL_OPTIONS = ["All", "Opus", "Sonnet"];

export default function UsagePage() {
  const [allRuns, setAllRuns] = useState<SubAgentRun[]>([]);
  const [historyEntries, setHistoryEntries] = useState<AgentRunEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        const [runsRes, histRes] = await Promise.allSettled([
          fetch("/api/sub-agent-runs"),
          fetch("/agent-runs-history.json"),
        ]);
        if (runsRes.status === "fulfilled") {
          const runs: SubAgentRun[] = await runsRes.value.json();
          setAllRuns(runs);
        }
        if (histRes.status === "fulfilled") {
          const hist: AgentRunEntry[] = await histRes.value.json();
          setHistoryEntries(Array.isArray(hist) ? hist : []);
        }
      } catch (err) {
        console.error("Failed to load usage data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const weekStart = useMemo(() => lastThursdayNoonUTC(), []);
  const today = new Date().toISOString().slice(0, 10);

  const todayRuns = useMemo(
    () => allRuns.filter((r) => r.timestamp.startsWith(today)),
    [allRuns, today]
  );
  const weekRuns = useMemo(
    () => allRuns.filter((r) => new Date(r.timestamp) >= weekStart),
    [allRuns, weekStart]
  );

  const totalCostToday   = useMemo(() => todayRuns.reduce((s, r) => s + r.cost,   0), [todayRuns]);
  const totalCostWeek    = useMemo(() => weekRuns.reduce((s, r) => s + r.cost,    0), [weekRuns]);
  const totalTokensToday = useMemo(() => todayRuns.reduce((s, r) => s + r.tokens, 0), [todayRuns]);
  const totalTokensWeek  = useMemo(() => weekRuns.reduce((s, r) => s + r.tokens,  0), [weekRuns]);

  const topSpender = useMemo((): [string, number] | null => {
    const byCost: Record<string, number> = {};
    for (const r of weekRuns) {
      byCost[r.agent] = (byCost[r.agent] ?? 0) + r.cost;
    }
    const entries = Object.entries(byCost).sort((a, b) => b[1] - a[1]);
    return entries[0] ?? null;
  }, [weekRuns]);

  const agentOptions = useMemo(() => {
    const agents = new Set(allRuns.map((r) => r.agent));
    return ["All", ...Array.from(agents).sort()];
  }, [allRuns]);

  if (loading) {
    return (
      <Shell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-64">
          <p className="text-zinc-500 text-sm animate-pulse">Loading cost data…</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">💰 Cost Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real spend across all agents · week resets Thu noon CAT
          </p>
        </div>

        {/* ── Summary Cards ── */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Cost today"
              value={fmtCost(totalCostToday)}
              sub={`${fmtTokens(totalTokensToday)} tokens · ${today}`}
              accent="text-emerald-400"
            />
            <StatCard
              label="Cost this week"
              value={fmtCost(totalCostWeek)}
              sub={`since ${weekStart.toISOString().slice(0, 10)} Thu noon`}
              accent="text-yellow-400"
            />
            <StatCard
              label="Tokens this week"
              value={fmtTokens(totalTokensWeek)}
              sub={`${fmtTokens(totalTokensToday)} today`}
            />
            <StatCard
              label="Top spender"
              value={topSpender ? topSpender[0] : "—"}
              sub={topSpender ? `${fmtCost(topSpender[1])} this week` : "No data yet"}
              accent={topSpender ? agentStyle(topSpender[0]).text : "text-white"}
            />
          </div>
        </section>

        {/* ── Usage by Agent ── */}
        <UsageByAgent entries={historyEntries} />

        {/* ── Sub-Agent Runs Table — star of the show ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold">🤖 Sub-Agent Runs</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                All runs · click a row to expand task details
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Model */}
              <div className="flex items-center gap-1 bg-[#111] border border-[#222] rounded-lg p-1">
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModelFilter(m)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      modelFilter === m
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {/* Agent */}
              <div className="flex items-center gap-1 bg-[#111] border border-[#222] rounded-lg p-1 flex-wrap">
                {agentOptions.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAgentFilter(a)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      agentFilter === a
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <RunsTable
            runs={allRuns}
            modelFilter={modelFilter}
            agentFilter={agentFilter}
          />
        </section>

        {/* ── Agent Cost Breakdown ── */}
        <AgentCostBreakdown runs={allRuns} />

        {/* ── Model Usage by Agent ── */}
        <AgentModelBreakdown runs={allRuns} />

        {/* ── Footer ── */}
        <p className="text-center text-zinc-700 text-xs pb-8">
          Data from{" "}
          <span className="font-mono">/api/sub-agent-runs</span> · live from Supabase
        </p>
      </div>
    </Shell>
  );
}
