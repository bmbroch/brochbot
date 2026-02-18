"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useScheduledTasks, agentEmojis, agentColors } from "@/lib/data-provider";

const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CalendarPage() {
  const scheduled = useScheduledTasks();
  const [weekOffset, setWeekOffset] = useState(0);

  const now = new Date();
  const baseWeekStart = getWeekStart(now);
  const weekStart = new Date(baseWeekStart.getTime() + weekOffset * 7 * 86400000);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 86400000);
    return d;
  });

  // Map tasks to grid positions
  const events: { task: typeof scheduled[0]; dayIndex: number; hour: number }[] = [];
  scheduled.forEach((task) => {
    if (!task.nextRun) return;
    const taskDate = new Date(task.nextRun);
    weekDays.forEach((day, dayIndex) => {
      if (taskDate.toDateString() === day.toDateString()) {
        events.push({ task, dayIndex, hour: taskDate.getHours() });
      }
    });
  });

  // Also generate recurring events from schedule patterns
  const dailyTasks = scheduled.filter((t) => t.schedule.startsWith("0 "));
  dailyTasks.forEach((task) => {
    const match = task.schedule.match(/^0 (\d+)/);
    if (!match) return;
    const hour = parseInt(match[1]);
    weekDays.forEach((day, dayIndex) => {
      // Avoid duplicates
      if (!events.find((e) => e.task._id === task._id && e.dayIndex === dayIndex)) {
        events.push({ task, dayIndex, hour });
      }
    });
  });

  const isToday = (d: Date) => d.toDateString() === now.toDateString();

  return (
    <Shell>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {formatDateShort(weekDays[0])} — {formatDateShort(weekDays[6])}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-[#262626] text-zinc-400 hover:bg-white/5 transition-colors">← Prev</button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-sm rounded-lg border border-[#262626] text-zinc-400 hover:bg-white/5 transition-colors">Today</button>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-[#262626] text-zinc-400 hover:bg-white/5 transition-colors">Next →</button>
          </div>
        </div>

        {/* Upcoming tasks */}
        <div className="mb-6 flex flex-wrap gap-3">
          {scheduled.filter(t => t.status === "active").map((task) => (
            <div key={task._id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-[#262626] text-xs">
              <span>{agentEmojis[task.agent]}</span>
              <span className="font-medium text-zinc-300">{task.name}</span>
              <span className="text-zinc-600">{task.schedule}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="rounded-xl border border-[#262626] overflow-hidden bg-[#141414]">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#262626]">
            <div className="p-2" />
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`p-3 text-center border-l border-[#262626] ${isToday(day) ? "bg-blue-500/5" : ""}`}
              >
                <div className="text-[10px] font-medium text-zinc-500 uppercase">{dayNames[i]}</div>
                <div className={`text-lg font-semibold mt-0.5 ${isToday(day) ? "text-blue-400" : "text-zinc-300"}`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#1a1a1a] min-h-[50px]">
                <div className="p-2 text-[10px] text-zinc-600 text-right pr-3 pt-1">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>
                {weekDays.map((_, dayIndex) => {
                  const dayEvents = events.filter((e) => e.dayIndex === dayIndex && e.hour === hour);
                  return (
                    <div
                      key={dayIndex}
                      className={`border-l border-[#1a1a1a] p-0.5 relative ${isToday(weekDays[dayIndex]) ? "bg-blue-500/[0.02]" : ""}`}
                    >
                      {dayEvents.map((ev) => {
                        const color = agentColors[ev.task.agent] || "#3b82f6";
                        return (
                          <div
                            key={ev.task._id + dayIndex}
                            className="px-1.5 py-1 rounded-md text-[10px] font-medium truncate mb-0.5 transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: `${color}20`, color, borderLeft: `2px solid ${color}` }}
                            title={`${ev.task.name} — ${ev.task.description}`}
                          >
                            {agentEmojis[ev.task.agent]} {ev.task.name}
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
      </div>
    </Shell>
  );
}
