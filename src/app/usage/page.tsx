"use client";

import { useState, useMemo } from "react";
import Shell from "@/components/Shell";

/* ─── Types ──────────────────────────────────────────────────────────── */

type Model = "Opus" | "Sonnet";
type AgentName = "Miles" | "Devin" | "Penny" | "Dana" | "Sam" | "System";
type RunStatus = "success" | "failed";

interface SubAgentRun {
  id: string;
  label: string;
  agent: AgentName;
  task: string;
  model: Model;
  tokens: number;
  durationSec: number;
  status: RunStatus;
  hour: number; // 0–23 UTC
}

type SortKey = "label" | "agent" | "model" | "tokens" | "durationSec" | "status";

/* ─── Static data (Feb 19, 2026) ─────────────────────────────────────── */

const TODAY = "2026-02-19";

const SUMMARY = {
  date: TODAY,
  totalTokens: 958000,
  sessions: 33,
  mainCtxTokens: 131502,
  mainCtxPct: 66,
  opusTokens: 790000,
  sonnetTokens: 168000,
  estimatedCostUsd: 0.7,
};

// Hourly token usage approximation from session deletion timestamps
const HOURLY: { hour: number; tokens: number }[] = [
  { hour: 0, tokens: 44687 },   // 9555e6d6 (cron nightly sync)
  { hour: 1, tokens: 0 },
  { hour: 2, tokens: 0 },
  { hour: 3, tokens: 0 },
  { hour: 4, tokens: 0 },
  { hour: 5, tokens: 0 },
  { hour: 6, tokens: 113994 },  // cron morning analytics + Miles GSC runs (5be2fb2f, a31923c1)
  { hour: 7, tokens: 202866 },  // dev work heavy block (eee59244, 10cc32a7, 9517ff31, 12a92947, be6caeca, 4a636f88)
  { hour: 8, tokens: 178048 },  // penny work + more dev (c1a236b1, 3f3f3d34, 9f76dfb4, f31334ef, 6040925f)
  { hour: 9, tokens: 285308 },  // final push (7e79a7e5, e8463d39, bf1b8574 ... 8c8dbab8)
  { hour: 10, tokens: 131502 }, // main session ongoing
];

