"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { agentColors, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

function MemberDetail({ member, activities }: { member: TeamMember; activities: Activity[] }) {
  const recent = activities.filter(a => a.agent === member.id).slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">About</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{member.description}</p>
      </div>

      {member.recurringTasks && member.recurringTasks.length > 0 && (
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Recurring Tasks</p>
          <div className="space-y-1">
            {member.recurringTasks.map(task => (
              <div key={task} className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-zinc-600">⏰</span>
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Data Sources</p>
        <div className="flex flex-wrap gap-1.5">
          {member.dataSources.map(ds => (
            <span key={ds} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-[#262626]">{ds}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Recent Activity</p>
        {recent.length === 0 ? (
          <p className="text-xs text-zinc-600">No recent activity</p>
        ) : (
          <div className="space-y-1.5">
            {recent.map(a => (
              <div key={a._id} className="flex items-center gap-3 text-xs">
                <span className="text-zinc-600 shrink-0 w-20 text-right">{formatRelativeDate(a.createdAt)}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                <span className="text-zinc-400">{a.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentDrawer({
  member,
  activities,
  isOpen,
  onClose,
}: {
  member: TeamMember;
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const color = agentColors[member.id] || "#666";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-250"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />
      {/* Drawer */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 max-h-[60vh] rounded-t-2xl border-t border-[#262626] bg-[#141414] overflow-hidden flex flex-col transition-transform duration-250 ease-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 border-b border-[#262626]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shrink-0 overflow-hidden"
            style={{ backgroundColor: `${color}15` }}
          >
            {member.avatar ? (
              <Image src={member.avatar} alt={member.name} width={40} height={40} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl">{member.emoji}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{member.name}</p>
            <p className="text-xs" style={{ color }}>{member.role}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-zinc-500 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <MemberDetail member={member} activities={activities} />
        </div>
      </div>
    </>
  );
}
