"use client";

import Shell from "@/components/Shell";
import { activityTypeConfig, productConfig, statusConfig, agentEmojis, agentColors, Activity } from "@/lib/data-provider";
import { formatRelativeDate, getDateGroup } from "@/lib/utils";
import { useState, useEffect } from "react";

// Extended activity type with metadata fields from mc-data.json
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

export default function Home() {
  const [activities, setActivities] = useState<EnrichedActivity[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  // Fetch enriched activities from mc-data.json (has cost/tokens/model/durationSec)
  useEffect(() => {
    fetch("/mc-data.json")
      .then((r) => r.json())
      .then((data) => {
        const rawActs: Array<{
          id: string;
          agent: string;
          title: string;
          description?: string;
          status: string;
          date?: string;
          type?: string;
          product?: string;
          tokens?: number;
          cost?: number;
          model?: string;
          durationSec?: number;
        }> = data.activities || [];
        // Map to EnrichedActivity, newest first
        const mapped: EnrichedActivity[] = rawActs
          .map((a) => ({
            _id: a.id,
            agent: a.agent,
            type: (a.type as Activity["type"]) || "task",
            title: a.title,
            description: a.description,
            product: a.product as Activity["product"] | undefined,
            status: (a.status as Activity["status"]) || "success",
            createdAt: a.date ? new Date(a.date).getTime() : Date.now(),
            tokens: a.tokens,
            cost: a.cost,
            model: a.model,
            durationSec: a.durationSec,
          }))
          .reverse();
        if (mapped.length > 0) setActivities(mapped);
      })
      .catch(() => {
        setFetchError(true);
      });
  }, []);

  const filtered = activities.filter((a) => {
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

  const agents = ["all", "sam", "cara", "dana", "miles", "penny", "mia", "devin", "frankie"];
  const types = ["all", ...Object.keys(activityTypeConfig)];
  const products = ["all", "CLCP", "ISK", "SE"];

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-sm text-zinc-500 mt-1">Everything that happened across all agents</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterSelect label="Agent" value={filterAgent} onChange={setFilterAgent} options={agents.map(a => ({ value: a, label: a === "all" ? "All Agents" : `${agentEmojis[a] || ""} ${a.charAt(0).toUpperCase() + a.slice(1)}` }))} />
          <FilterSelect label="Type" value={filterType} onChange={setFilterType} options={types.map(t => ({ value: t, label: t === "all" ? "All Types" : activityTypeConfig[t as keyof typeof activityTypeConfig]?.label || t }))} />
          <FilterSelect label="Product" value={filterProduct} onChange={setFilterProduct} options={products.map(p => ({ value: p, label: p === "all" ? "All Products" : p }))} />
        </div>

        {/* Empty state */}
        {(fetchError || activities.length === 0) && Object.keys(groups).length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <span className="text-4xl mb-4">📭</span>
            <p className="text-sm">No activity yet</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groups).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{dateGroup}</h2>
                <div className="flex-1 h-px bg-[#262626]" />
                <span className="text-xs text-zinc-600">{items.length} events</span>
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
                      className="group relative flex gap-4 p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all duration-200"
                      style={{ animationDelay: `${i * 40}ms` }}
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
                            <span className="text-sm font-semibold">{activity.title}</span>
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
                            <span className="text-[11px] text-zinc-600">{formatRelativeDate(activity.createdAt)}</span>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{activity.description}</p>
                        )}
                        {/* Metadata row: cost · tokens · model · duration */}
                        {metaParts.length > 0 ? (
                          <p className="mt-1 text-[11px] text-zinc-500">
                            {metaParts.join(" · ")}
                          </p>
                        ) : (
                          <div className="mt-1 text-[11px] text-zinc-600 capitalize">{activity.agent}</div>
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

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs bg-[#141414] border border-[#262626] text-zinc-400 rounded-lg px-3 py-1.5 outline-none focus:border-[#3b82f6] transition-colors appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