const RUNS: SubAgentRun[] = [
  // Morning cron sessions
  { id: "9555e6d6", label: "nightly-mc-sync", agent: "Sam", task: "Nightly MC Sync cron", model: "Opus", tokens: 26334, durationSec: 86, hour: 0, status: "success" },
  { id: "morning-cron", label: "morning-analytics", agent: "Dana", task: "Morning analytics cron", model: "Opus", tokens: 22664, durationSec: 95, hour: 6, status: "success" },

  // Miles GSC runs
  { id: "miles-gsc-isk", label: "miles-gsc-isk", agent: "Miles", task: "ISK keyword snapshot", model: "Opus", tokens: 5400, durationSec: 86, hour: 6, status: "success" },
  { id: "miles-gsc-trends", label: "miles-gsc-trends", agent: "Miles", task: "ISK keyword trends (6-month)", model: "Opus", tokens: 2000, durationSec: 33, hour: 6, status: "success" },
  { id: "miles-gsc-mom", label: "miles-gsc-mom", agent: "Miles", task: "ISK month-over-month comparison", model: "Opus", tokens: 3000, durationSec: 51, hour: 6, status: "success" },
  { id: "miles-gsc-weekly", label: "miles-gsc-weekly", agent: "Miles", task: "ISK weekly report (new format)", model: "Opus", tokens: 4000, durationSec: 66, hour: 6, status: "success" },
  { id: "miles-gsc-reformat", label: "miles-gsc-reformat", agent: "Miles", task: "Reformat weekly report columns", model: "Opus", tokens: 1600, durationSec: 29, hour: 6, status: "success" },
  { id: "miles-gsc-now", label: "miles-gsc-now", agent: "Miles", task: "GSC enable + verify API", model: "Opus", tokens: 3600, durationSec: 52, hour: 6, status: "success" },

  // Devin runs
  { id: "team-page-avatars", label: "team-page-avatars", agent: "Devin", task: "Team page avatars (Personas style)", model: "Opus", tokens: 4700, durationSec: 135, hour: 7, status: "success" },
  { id: "office-page", label: "office-page", agent: "Devin", task: "Office page v1", model: "Opus", tokens: 5500, durationSec: 85, hour: 7, status: "success" },
  { id: "office-v2", label: "office-v2", agent: "Devin", task: "Office page v2 meeting layout", model: "Opus", tokens: 5500, durationSec: 85, hour: 7, status: "success" },
  { id: "dev-office-mobile", label: "dev-office-mobile", agent: "Devin", task: "Office mobile responsive fix", model: "Opus", tokens: 6500, durationSec: 174, hour: 8, status: "success" },
  { id: "dev-office-drawer", label: "dev-office-drawer", agent: "Devin", task: "Office drawer component", model: "Opus", tokens: 4900, durationSec: 71, hour: 8, status: "success" },
  { id: "dev-shared-drawer", label: "dev-shared-drawer", agent: "Devin", task: "Shared drawer component", model: "Opus", tokens: 6100, durationSec: 100, hour: 8, status: "success" },
  { id: "dev-ops-page", label: "dev-ops-page", agent: "Devin", task: "Ops / Surveillance page", model: "Opus", tokens: 7400, durationSec: 155, hour: 8, status: "success" },
  { id: "devin-surveillance", label: "devin-surveillance", agent: "Devin", task: "Surveillance panel tweaks", model: "Opus", tokens: 1800, durationSec: 55, hour: 9, status: "success" },
  { id: "devin-side-panel", label: "devin-side-panel", agent: "Devin", task: "Side panel component", model: "Opus", tokens: 5200, durationSec: 97, hour: 9, status: "success" },
  { id: "rename-devin", label: "rename-devin", agent: "Devin", task: "Rename Dev → Devin across codebase", model: "Opus", tokens: 1500, durationSec: 47, hour: 9, status: "success" },
  { id: "agent-overhaul", label: "agent-overhaul", agent: "Devin", task: "Agent brief overhaul", model: "Opus", tokens: 5300, durationSec: 80, hour: 9, status: "success" },
  { id: "devin-wire-data", label: "devin-wire-data", agent: "Devin", task: "Wire real data into pages", model: "Opus", tokens: 2100, durationSec: 63, hour: 9, status: "success" },
  { id: "devin-sync", label: "devin-sync", agent: "Devin", task: "Data sync from ops", model: "Sonnet", tokens: 7200, durationSec: 168, hour: 9, status: "success" },

  // Penny runs
  { id: "ops-overhaul", label: "ops-overhaul", agent: "Penny", task: "Ops infrastructure overhaul", model: "Opus", tokens: 3800, durationSec: 60, hour: 8, status: "success" },
  { id: "penny-audit", label: "penny-audit", agent: "Penny", task: "First token usage audit", model: "Opus", tokens: 4900, durationSec: 118, hour: 9, status: "success" },
  { id: "penny-data", label: "penny-data", agent: "Penny", task: "Data pipeline setup", model: "Opus", tokens: 5900, durationSec: 77, hour: 9, status: "success" },
  { id: "penny-full-sync", label: "penny-full-sync", agent: "Penny", task: "Full data sync (sub-agents)", model: "Sonnet", tokens: 15100, durationSec: 238, hour: 9, status: "success" },
  { id: "penny-tokens", label: "penny-tokens", agent: "Penny", task: "Token usage tracker + audit", model: "Sonnet", tokens: 8500, durationSec: 151, hour: 9, status: "success" },
  { id: "penny-cleanup", label: "penny-cleanup", agent: "Penny", task: "Cleanup pass (rate limited)", model: "Sonnet", tokens: 0, durationSec: 0, hour: 10, status: "failed" },

  // System
  { id: "add-frankie", label: "add-frankie", agent: "Sam", task: "Add Frankie to team", model: "Sonnet", tokens: 6000, durationSec: 131, hour: 9, status: "success" },
];

