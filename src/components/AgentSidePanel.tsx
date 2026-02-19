"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { agentColors, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const days = Math.floor(diff / 86_400_000);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default function AgentSidePanel({
  member,
  activities,
  isOpen,
  onClose,
  lastActiveTs,
}: {
  member: TeamMember;
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
  lastActiveTs?: number;
}) {
  const color = agentColors[member.id] || "#666";
  const [visible, setVisible] = useState(false);
  const recent = activities.filter(a => a.agent === member.id).slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{ background: "var(--bg-overlay)", opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-[390px] border-l flex flex-col transition-transform duration-[220ms] ease-out overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-medium)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {/* Avatar + Identity */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-[100px] h-[100px] rounded-full overflow-hidden border-[3px] mb-4"
              style={{ borderColor: color }}
            >
              {member.avatar ? (
                <Image src={member.avatar} alt={member.name} width={100} height={100} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
                  <span className="text-[48px] leading-none">{member.emoji}</span>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{member.name}</h2>
            <p className="text-sm font-medium mt-0.5" style={{ color }}>{member.role}</p>
          </div>

          {/* About */}
          <div className="mb-6">
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-semibold mb-2">About</p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{member.description}</p>
          </div>

          {/* Recurring Tasks */}
          {member.recurringTasks && member.recurringTasks.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-semibold mb-2">Recurring Tasks</p>
              <div className="space-y-1.5">
                {member.recurringTasks.map(task => (
                  <div key={task} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--text-faint)]">⏰</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div className="mb-6">
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-semibold mb-2">Data Sources</p>
            <div className="flex flex-wrap gap-1.5">
              {member.dataSources.map(ds => (
                <span
                  key={ds}
                  className="text-[11px] px-2.5 py-0.5 rounded-full text-[var(--text-secondary)] border border-[var(--border-medium)]"
                  style={{ background: "var(--bg-hover)" }}
                >
                  {ds}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-semibold mb-2">Recent Activity</p>
            {recent.length === 0 ? (
              lastActiveTs ? (
                <p className="text-xs text-[var(--text-muted)]">Active {timeAgo(lastActiveTs)} — no task detail captured</p>
              ) : (
                <p className="text-xs text-[var(--text-faint)]">No recent activity</p>
              )
            ) : (
              <div className="space-y-2">
                {recent.map(a => (
                  <div key={a._id} className="flex items-start gap-3 text-xs">
                    <span className="text-[var(--text-faint)] shrink-0 w-20 text-right pt-0.5">{formatRelativeDate(a.createdAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border-strong)] shrink-0 mt-1.5" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">{a.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
