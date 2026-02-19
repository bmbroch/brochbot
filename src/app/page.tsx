"use client";

import Shell from "@/components/Shell";
import { activityTypeConfig, productConfig, statusConfig, agentEmojis, agentColors, Activity, useAgentMap } from "@/lib/data-provider";
import { formatRelativeDate, getDateGroup } from "@/lib/utils";
import { useState, useEffect } from "react";

// Extended activity type with metadata fields from agent-runs-history.json
interface EnrichedActivity extends Activity {
  tokens?: number;
  cost?: number;
  model?: string;
  durationSec?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtTokensCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function fmtCostActivity(n: number): string {
  return `$${n.toFixed(2)}`;
}

// CAT = Africa/Windhoek = UTC+2
const CAT_OFFSET_MS = 2 * 60 * 60 * 1000;

function getCATDateStr(tsMs: number): string {
  const catMs = tsMs + CAT_OFFSET_MS;
  return new Date(catMs).toISOString().slice(0, 10); // YYYY-MM-DD
}

function nowCATDateStr(): string {
  return getCATDateStr(Date.now());
}

type DateTab = "today" | "week" | "all";

export default function Home() {
  const [activities, setActivities] = useState<EnrichedActivity[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [dateTab, setDateTab] = useState<DateTab>("today");

  // Fetch enriched activities from agent-runs-history.json
  useEffect(() => {
    fetch("/agent-runs-history.json")
      .then((r) => r.json())
      .then((rawList: Array<{
        id: string;
        agent: string;
        label: string;
        task?: string;
        status: string;
        tokens?: number;
        cost?: number;
        model?: string;
        durationSec?: number;
        timestamp: string;
      }>) => {
        // Filter: for sam entries, only keep sam-daily-YYYY-MM-DD (skip sam-sync-* and uuid entries)
        const filtered = rawList.filter((entry) => {
          if (entry.agent === "sam" || entry.id.startsWith("sam-")) {
            return /^sam-daily-\d{4}-\d{2}-\d{2}$/.test(entry.id);
          }
          return true;
        });

        const mapped: EnrichedActivity[] = filtered.map((a) => ({
          _id: a.id,
          agent: a.agent,
          type: "task" as Activity["type"],
          title: a.label,
          description: a.task ? a.task.slice(0, 200) : undefined,
          status: (a.status as Activity["status"]) || "success",
          createdAt: new Date(a.timestamp).getTime(),
          tokens: a.tokens,
          cost: a.cost,
          model: a.model,
          durationSec: a.durationSec,
        }));

        // Newest first
        mapped.sort((a, b) => b.createdAt - a.createdAt);

        if (mapped.length > 0) setActivities(mapped);
      })
      .catch(() => {
        setFetchError(true);
      });
  }, []);

  // Date tab filtering
  const todayCAT = nowCATDateStr();
  const weekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const dateFiltered = activities.filter((a) => {
    if (dateTab === "today") return getCATDateStr(a.createdAt) === todayCAT;
    if (dateTab === "week") return a.createdAt >= weekAgoMs;
    return true; // "all"
  });

  const filtered = dateFiltered.filter((a) => {
    if (filterAgent !== "all" && a.agent !== filterAgent) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterProduct !== "all" && a.product !== filterProduct) return false;
    return true;
  });

  // Group by date
  const groups: Record<string, typeof filtered> = {};
  filtered.forEach((a) => {
    const key = getDateGroup(a.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });

  const types = ["all", ...Object.keys(activityTypeConfig)];
  const products = ["all", "CLCP", "ISK", "SE"];

  const dateTabs: { key: DateTab; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "all", label: "All Time" },
  ];

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Activity Feed</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Everything that happened across all agents</p>
        </div>

        {/* Date tabs */}
        <div
          className="flex gap-1 mb-4 p-1 rounded-xl w-fit border border-[var(--border-medium)]"
          style={{ background: "var(--bg-card)" }}
        >
          {dateTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDateTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                dateTab === tab.key
                  ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Agent pills */}
        <div className="mb-3">
          <AgentPills value={filterAgent} onChange={setFilterAgent} dateFiltered={dateFiltered} />
        </div>

        {/* Type + Product filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterSelect label="Type" value={filterType} onChange={setFilterType} options={types.map(t => ({ value: t, label: t === "all" ? "All Types" : activityTypeConfig[t as keyof typeof activityTypeConfig]?.label || t }))} />
          <FilterSelect label="Product" value={filterProduct} onChange={setFilterProduct} options={products.map(p => ({ value: p, label: p === "all" ? "All Products" : p }))} />
        </div>

        {/* Empty state */}
        {(fetchError || filtered.length === 0) && Object.keys(groups).length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--text-faint)]">
            <span className="text-4xl mb-4">📭</span>
            <p className="text-sm">No activity yet</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groups).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{dateGroup}</h2>
                <div className="flex-1 h-px bg-[var(--border-medium)]" />
                <span className="text-xs text-[var(--text-faint)]">{items.length} events</span>
              </div>
              <div className="space-y-2">
                {items.map((activity, i) => {
                  const typeConf = activityTypeConfig[activity.type] ?? activityTypeConfig["task"];
                  const statConf = statusConfig[activity.status] ?? statusConfig["success"];
                  const color = agentColors[activity.agent] || "#3b82f6";

                  // Metadata parts for the compact info row
                  const metaParts: string[] = [];
                  if (activity.cost != null && activity.cost > 0) metaParts.push(fmtCostActivity(activity.cost));
                  if (activity.tokens != null && activity.tokens > 0) metaParts.push(`${fmtTokensCompact(activity.tokens)} tokens`);
                  if (activity.model) metaParts.push(activity.model);
                  if (activity.durationSec != null && activity.durationSec > 0) metaParts.push(`${activity.durationSec}s`);

                  return (
                    <div
                      key={activity._id}
                      className="group relative flex gap-4 p-4 rounded-xl border border-[var(--border-medium)] hover:border-[var(--border-strong)] transition-all duration-200"
                      style={{ background: "var(--bg-card)", animationDelay: `${i * 40}ms` }}
                    >
                      {/* Agent avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        {agentEmojis[activity.agent] || "🤖"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{activity.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeConf.bg} ${typeConf.color}`}>
                              {typeConf.icon} {typeConf.label}
                            </span>
                            {activity.product && productConfig[activity.product] && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${productConfig[activity.product].bg} ${productConfig[activity.product].color}`}>
                                {activity.product}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={`flex items-center gap-1 text-[11px] ${statConf.color}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${statConf.dot}`} />
                              {statConf.label}
                            </div>
                            <span className="text-[11px] text-[var(--text-faint)]">{formatRelativeDate(activity.createdAt)}</span>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2">{activity.description}</p>
                        )}
                        {/* Metadata row: cost · tokens · model · duration */}
                        {metaParts.length > 0 ? (
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                            {metaParts.join(" · ")}
                          </p>
                        ) : (
                          <div className="mt-1 text-[11px] text-[var(--text-faint)] capitalize">{activity.agent}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

const AGENT_ORDER = ["sam", "cara", "dana", "miles", "penny", "mia", "devin", "frankie"];

function AgentPills({ value, onChange, dateFiltered }: {
  value: string;
  onChange: (v: string) => void;
  dateFiltered: EnrichedActivity[];
}) {
  const agentMap = useAgentMap();
  const agentsWithEntries = new Set(dateFiltered.map((a) => a.agent));
  const visibleAgents = AGENT_ORDER.filter((id) => agentsWithEntries.has(id));

  return (
    <div className="flex gap-1.5 overflow-x-auto flex-nowrap" style={{ scrollbarWidth: "none" }}>
      {/* All pill */}
      <button
        onClick={() => onChange("all")}
        className={`flex-shrink-0 flex items-center h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
          value === "all"
            ? "text-[var(--text-primary)] ring-1 ring-[var(--border-strong)] bg-[var(--bg-active)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        }`}
        style={value !== "all" ? { background: "var(--bg-elevated)" } : undefined}
      >
        All
      </button>

      {visibleAgents.map((id) => {
        const agent = agentMap[id];
        if (!agent) return null;
        const color = agent.color;
        const isSelected = value === id;

        return (
          <button
            key={id}
            onClick={() => onChange(isSelected ? "all" : id)}
            className={`flex-shrink-0 flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-medium transition-all whitespace-nowrap`}
            style={
              isSelected
                ? { backgroundColor: `${color}22`, boxShadow: `0 0 0 1.5px ${color}`, color: "var(--text-primary)" }
                : { background: "var(--bg-elevated)", color: "var(--text-muted)" }
            }
          >
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-[18px] h-[18px] rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] flex-shrink-0"
                style={{ backgroundColor: `${color}30` }}
              >
                {agent.emoji}
              </span>
            )}
            {agent.name}
          </button>
        );
      })}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs border rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer text-[var(--text-muted)]"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)", color: "var(--text-secondary)" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
