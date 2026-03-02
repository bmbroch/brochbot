"use client";

import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  avatar: string;
  role: string;
  color: string;
  description?: string;
  isAgent?: boolean;
}

interface AgentRun {
  id: string;
  label: string;
  agent: string;
  status: string;
  timestamp: string;
  durationSec?: number;
  cost?: number;
  tokens?: number;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ago`;
  if (hr > 0) return `${hr}h ago`;
  if (min > 0) return `${min}m ago`;
  return "just now";
}

function AgentModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/presentation/agent-activity?agent=${agent.id}`)
      .then((r) => r.json())
      .then((d) => {
        setRuns(d.runs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agent.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ background: "#ffffff", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-5"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-lg">
              {agent.emoji} {agent.name}
            </div>
            <div className="text-sm text-gray-500">{agent.role}</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Description */}
        {agent.description && (
          <div className="px-6 py-3 text-sm text-gray-600 border-b border-gray-100">
            {agent.description}
          </div>
        )}

        {/* Activity */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "46vh" }}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Activity (14 days)
          </div>
          {loading ? (
            <div className="text-sm text-gray-400">Loading…</div>
          ) : runs.length === 0 ? (
            <div className="text-sm text-gray-400">No recent activity.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {runs.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-3 py-2"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      background:
                        r.status === "success" ? "#22c55e" : "#ef4444",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 font-medium truncate">
                      {r.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(r.timestamp)}
                      {r.durationSec ? ` · ${r.durationSec}s` : ""}
                      {r.cost ? ` · $${r.cost.toFixed(4)}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Slide2() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Agent | null>(null);

  useEffect(() => {
    fetch("/team.json")
      .then((r) => r.json())
      .then((data: Agent[]) => setAgents(data.filter((a) => a.isAgent)));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-8">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Meet the team
        </h2>
        <p className="mt-2 text-xl text-gray-500 font-medium">
          10 agents. Each owns a job.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-4 w-full max-w-4xl">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelected(agent)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect fill='${encodeURIComponent(agent.color || "#ccc")}' width='56' height='56' rx='28'/><text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle' font-size='24'>${encodeURIComponent(agent.emoji)}</text></svg>`;
                }}
              />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {agent.emoji} {agent.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                {agent.role}
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">Click any agent to see their recent activity</p>

      {selected && (
        <AgentModal agent={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