/* ─── Plan Usage Limits (hardcoded — update as needed) ───────────────── */

const planUsage = {
  currentSession: { used: 66, total: 100, label: "132k / 200k tokens" },
  weeklyAllModels: { used: 2, resetLabel: "Resets Thu 11:59 AM CAT" },
  weeklySonnet: { used: 3, resetLabel: "Resets daily" },
  estimatedWeeklyBudget: 48_000_000,
  todayBurn: 958_000,
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function fmtDuration(sec: number): string {
  if (sec === 0) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m${s}s`;
}

function costColor(usd: number): string {
  if (usd < 0.3) return "text-green-400";
  if (usd < 0.7) return "text-yellow-400";
  return "text-red-400";
}

function agentColor(agent: AgentName): string {
  const map: Record<AgentName, string> = {
    Miles: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    Devin: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    Penny: "bg-pink-500/15 text-pink-300 border-pink-500/20",
    Dana: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    Sam: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    System: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
  };
  return map[agent] ?? map.System;
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

function PlanUsageLimits() {
  const { currentSession, weeklyAllModels, weeklySonnet, estimatedWeeklyBudget, todayBurn } = planUsage;

  const projectedWeekly = todayBurn * 7;
  const projectedPct = projectedWeekly / estimatedWeeklyBudget;
  const runwayX = Math.round(estimatedWeeklyBudget / projectedWeekly);

  const budgetColor =
    projectedPct < 0.5 ? "text-green-400" : projectedPct < 0.8 ? "text-yellow-400" : "text-red-400";

  function fmtM(n: number): string {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  function fmtK(n: number): string {
    return `${(n / 1_000).toFixed(0)}K`;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">🎯 Plan Usage Limits</h2>
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6 space-y-6">

        {/* Current Session */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-zinc-400 font-medium uppercase tracking-wider">Current Session</p>
          </div>
          <UsageBar pct={currentSession.used} label={currentSession.label} resetLabel="Resets on /new or /reset" />
        </div>

        <div className="border-t border-[#1e1e1e]" />

        {/* Weekly Limits */}
        <div className="space-y-4">
          <p className="text-[12px] text-zinc-400 font-medium uppercase tracking-wider">Weekly Limits</p>

          <div className="space-y-1">
            <p className="text-[12px] text-zinc-400 mb-2">All Models <span className="text-zinc-600">(Opus)</span></p>
            <UsageBar pct={weeklyAllModels.used} resetLabel={weeklyAllModels.resetLabel} />
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-zinc-400 mb-2">Sonnet Only</p>
            <UsageBar pct={weeklySonnet.used} resetLabel={weeklySonnet.resetLabel} />
          </div>
        </div>

        <div className="border-t border-[#1e1e1e]" />

        {/* Budget Estimate */}
        <div className="space-y-2">
          <p className="text-[12px] text-zinc-400 font-medium uppercase tracking-wider">Budget Estimate</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] px-4 py-3 space-y-0.5">
              <p className="text-[11px] text-zinc-600">Weekly budget</p>
              <p className="text-sm text-zinc-300">~{fmtM(estimatedWeeklyBudget)} tokens</p>
              <p className="text-[11px] text-zinc-600">estimated from {fmtK(todayBurn)} = {weeklyAllModels.used}%</p>
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
              <p className="text-[11px] text-zinc-600">{projectedPct < 0.5 ? "✓ well within budget" : projectedPct < 0.8 ? "⚠ approaching limit" : "✗ over budget"}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
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

/* ─── Model Breakdown Bar ─────────────────────────────────────────────── */

function ModelBreakdown() {
  const total = SUMMARY.opusTokens + SUMMARY.sonnetTokens;
  const opusPct = Math.round((SUMMARY.opusTokens / total) * 100);
  const sonnetPct = 100 - opusPct;

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
            <p className="text-2xl font-black text-violet-300">{fmtTokens(SUMMARY.opusTokens)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{opusPct}% of total · ~$0.60</p>
          </div>
          <div className="rounded-xl bg-[#0d0d0d] border border-sky-500/15 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-[12px] text-zinc-400 font-medium">Claude Sonnet 4</span>
            </div>
            <p className="text-2xl font-black text-sky-300">{fmtTokens(SUMMARY.sonnetTokens)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{sonnetPct}% of total · ~$0.10</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Timeline ────────────────────────────────────────────────────────── */

function Timeline() {
  const max = Math.max(...HOURLY.map((h) => h.tokens));

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">⏱ Token Burn Timeline</h2>
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
        <div className="flex items-end gap-1.5 h-24">
          {HOURLY.map(({ hour, tokens }) => {
            const pct = max > 0 ? (tokens / max) * 100 : 0;
            const isActive = hour <= 10;
            return (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1 group" title={`${hour}:00 — ${fmtTokens(tokens)} tokens`}>
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
        <p className="text-[11px] text-zinc-500 mt-2 text-center">Hour (UTC) · bars show approximate token usage</p>
      </div>
    </section>
  );
}

/* ─── Sub-agent Table ─────────────────────────────────────────────────── */

function RunsTable({
  modelFilter,
  agentFilter,
}: {
  modelFilter: string;
  agentFilter: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("tokens");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    return RUNS.filter((r) => {
      if (modelFilter !== "All" && r.model !== modelFilter) return false;
      if (agentFilter !== "All" && r.agent !== agentFilter) return false;
      return true;
    });
  }, [modelFilter, agentFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
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
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{r.tokens > 0 ? fmtTokens(r.tokens) : "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">{fmtDuration(r.durationSec)}</td>
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
const AGENT_OPTIONS = ["All", "Miles", "Devin", "Penny", "Dana", "Sam", "System"];

export default function UsagePage() {
  const [modelFilter, setModelFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");

  const cost = SUMMARY.estimatedCostUsd;
  const costClass = cost < 0.3 ? "text-green-400" : cost < 0.7 ? "text-yellow-400" : "text-red-400";

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">📊 Token Usage</h1>
            <p className="text-zinc-500 text-sm mt-1">Daily token burn across all sessions and sub-agents</p>
          </div>
          {/* Date chip */}
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl border border-[#262626] bg-[#111] text-sm text-zinc-400 font-mono">
              {TODAY}
            </div>
          </div>
        </div>

        {/* Plan Usage Limits */}
        <PlanUsageLimits />

        {/* Summary Cards */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total tokens today"
              value={fmtTokens(SUMMARY.totalTokens)}
              sub="All sessions combined"
            />
            <StatCard
              label="Sessions today"
              value={SUMMARY.sessions.toString()}
              sub="1 main + 2 crons + sub-agents"
            />
            <StatCard
              label="Main session ctx"
              value={fmtTokens(SUMMARY.mainCtxTokens)}
              sub={`${SUMMARY.mainCtxPct}% of context window`}
              accent={SUMMARY.mainCtxPct >= 80 ? "text-red-400" : SUMMARY.mainCtxPct >= 60 ? "text-yellow-400" : "text-green-400"}
            />
            <StatCard
              label="Estimated cost"
              value={`$${cost.toFixed(2)}`}
              sub="Sub-agents · Claude API"
              accent={costClass}
            />
          </div>
        </section>

        {/* Model Breakdown */}
        <ModelBreakdown />

        {/* Timeline */}
        <Timeline />

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
                {AGENT_OPTIONS.map((a) => (
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

          <RunsTable modelFilter={modelFilter} agentFilter={agentFilter} />
        </section>

        <p className="text-center text-zinc-700 text-xs pb-8">
          Token data from Penny&apos;s audit · Feb 19, 2026 · Updates every 30 min
        </p>
      </div>
    </Shell>
  );
}
