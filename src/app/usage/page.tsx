"use client";

import React, { useState, useMemo, useEffect } from "react";
import Shell from "@/components/Shell";
import { TZ } from "@/lib/utils";

// ─── String Constants ──────────────────────────────────────────────────────────
const SAM_SYNC_PREFIX = "sam-sync-";
const SAM_DAILY_PREFIX = "sam-daily-";

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
    timeZone: TZ,
    hour12: false,
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: TZ,
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
  Devin:   { bg: "bg-purple-500/15", text: "text-purple-500 dark:text-purple-300",  border: "border-purple-500/20",  bar: "bg-purple-500"  },
  Frankie: { bg: "bg-pink-500/15",   text: "text-pink-500 dark:text-pink-300",    border: "border-pink-500/20",    bar: "bg-pink-500"    },
  Sam:     { bg: "bg-cyan-500/15",   text: "text-cyan-600 dark:text-cyan-300",    border: "border-cyan-500/20",    bar: "bg-cyan-400"    },
  Miles:   { bg: "bg-blue-500/15",   text: "text-blue-600 dark:text-blue-300",    border: "border-blue-500/20",    bar: "bg-blue-500"    },
  Dana:    { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-300",  border: "border-orange-500/20",  bar: "bg-orange-500"  },
  Penny:   { bg: "bg-rose-500/15",   text: "text-rose-600 dark:text-rose-300",    border: "border-rose-500/20",    bar: "bg-rose-500"    },
  System:  { bg: "bg-zinc-500/15",   text: "text-zinc-600 dark:text-zinc-300",    border: "border-zinc-500/20",    bar: "bg-zinc-500"    },
};

const DEFAULT_STYLE: AgentStyle = {
  bg: "bg-zinc-500/15",
  text: "text-zinc-600 dark:text-zinc-300",
  border: "border-zinc-500/20",
  bar: "bg-zinc-500",
};

function agentStyle(agent: string): AgentStyle {
  return AGENT_COLORS[agent] ?? DEFAULT_STYLE;
}

