"use client";

import { useState, useMemo, useEffect } from "react";
import Shell from "@/components/Shell";

/* ─── Types ──────────────────────────────────────────────────────────── */

type Model = "Opus" | "Sonnet";
type RunStatus = "success" | "failed";

interface SubAgentRun {
  id: string;
  label: string;
  agent: string;
  task: string;
  model: Model;
  tokens: number;
  durationSec: number;
  status: RunStatus;
  timestamp: string; // ISO 8601
}

interface TokenLogEntry {
  ts: string;
  date: string;
  sessions: number;
  mainCtx: number;
  totalCtx: number;
}

interface McData {
  lastUpdated: string;
  [key: string]: unknown;
}

type SortKey = "label" | "agent" | "model" | "tokens" | "durationSec" | "status";

/* ─── Constants ─────────────────────────────────────────────────────── */

// Math: 958K weekly tokens = 3% per Anthropic dashboard → 958K / 0.03 ≈ 32M
const WEEKLY_BUDGET = 32_000_000;
// Math: 132K session tokens = 22% per Anthropic dashboard → 132K / 0.22 ≈ 600K
const MAIN_CTX_MAX = 600_000;

/** Returns the most recent Thursday noon UTC (CAT = UTC+2, so noon CAT = 10:00 UTC) */
function lastThursdayNoonUTC(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 4=Thu
  const daysBack = ((day - 4) + 7) % 7; // days since last Thursday
  const thursday = new Date(now);
  thursday.setUTCDate(now.getUTCDate() - daysBack);
  thursday.setUTCHours(10, 0, 0, 0); // noon CAT = 10:00 UTC
  // If thursday is in the future (i.e. same day but before reset time), go back 7 days
  if (thursday > now) {
    thursday.setUTCDate(thursday.getUTCDate() - 7);
  }
  return thursday;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function fmtM(n: number): string {
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function fmtK(n: number): string {
  return `${(n / 1_000).toFixed(0)}K`;
}

function fmtDuration(sec: number): string {
  if (sec === 0) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m${s}s`;
}

function agentColor(agent: string): string {
  const map: Record<string, string> = {
    Miles: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    Devin: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    Penny: "bg-pink-500/15 text-pink-300 border-pink-500/20",
    Dana: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    Sam: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    System: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
  };
  return map[agent] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/20";
}

function modelColor(model: Model): string {
  return model === "Opus"
    ? "bg-violet-500/15 text-violet-300 border-violet-500/20"
    : "bg-sky-500/15 text-sky-300 border-sky-500/20";
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function UsageBar({
  pct,
  label,
  resetLabel,
}: {
  pct: number;
  label?: string;
  resetLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-700"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-[12px] tabular-nums text-zinc-300 w-8 text-right shrink-0">{pct}%</span>
        {label && <span className="text-[12px] text-zinc-500 shrink-0">{label}</span>}
      </div>
      <p className="text-[11px] text-zinc-600">{resetLabel}</p>
    </div>
  );
}

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
      <p className={`text-3xl font-black tabular-nums tracking-tight ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${className}`}>
      {children}
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="text-zinc-700 ml-1">↕</span>;
  return <span className="text-blue-400 ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

/* ─── Plan Usage Limits ───────────────────────────────────────────────── */

function PlanUsageLimits({
  allRuns,
  latestLog,
}: {
  allRuns: SubAgentRun[];
  latestLog: TokenLogEntry | null;
}) {
  // Weekly: tokens since last Thursday noon CAT
  const resetDate = lastThursdayNoonUTC();
  const weeklyTokens = allRuns
    .filter((r) => new Date(r.timestamp) >= resetDate)
    .reduce((s, r) => s + r.tokens, 0);
  const weeklyPct = Math.round((weeklyTokens / WEEKLY_BUDGET) * 100);

  // Session context from token log
  const sessionCtx = latestLog?.mainCtx ?? 0;
  const sessionPct = Math.round((sessionCtx / MAIN_CTX_MAX) * 100);
  const sessionLabel = latestLog ? `${fmtK(sessionCtx)} / ${fmtK(MAIN_CTX_MAX)} tokens` : "—";

  // Budget estimate based on today's burn
  const today = new Date().toISOString().slice(0, 10);
  const todayBurn = allRuns
    .filter((r) => r.timestamp.startsWith(today))
    .reduce((s, r) => s + r.tokens, 0);

  const projectedWeekly = todayBurn * 7;
  const projectedPct = projectedWeekly / WEEKLY_BUDGET;
  const budgetColor =
    projectedPct < 0.5 ? "text-green-400" : projectedPct < 0.8 ? "text-yellow-400" : "text-red-400";
  const runwayX = projectedWeekly > 0 ? Math.round(WEEKLY_BUDGET / projectedWeekly) : 0;

  // Sonnet-only tokens this week
  const weeklySonnet = allRuns
    .filter((r) => new Date(r.timestamp) >= resetDate && r.model === "Sonnet")
    .reduce((s, r) => s + r.tokens, 0);
  const weeklySonnetPct = Math.round((weeklySonnet / WEEKLY_BUDGET) * 100);

  const resetLabel = `Resets Thu noon CAT · since ${resetDate.toISOString().slice(0, 10)}`;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">🎯 Plan Usage Limits</h2>
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6 space-y-6">

        {/* Current Session */}
        <div className="space-y-2">
          <p className="text-[12px] text-zinc-400 font-medium uppercase tracking-wider">Current Session</p>
          <UsageBar pct={sessionPct} label={sessionLabel} resetLabel="Resets on /new or /reset" />
        </div>

        <div className="border-t border-[#1e1e1e]" />

        {/* Weekly Limits */}
        <div className="space-y-4">
          <p className="text-[12px] text-zinc-400 font-medium uppercase tracking-wider">Weekly Limits</p>

          <div className="space-y-1">
            <p className="text-[12px] text-zinc-400 mb-2">All Models <span className="text-zinc-600">(Opus)</span></p>
            <UsageBar pct={weeklyPct} resetLabel={resetLabel} />
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-zinc-400 mb-2">Sonnet Only</p>
            <UsageBar pct={weeklySonnetPct} resetLabel="Resets daily" />
          </div>
        </div>

        <div className="border-t border-[#1e1e1e]" />

        {/* Budget Estimate */}
        <div className="space-y-2">
          <p className="text-[12px] text-zinc-400 font-medium uppercase tracking-wider">Budget Estimate</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] px-4 py-3 space-y-0.5">
              <p className="text-[11px] text-zinc-600">Weekly budget</p>
              <p className="text-sm text-zinc-300">~{fmtM(WEEKLY_BUDGET)} tokens</p>
              <p className="text-[11px] text-zinc-600">estimated from {fmtK(todayBurn)} = {weeklyPct}%</p>
            </div>
            <div className="rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] px-4 py-3 space-y-0.5">
              <p className="text-[11px] text-zinc-600">Daily burn rate</p>
              <p className="text-sm text-zinc-300">{fmtK(todayBurn)} tokens</p>
              <p className="text-[11px] text-zinc-600">today&apos;s observed rate</p>
            </div>
            <div className="rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] px-4 py-3 space-y-0.5">
              <p className="text-[11px] text-zinc-600">Projected weekly</p>
              <p className={`text-sm font-semibold ${budgetColor}`}>~{fmtM(projectedWeekly)} tokens</p>
              <p className="text-[11px] text-zinc-600">at today&apos;s rate</p>
            </div>
            <div className="rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] px-4 py-3 space-y-0.5">
              <p className="text-[11px] text-zinc-600">Runway</p>
              <p className={`text-sm font-semibold ${budgetColor}`}>~{runwayX}x headroom</p>
              <p className="text-[11px] text-zinc-600">
                {projectedPct < 0.5 ? "✓ well within budget" : projectedPct < 0.8 ? "⚠ approaching limit" : "✗ over budget"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── Model Breakdown ─────────────────────────────────────────────────── */

function ModelBreakdown({ runs }: { runs: SubAgentRun[] }) {
  const opusTokens = runs.filter((r) => r.model === "Opus").reduce((s, r) => s + r.tokens, 0);
  const sonnetTokens = runs.filter((r) => r.model === "Sonnet").reduce((s, r) => s + r.tokens, 0);
  const total = opusTokens + sonnetTokens;
  const opusPct = total > 0 ? Math.round((opusTokens / total) * 100) : 0;
  const sonnetPct = 100 - opusPct;

  // Rough cost: Opus ~$15/Mtok in, Sonnet ~$3/Mtok in (blended estimate)
  const opusCost = (opusTokens / 1_000_000) * 15;
  const sonnetCost = (sonnetTokens / 1_000_000) * 3;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">🧠 Model Breakdown</h2>
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6 space-y-5">
        {/* Bar */}
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Opus {opusPct}%</span>
            <span>Sonnet {sonnetPct}%</span>
          </div>
          <div className="h-5 rounded-full overflow-hidden bg-[#1a1a1a] flex">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-500 transition-all duration-700"
              style={{ width: `${opusPct}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-700"
              style={{ width: `${sonnetPct}%` }}
            />
          </div>
        </div>

        {/* Legend rows */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#0d0d0d] border border-violet-500/15 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span className="text-[12px] text-zinc-400 font-medium">Claude Opus 4</span>
            </div>
            <p className="text-2xl font-black text-violet-300">{fmtTokens(opusTokens)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{opusPct}% of total · ~${opusCost.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-[#0d0d0d] border border-sky-500/15 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-[12px] text-zinc-400 font-medium">Claude Sonnet 4</span>
            </div>
            <p className="text-2xl font-black text-sky-300">{fmtTokens(sonnetTokens)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{sonnetPct}% of total · ~${sonnetCost.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Timeline ────────────────────────────────────────────────────────── */

function Timeline({ runs }: { runs: SubAgentRun[] }) {
  // Build 24-hour buckets
  const hourly = useMemo(() => {
    const buckets: { hour: number; tokens: number }[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tokens: 0,
    }));
    for (const r of runs) {
      const h = new Date(r.timestamp).getUTCHours();
      buckets[h].tokens += r.tokens;
    }
    return buckets;
  }, [runs]);

  const max = Math.max(...hourly.map((h) => h.tokens), 1);
  const nowHour = new Date().getUTCHours();

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">⏱ Token Burn Timeline</h2>
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
        <div className="flex items-end gap-1.5 h-24">
          {hourly.map(({ hour, tokens }) => {
            const pct = (tokens / max) * 100;
            const isActive = hour <= nowHour;
            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${hour}:00 UTC — ${fmtTokens(tokens)} tokens`}
              >
                <div className="w-full relative flex items-end" style={{ height: "72px" }}>
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      isActive && tokens > 0
                        ? "bg-gradient-to-t from-blue-600 to-blue-400"
                        : "bg-[#1e1e1e]"
                    }`}
                    style={{ height: `${Math.max(pct, tokens > 0 ? 5 : 0)}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-600">{hour}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2 text-center">
          Hour (UTC) · bars show approximate token usage
        </p>
      </div>
    </section>
  );
}

/* ─── Sub-agent Table ─────────────────────────────────────────────────── */

function RunsTable({
  runs,
  modelFilter,
  agentFilter,
}: {
  runs: SubAgentRun[];
  modelFilter: string;
  agentFilter: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("tokens");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
      const aStr = typeof av === "string" ? av.toLowerCase() : av;
      const bStr = typeof bv === "string" ? bv.toLowerCase() : bv;
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const totalTokens = filtered.reduce((s, r) => s + r.tokens, 0);

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "label", label: "Task ID" },
    { key: "agent", label: "Agent" },
    { key: "model", label: "Model" },
    { key: "tokens", label: "Tokens", align: "text-right" },
    { key: "durationSec", label: "Duration", align: "text-right" },
    { key: "status", label: "Status", align: "text-right" },
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
                  className={`px-4 py-3 text-[11px] text-zinc-500 uppercase tracking-wider font-medium cursor-pointer hover:text-zinc-300 select-none ${c.align ?? "text-left"}`}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                  <SortIcon active={sortKey === c.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-[#1a1a1a] transition-colors ${
                  r.status === "failed"
                    ? "bg-red-500/[0.03] hover:bg-red-500/[0.06]"
                    : "hover:bg-white/[0.025]"
                }`}
              >
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{r.label}</td>
                <td className="px-4 py-2.5">
                  <Badge className={agentColor(r.agent)}>{r.agent}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge className={modelColor(r.model)}>{r.model}</Badge>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">
                  {r.tokens > 0 ? fmtTokens(r.tokens) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                  {fmtDuration(r.durationSec)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {r.status === "success" ? (
                    <span className="text-green-400 text-xs">✓ Done</span>
                  ) : (
                    <span className="text-red-400 text-xs">✗ Failed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#222] bg-[#0d0d0d]">
              <td colSpan={3} className="px-4 py-2.5 text-[11px] text-zinc-500">
                {sorted.length} runs
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-semibold text-zinc-300 tabular-nums">
                {fmtTokens(totalTokens)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

const MODEL_OPTIONS = ["All", "Opus", "Sonnet"];

export default function UsagePage() {
  // ── Data state ────────────────────────────────────────────────────────
  const [allRuns, setAllRuns] = useState<SubAgentRun[]>([]);
  const [mcData, setMcData] = useState<McData | null>(null);
  const [latestLog, setLatestLog] = useState<TokenLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // ── UI state ──────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [modelFilter, setModelFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");

  // ── Fetch all data on mount ───────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const [runsRes, mcRes, logRes] = await Promise.all([
          fetch("/sub-agent-runs.json"),
          fetch("/mc-data.json"),
          fetch("/token-usage-log.jsonl"),
        ]);

        const runs: SubAgentRun[] = await runsRes.json();
        setAllRuns(runs);

        const mc: McData = await mcRes.json();
        setMcData(mc);

        const logText = await logRes.text();
        const entries: TokenLogEntry[] = logText
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            try { return JSON.parse(line) as TokenLogEntry; }
            catch { return null; }
          })
          .filter(Boolean) as TokenLogEntry[];
        if (entries.length > 0) {
          setLatestLog(entries[entries.length - 1]);
        }
      } catch (err) {
        console.error("Failed to load usage data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Derived: available dates from runs ────────────────────────────────
  const availableDates = useMemo(() => {
    const dates = new Set(allRuns.map((r) => r.timestamp.slice(0, 10)));
    return Array.from(dates).sort().reverse();
  }, [allRuns]);

  // ── Derived: runs for selected date ───────────────────────────────────
  const dateRuns = useMemo(
    () => allRuns.filter((r) => r.timestamp.startsWith(selectedDate)),
    [allRuns, selectedDate]
  );

  // ── Derived: unique agents for filter ─────────────────────────────────
  const agentOptions = useMemo(() => {
    const agents = new Set(dateRuns.map((r) => r.agent));
    return ["All", ...Array.from(agents).sort()];
  }, [dateRuns]);

  // ── Derived: summary stats for selected date ──────────────────────────
  const totalTokens = useMemo(() => dateRuns.reduce((s, r) => s + r.tokens, 0), [dateRuns]);
  const sessions = latestLog?.sessions ?? 0;
  const mainCtx = latestLog?.mainCtx ?? 0;
  const mainCtxPct = Math.round((mainCtx / MAIN_CTX_MAX) * 100);

  // Rough cost estimate
  const estimatedCost = useMemo(() => {
    const opus = dateRuns.filter((r) => r.model === "Opus").reduce((s, r) => s + r.tokens, 0);
    const sonnet = dateRuns.filter((r) => r.model === "Sonnet").reduce((s, r) => s + r.tokens, 0);
    return (opus / 1_000_000) * 15 + (sonnet / 1_000_000) * 3;
  }, [dateRuns]);
  const costClass =
    estimatedCost < 0.3 ? "text-green-400" : estimatedCost < 0.7 ? "text-yellow-400" : "text-red-400";

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Shell>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-64">
          <p className="text-zinc-500 text-sm animate-pulse">Loading usage data…</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">📊 Token Usage</h1>
            <p className="text-zinc-500 text-sm mt-1">Daily token burn across all sessions and sub-agents</p>
          </div>
          {/* Date selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl border text-sm font-mono transition-all ${
                  selectedDate === d
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-[#262626] bg-[#111] text-zinc-400 hover:border-[#333]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Usage Limits */}
        <PlanUsageLimits allRuns={allRuns} latestLog={latestLog} />

        {/* Summary Cards */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total tokens today"
              value={fmtTokens(totalTokens)}
              sub="Sub-agent runs combined"
            />
            <StatCard
              label="Sessions today"
              value={sessions > 0 ? sessions.toString() : "—"}
              sub="From token usage log"
            />
            <StatCard
              label="Main session ctx"
              value={mainCtx > 0 ? fmtTokens(mainCtx) : "—"}
              sub={mainCtx > 0 ? `${mainCtxPct}% of context window` : "No log data yet"}
              accent={mainCtxPct >= 80 ? "text-red-400" : mainCtxPct >= 60 ? "text-yellow-400" : "text-green-400"}
            />
            <StatCard
              label="Estimated cost"
              value={`$${estimatedCost.toFixed(2)}`}
              sub="Sub-agents · Claude API"
              accent={costClass}
            />
          </div>
        </section>

        {/* Model Breakdown */}
        <ModelBreakdown runs={dateRuns} />

        {/* Timeline */}
        <Timeline runs={dateRuns} />

        {/* Sub-agent Table */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold">🤖 Sub-Agent Runs</h2>
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Model filter */}
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
              {/* Agent filter */}
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

          <RunsTable runs={dateRuns} modelFilter={modelFilter} agentFilter={agentFilter} />
        </section>

        {/* Last synced footer */}
        <p className="text-center text-zinc-700 text-xs pb-8">
          Last synced:{" "}
          {mcData?.lastUpdated
            ? new Date(mcData.lastUpdated as string).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
                timeZoneName: "short",
              })
            : "unknown"}
          {" · "}Token data from sub-agent-runs.json + token-usage-log.jsonl
        </p>
      </div>
    </Shell>
  );
}
