"use client";

import { useState, useMemo } from "react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockScheduledTasks, type ScheduledTask } from "@/lib/mock-data";

const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am - 9pm
const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
};

export default function CalendarView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const tasksByDay = useMemo(() => {
    const map: Record<string, ScheduledTask[]> = {};
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map[key] = mockScheduledTasks.filter((t) => {
        const taskDate = new Date(t.nextRun);
        return isSameDay(taskDate, day);
      });
    }
    return map;
  }, [days]);

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-sm text-zinc-500 mt-1">Scheduled tasks and recurring jobs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="ml-3 text-sm text-zinc-400 font-medium">
            {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-border-medium bg-surface-2">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-medium sticky top-0 bg-surface-2 z-10">
          <div className="border-r border-border-subtle" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "py-3 px-2 text-center border-r border-border-subtle last:border-r-0",
              )}
            >
              <p className="text-[11px] font-medium text-zinc-500 uppercase">{format(day, "EEE")}</p>
              <p className={cn(
                "text-lg font-semibold mt-0.5",
                isToday(day) ? "text-blue-400" : "text-zinc-300"
              )}>
                {format(day, "d")}
              </p>
              {isToday(day) && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-r border-border-subtle h-16 flex items-start justify-end pr-2 pt-1">
                <span className="text-[10px] text-zinc-600 font-medium">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const tasks = (tasksByDay[key] || []).filter((t) => {
                  const h = new Date(t.nextRun).getHours();
                  return h === hour;
                });
                return (
                  <div
                    key={`${hour}-${day.toISOString()}`}
                    className={cn(
                      "border-r border-b border-border-subtle last:border-r-0 h-16 p-0.5 relative",
                      isToday(day) && "bg-blue-500/[0.02]"
                    )}
                  >
                    {tasks.map((task) => {
                      const c = colorMap[task.color || "blue"];
                      return (
                        <div
                          key={task._id}
                          className={cn(
                            "rounded-md px-2 py-1 border text-[11px] truncate cursor-default hover:scale-[1.02] transition-transform",
                            c.bg, c.border
                          )}
                          title={`${task.name} — ${task.description}`}
                        >
                          <span className={cn("font-semibold", c.text)}>{task.name}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-zinc-500">
        <Clock className="w-3 h-3" />
        <span>Showing {mockScheduledTasks.length} scheduled tasks</span>
        <div className="flex-1" />
        {Object.entries(colorMap).map(([name, c]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-sm", c.bg, "border", c.border)} />
            <span className="capitalize">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