function modelBadgeClass(model: Model): string {
  if (model === "Opus")   return "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/20";
  if (model === "Sonnet") return "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/20";
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
    <div
      className="rounded-2xl border p-5 hover:border-[var(--border-strong)] transition-colors"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
    >
      <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-3xl font-black tabular-nums tracking-tight ${accent ?? "text-[var(--text-primary)]"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
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
  if (!active) return <span className="text-[var(--text-faint)] ml-1">↕</span>;
  return <span className="text-blue-500 ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
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
      <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">💸 Agent Cost Breakdown</h2>
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
      >
        {byAgent.map(({ agent, tokens, cost, runCount }) => {
          const s = agentStyle(agent);
          const pct = (cost / maxCost) * 100;
          const rankLabel = cost === maxCost ? " 🔥 top spender" : "";
          return (
            <div key={agent} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={`${s.bg} ${s.text} ${s.border}`}>{agent}</Badge>
                  <span className="text-[var(--text-muted)] text-xs">
                    {runCount} run{runCount !== 1 ? "s" : ""} · {fmtTokens(tokens)} tokens
                    {rankLabel}
                  </span>
                </div>
                <span className="font-bold text-[var(--text-primary)] tabular-nums">{fmtCost(cost)}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
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
      <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">🧠 Model Usage by Agent</h2>
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
              className="rounded-xl border p-4 space-y-3"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between">
                <Badge className={`${s.bg} ${s.text} ${s.border}`}>{agent}</Badge>
                <span className="text-xs text-[var(--text-muted)]">{fmtTokens(total)}</span>
              </div>

              {/* Split bar */}
              <div className="h-3 rounded-full overflow-hidden bg-[var(--bg-elevated)] flex">
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
                      <span className="text-[var(--text-muted)]">Opus {opusPct}%</span>
                    </div>
                    <p className="text-violet-500 dark:text-violet-300 font-semibold">{fmtTokens(opusTok)}</p>
                    <p className="text-[var(--text-faint)]">{fmtCost(opusCost)}</p>
                  </div>
                )}
                {sonnetTok > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                      <span className="text-[var(--text-muted)]">Sonnet {sonnetPct}%</span>
                    </div>
                    <p className="text-sky-600 dark:text-sky-300 font-semibold">{fmtTokens(sonnetTok)}</p>
                    <p className="text-[var(--text-faint)]">{fmtCost(sonnetCost)}</p>
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
    <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-medium)]" style={{ background: "var(--bg-elevated)" }}>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium cursor-pointer hover:text-[var(--text-secondary)] select-none whitespace-nowrap ${c.align ?? "text-left"}`}
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
                    className={`border-b border-[var(--border-subtle)] cursor-pointer transition-colors ${
                      r.status === "failed"
                        ? "bg-red-500/[0.03] hover:bg-red-500/[0.06]"
                        : isExpanded
                        ? "bg-[var(--bg-hover)]"
                        : "hover:bg-[var(--bg-hover)]"
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
                        className="text-[var(--text-secondary)] text-xs font-mono truncate block"
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
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)] text-xs">
                      {r.tokens > 0 ? fmtTokens(r.tokens) : "—"}
                    </td>
                    {/* Cost */}
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                      {r.cost > 0 ? fmtCost(r.cost) : "—"}
                    </td>
                    {/* Duration */}
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-muted)] text-xs">
                      {fmtDuration(r.durationSec)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-2.5 text-center">
                      {r.status === "success" ? (
                        <span className="text-emerald-500 dark:text-emerald-400 text-xs">✓</span>
                      ) : (
                        <span className="text-red-400 text-xs">✗</span>
                      )}
                    </td>
                    {/* Timestamp */}
                    <td className="px-4 py-2.5 text-right text-xs whitespace-nowrap">
                      <span className="text-[var(--text-secondary)]">{fmtDate(r.timestamp)}</span>{" "}
                      <span className="text-[var(--text-faint)]">{fmtTime(r.timestamp)}</span>
                    </td>
                  </tr>

                  {/* Expandable task detail */}
                  {isExpanded && (
                    <tr className="border-b border-[var(--border-subtle)]" style={{ background: "var(--bg-elevated)" }}>
                      <td colSpan={8} className="px-6 py-4">
                        <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-semibold mb-2">
                          Task Prompt
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
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
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--text-muted)] text-sm">
                  No runs match the current filters.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className="border-t border-[var(--border-strong)]" style={{ background: "var(--bg-elevated)" }}>
              <td colSpan={3} className="px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
                {sorted.length} run{sorted.length !== 1 ? "s" : ""}
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-[var(--text-secondary)] tabular-nums">
                {fmtTokens(totalTokens)}
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">
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
        <h2 className="text-xl font-bold text-[var(--text-primary)]">👤 Usage by Agent</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Aggregated from agent-runs-history.json · all time</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {summaries.map(({ agent, runs, tokens, cost, topModel }) => {
          const s = agentStyle(agent);
          return (
            <div
              key={agent}
              className="rounded-2xl border p-4 hover:border-[var(--border-strong)] transition-colors space-y-3"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between">
                <Badge className={`${s.bg} ${s.text} ${s.border} capitalize`}>{agent}</Badge>
                <span className="text-[10px] text-[var(--text-faint)] font-medium uppercase tracking-wider">
                  {runs} run{runs !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[var(--text-faint)] uppercase tracking-wider text-[10px] font-medium mb-0.5">Cost</p>
                  <p className="text-emerald-500 dark:text-emerald-400 font-bold tabular-nums">{fmtCost(cost)}</p>
                </div>
                <div>
                  <p className="text-[var(--text-faint)] uppercase tracking-wider text-[10px] font-medium mb-0.5">Tokens</p>
                  <p className="text-[var(--text-primary)] font-semibold tabular-nums">{fmtTokens(tokens)}</p>
                </div>
              </div>
              <div className="pt-1 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-faint)]">Top model</span>
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
          // Filter out sam-sync-* delta entries — they overlap with sam-daily-* totals
          const cleaned = Array.isArray(hist)
            ? hist.filter((e: AgentRunEntry) => !e.id.startsWith(SAM_SYNC_PREFIX))
            : [];
          setHistoryEntries(cleaned);
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
  // Today in CAT timezone, format YYYY-MM-DD
  const todayCat = useMemo(
    () => new Date().toLocaleDateString("en-CA", { timeZone: TZ }),
    []
  );

  // Stat card memos use historyEntries (full filtered log) — more complete than allRuns
  const histTodayEntries = useMemo(
    () => historyEntries.filter((e) =>
      new Date(e.timestamp).toLocaleDateString("en-CA", { timeZone: TZ }) === todayCat
    ),
    [historyEntries, todayCat]
  );
  const histWeekEntries = useMemo(
    () => historyEntries.filter((e) => new Date(e.timestamp) >= weekStart),
    [historyEntries, weekStart]
  );

  const totalCostToday   = useMemo(() => histTodayEntries.reduce((s, r) => s + (r.cost ?? 0),   0), [histTodayEntries]);
  const totalCostWeek    = useMemo(() => histWeekEntries.reduce((s, r) => s + (r.cost ?? 0),    0), [histWeekEntries]);
  const totalTokensToday = useMemo(() => histTodayEntries.reduce((s, r) => s + (r.tokens ?? 0), 0), [histTodayEntries]);
  const totalTokensWeek  = useMemo(() => histWeekEntries.reduce((s, r) => s + (r.tokens ?? 0),  0), [histWeekEntries]);

  // Sam Today: find the sam-daily-YYYY-MM-DD entry for today (CAT)
  const samTodayCost = useMemo(() => {
    const entry = historyEntries.find(
      (e) =>
        e.agent === "sam" &&
        e.id.startsWith(SAM_DAILY_PREFIX) &&
        e.id === `${SAM_DAILY_PREFIX}${todayCat}`
    );
    return entry?.cost ?? 0;
  }, [historyEntries, todayCat]);

  const topSpender = useMemo((): [string, number] | null => {
    const byCost: Record<string, number> = {};
    for (const r of histWeekEntries) {
      byCost[r.agent] = (byCost[r.agent] ?? 0) + (r.cost ?? 0);
    }
    const entries = Object.entries(byCost).sort((a, b) => b[1] - a[1]);
    return entries[0] ?? null;
  }, [histWeekEntries]);

  const agentOptions = useMemo(() => {
    const agents = new Set(allRuns.map((r) => r.agent));
    return ["All", ...Array.from(agents).sort()];
  }, [allRuns]);

  if (loading) {
    return (
      <Shell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-64">
          <p className="text-[var(--text-muted)] text-sm animate-pulse">Loading cost data…</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">💰 Cost Dashboard</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Real spend across all agents · week resets Thu noon CAT
          </p>
        </div>

        {/* ── Sam Today Card ── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <StatCard
              label="Sam Today"
              value={`$${samTodayCost.toFixed(2)}`}
              sub={`${todayCat} · CAT`}
              accent="text-blue-500 dark:text-blue-400"
            />
          </div>
        </section>

        {/* ── Summary Cards ── */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Cost today"
              value={fmtCost(totalCostToday)}
              sub={`${fmtTokens(totalTokensToday)} tokens · all agents · from run history`}
              accent="text-emerald-500 dark:text-emerald-400"
            />
            <StatCard
              label="Cost this week"
              value={fmtCost(totalCostWeek)}
              sub={`since ${weekStart.toISOString().slice(0, 10)} Thu noon · all agents · from run history`}
              accent="text-yellow-600 dark:text-yellow-400"
            />
            <StatCard
              label="Tokens this week"
              value={fmtTokens(totalTokensWeek)}
              sub={`${fmtTokens(totalTokensToday)} today · all agents · from run history`}
            />
            <StatCard
              label="Top spender"
              value={topSpender ? topSpender[0] : "—"}
              sub={topSpender ? `${fmtCost(topSpender[1])} this week` : "No data yet"}
              accent={topSpender ? agentStyle(topSpender[0]).text : "text-[var(--text-primary)]"}
            />
          </div>
        </section>

        {/* ── Usage by Agent ── */}
        <UsageByAgent entries={historyEntries} />

        {/* ── Sub-Agent Runs Table ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">🤖 Sub-Agent Runs</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Current sessions · click a row to expand task details
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Model */}
              <div
                className="flex items-center gap-1 rounded-lg p-1 border border-[var(--border-medium)]"
                style={{ background: "var(--bg-card)" }}
              >
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModelFilter(m)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      modelFilter === m
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {/* Agent */}
              <div
                className="flex items-center gap-1 rounded-lg p-1 border border-[var(--border-medium)] flex-wrap"
                style={{ background: "var(--bg-card)" }}
              >
                {agentOptions.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAgentFilter(a)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      agentFilter === a
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
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
        <p className="text-center text-[var(--text-faint)] text-xs pb-8">
          Data from{" "}
          <span className="font-mono">/api/sub-agent-runs</span> · live from Supabase
        </p>
      </div>
    </Shell>
  );
}
