"use client";

import Shell from "@/components/Shell";
import { useActivities, activityTypeConfig, productConfig, statusConfig, agentEmojis, agentColors } from "@/lib/data-provider";
import { formatRelativeDate, getDateGroup } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const activities = useActivities();
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

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

  const agents = ["all", "sam", "cara", "dana", "miles"];
  const types = ["all", ...Object.keys(activityTypeConfig)];
  const products = ["all", "CLCP", "ISK", "SE"];

  return (
    <Shell>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
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
                  const typeConf = activityTypeConfig[activity.type];
                  const statConf = statusConfig[activity.status];
                  const color = agentColors[activity.agent] || "#3b82f6";
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
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">{activity.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeConf.bg} ${typeConf.color}`}>
                              {typeConf.icon} {typeConf.label}
                            </span>
                            {activity.product && (
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
                        <div className="mt-1.5 text-[11px] text-zinc-600 capitalize">{activity.agent}</div>
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
