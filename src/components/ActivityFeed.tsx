"use client";

import { useState } from "react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  DatabaseZap, UserSearch, FileBarChart, Timer, Settings, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockActivities, typeConfig, statusConfig, productConfig,
  type Activity, type ActivityType, type Product,
} from "@/lib/mock-data";

const typeIcons: Record<ActivityType, React.ElementType> = {
  data_query: DatabaseZap,
  customer_lookup: UserSearch,
  report_generated: FileBarChart,
  cron_job: Timer,
  system_config: Settings,
  memory_update: Brain,
};

const allTypes: ActivityType[] = ["data_query", "customer_lookup", "report_generated", "cron_job", "system_config", "memory_update"];
const allProducts: Product[] = ["CLCP", "ISK", "SE"];

function groupByDate(activities: Activity[]): [string, Activity[]][] {
  const groups: Record<string, Activity[]> = {};
  for (const a of activities) {
    const d = new Date(a.timestamp);
    let label: string;
    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";
    else label = format(d, "EEEE, MMM d");
    (groups[label] ??= []).push(a);
  }
  return Object.entries(groups);
}

export default function ActivityFeed() {
  const [typeFilter, setTypeFilter] = useState<ActivityType | null>(null);
  const [productFilter, setProductFilter] = useState<Product | null>(null);

  const filtered = mockActivities.filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (productFilter && a.product !== productFilter) return false;
    return true;
  });

  const grouped = groupByDate(filtered);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Activity Feed</h2>
        <p className="text-sm text-zinc-500 mt-1">Everything that happened across your products.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterChip active={!typeFilter && !productFilter} onClick={() => { setTypeFilter(null); setProductFilter(null); }}>
          All
        </FilterChip>
        <div className="w-px h-6 bg-border-subtle self-center mx-1" />
        {allTypes.map((t) => (
          <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? null : t)}>
            {typeConfig[t].label}
          </FilterChip>
        ))}
        <div className="w-px h-6 bg-border-subtle self-center mx-1" />
        {allProducts.map((p) => (
          <FilterChip key={p} active={productFilter === p} onClick={() => setProductFilter(productFilter === p ? null : p)}>
            <span className={productConfig[p].color}>{p}</span>
          </FilterChip>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {grouped.map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{dateLabel}</h3>
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-xs text-zinc-600">{items.length} events</span>
            </div>
            <div className="space-y-2">
              {items.map((activity, i) => (
                <ActivityCard key={activity._id} activity={activity} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg font-medium">No activities match your filters</p>
          <p className="text-sm mt-1">Try adjusting the filters above</p>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const Icon = typeIcons[activity.type];
  const tc = typeConfig[activity.type];
  const sc = statusConfig[activity.status];
  const pc = productConfig[activity.product];

  return (
    <div
      className="group relative flex gap-4 p-4 rounded-xl bg-surface-2 border border-border-subtle hover:border-border-strong transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Icon */}
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", tc.bg)}>
        <Icon className={cn("w-4.5 h-4.5", tc.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-[14px] font-semibold text-white truncate">{activity.title}</h4>
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", tc.bg, tc.color, "border-transparent")}>
                {tc.label}
              </span>
            </div>
            <p className="text-[13px] text-zinc-500 mt-1 line-clamp-2">{activity.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[11px] text-zinc-600 whitespace-nowrap">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-3 mt-2.5">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
            <span className={cn("text-[11px] font-medium", sc.color)}>{sc.label}</span>
          </div>
          <span className="text-zinc-700">·</span>
          <span className={cn("text-[11px] font-medium", pc.color)}>{pc.label}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-[11px] text-zinc-600">{format(activity.timestamp, "h:mm a")}</span>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border",
        active
          ? "bg-white/[0.1] border-border-strong text-white"
          : "bg-transparent border-border-subtle text-zinc-500 hover:text-zinc-300 hover:border-border-strong"
      )}
    >
      {children}
    </button>
  );
}
