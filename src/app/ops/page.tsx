"use client";

import Shell from "@/components/Shell";

/* ── Data (hardcoded for now — easy to swap for API later) ────────────── */

const DELEGATION_SCORE = {
  total: 18,
  delegated: 15,
  violations: 3,
  get pct() {
    return Math.round((this.delegated / this.total) * 100);
  },
};

const VIOLATIONS = [
  { time: "00:00", desc: "Sam wrote team page accordion fix + mobile responsiveness. That's Dev's job." },
  { time: "07:50", desc: "Sam fixed PostCSS breakage caused by sub-agent. Acceptable? Debatable." },
  { time: "08:00", desc: "Sam hit 93% context after 3 compactions. Delegate earlier, Sam." },
];

interface Agent {
  name: string;
  avatar: string;
  role: string;
  status: "Working" | "Idle" | "Never been used";
  lastActivity: string;
  lastTime: string;
  badge?: string;
}

const AGENTS: Agent[] = [
  { name: "Sam", avatar: "/avatars/sam.png", role: "Chief of Staff", status: "Working", lastActivity: "Orchestrating ops infrastructure overhaul", lastTime: "08:00", badge: "⚠️ Under Surveillance" },
  { name: "Dev", avatar: "/avatars/dev.png", role: "Web Developer", status: "Working", lastActivity: "Office mobile responsive fix", lastTime: "08:15", badge: "🏆 Employee of the Day" },
  { name: "Dana", avatar: "/avatars/dana.png", role: "Data Analyst", status: "Idle", lastActivity: "Morning analytics report", lastTime: "06:00" },
  { name: "Miles", avatar: "/avatars/miles.png", role: "GTM Lead", status: "Idle", lastActivity: "ISK weekly report (new format)", lastTime: "06:45" },
  { name: "Penny", avatar: "/avatars/penny.png", role: "Secretary / Ops", status: "Idle", lastActivity: "First audit report + ops infrastructure", lastTime: "08:16" },
  { name: "Mia", avatar: "/avatars/mia.png", role: "Social Media", status: "Idle", lastActivity: "UGC creator audit (yesterday)", lastTime: "Feb 18" },
  { name: "Ben", avatar: "/avatars/ben.jpg", role: "The Boss", status: "Working", lastActivity: "Issuing directives, as one does", lastTime: "08:08" },
  { name: "Cara", avatar: "/avatars/cara.png", role: "Customer Support", status: "Never been used", lastActivity: "Literally nothing. Ever.", lastTime: "—" },
];

interface TaskRow {
  time: string;
  task: string;
  assignedTo: string;
  status: string;
  violation?: boolean;
}

const TASKS: TaskRow[] = [
  { time: "00:00", task: "Nightly MC Sync", assignedTo: "Sam", status: "✅" },
  { time: "00:00", task: "Team page accordion fix + mobile responsiveness", assignedTo: "Sam ⚠️", status: "✅", violation: true },
  { time: "06:00", task: "Morning Analytics Report", assignedTo: "Dana", status: "✅" },
  { time: "06:20", task: "Enable GSC API check", assignedTo: "Miles", status: "✅" },
  { time: "06:25", task: "ISK keyword snapshot", assignedTo: "Miles", status: "✅" },
  { time: "06:30", task: "ISK keyword trends (6-month)", assignedTo: "Miles", status: "✅" },
  { time: "06:35", task: "ISK month-over-month comparison", assignedTo: "Miles", status: "✅" },
  { time: "06:45", task: "ISK weekly report (new format)", assignedTo: "Miles", status: "✅" },
  { time: "07:00", task: "Create agent knowledge briefs", assignedTo: "Sam", status: "✅" },
  { time: "07:30", task: "Create Dev agent", assignedTo: "Sam", status: "✅" },
  { time: "07:45", task: "Set up delegation audit cron", assignedTo: "Sam", status: "✅" },
  { time: "07:50", task: "Team page avatars (Personas style)", assignedTo: "Dev", status: "✅" },
  { time: "07:50", task: "Fix PostCSS breakage", assignedTo: "Sam", status: "✅", violation: true },
  { time: "07:55", task: "Office page v1", assignedTo: "Dev", status: "✅" },
  { time: "07:58", task: "Fix office meeting table overlap", assignedTo: "Sam → Dev", status: "✅" },
  { time: "08:00", task: "Build ops infrastructure", assignedTo: "Sam", status: "🔄" },
  { time: "08:05", task: "Add Dev agent to team + office", assignedTo: "Dev", status: "✅" },
  { time: "08:08", task: "Ops infrastructure overhaul", assignedTo: "Penny", status: "✅" },
  { time: "08:15", task: "Office mobile responsive fix", assignedTo: "Dev", status: "✅" },
];

interface CronJob {
  name: string;
  schedule: string;
  owner: string;
  status: "healthy" | "pending";
  lastRun: string;
  nextRun: string;
}

const CRON_JOBS: CronJob[] = [
  { name: "Morning Analytics Report", schedule: "8 AM CAT daily", owner: "Dana", status: "healthy", lastRun: "Today 06:00 UTC", nextRun: "Tomorrow 06:00 UTC" },
  { name: "Nightly MC Sync", schedule: "2 AM CAT daily", owner: "Sam", status: "healthy", lastRun: "Today 00:00 UTC", nextRun: "Tomorrow 00:00 UTC" },
  { name: "Weekly GSC Report", schedule: "Mon 8 AM CAT", owner: "Miles", status: "pending", lastRun: "Mon Feb 16", nextRun: "Mon Feb 23" },
  { name: "Delegation Audit", schedule: "6 PM CAT daily", owner: "System", status: "pending", lastRun: "Yesterday 16:00 UTC", nextRun: "Today 16:00 UTC" },
  { name: "Penny Daily Check", schedule: "4 PM CAT daily", owner: "Penny", status: "pending", lastRun: "—", nextRun: "Today 14:00 UTC" },
  { name: "Penny Weekly Audit", schedule: "Fri 9 AM CAT", owner: "Penny", status: "pending", lastRun: "—", nextRun: "Fri Feb 20" },
];

interface Decision {
  date: string;
  title: string;
  description: string;
  madeBy: string;
}

const DECISIONS: Decision[] = [
  { date: "Feb 19", title: "Agent Knowledge Briefs", description: "Persistent briefs in /agents/ so sub-agents load context from files", madeBy: "Ben + Sam" },
  { date: "Feb 19", title: "Dev Agent Created", description: "Web Developer agent to own MC codebase — Sam was writing code directly", madeBy: "Ben + Sam" },
  { date: "Feb 19", title: "Weekly GSC Report Format", description: "Date ranges as column headers, not ambiguous labels", madeBy: "Ben" },
  { date: "Feb 19", title: "Delegation Audit", description: "Daily cron at 6 PM CAT to review Sam's compliance", madeBy: "Ben" },
  { date: "Feb 19", title: "ISK Keyword Focus", description: "Track 'during interview' keywords, not prep keywords", madeBy: "Ben" },
];

/* ── Components ───────────────────────────────────────────────────────── */

function ScoreColor({ pct }: { pct: number }) {
  if (pct >= 90) return <span className="text-green-400">{pct}%</span>;
  if (pct >= 70) return <span className="text-yellow-400">{pct}%</span>;
  return <span className="text-red-400">{pct}%</span>;
}

function StatusDot({ status }: { status: Agent["status"] }) {
  const color =
    status === "Working"
      ? "bg-green-400 animate-pulse"
      : status === "Idle"
      ? "bg-yellow-400"
      : "bg-zinc-600";
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function CronDot({ status }: { status: CronJob["status"] }) {
  const color = status === "healthy" ? "bg-green-400" : "bg-zinc-500";
  return <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />;
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function OpsPage() {
  const pct = DELEGATION_SCORE.pct;
  const scoreBg =
    pct >= 90
      ? "from-green-500/10 to-green-500/5 border-green-500/20"
      : pct >= 70
      ? "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20"
      : "from-red-500/10 to-red-500/5 border-red-500/20";

  return (
    <Shell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        {/* Violations Ticker */}
        {VIOLATIONS.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 relative">
            <div className="flex animate-scroll whitespace-nowrap py-2.5 px-4">
              {[...VIOLATIONS, ...VIOLATIONS].map((v, i) => (
                <span key={i} className="text-red-400 text-sm mx-8 shrink-0">
                  ⚠️ {v.time} — {v.desc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📡 Agent Surveillance System</h1>
          <p className="text-zinc-500 text-sm mt-1">Because even AIs need performance reviews</p>
        </div>

        {/* Delegation Compliance */}
        <div className={`rounded-2xl border bg-gradient-to-br ${scoreBg} p-6`}>
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium mb-2">Delegation Compliance — Feb 19, 2026</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black tabular-nums"><ScoreColor pct={pct} /></span>
            <span className="text-zinc-500 text-lg">Sam&apos;s Delegation Score</span>
          </div>
          <p className="text-zinc-500 text-sm mt-2">
            {DELEGATION_SCORE.delegated}/{DELEGATION_SCORE.total} tasks properly delegated · <span className="text-red-400">{DELEGATION_SCORE.violations} violations today</span>
          </p>
          <p className="text-zinc-600 text-xs mt-1 italic">&quot;We&apos;re watching you, Sam.&quot;</p>
        </div>

        {/* Agent Status Board */}
        <section>
          <h2 className="text-lg font-semibold mb-4">👁️ Agent Status Board</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AGENTS.map((a) => (
              <div
                key={a.name}
                className="rounded-xl border border-[#222] bg-[#111] p-4 hover:border-[#333] transition-colors relative group"
              >
                {a.badge && (
                  <span className="absolute -top-2.5 right-3 text-[10px] bg-[#1a1a1a] border border-[#333] px-2 py-0.5 rounded-full">
                    {a.badge}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-[11px] text-zinc-500">{a.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusDot status={a.status} />
                  <span className={`text-xs ${a.status === "Working" ? "text-green-400" : a.status === "Idle" ? "text-yellow-400" : "text-zinc-600"}`}>
                    {a.status}
                  </span>
                  <span className="text-[10px] text-zinc-600 ml-auto">{a.lastTime}</span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2">{a.lastActivity}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Task Log */}
        <section>
          <h2 className="text-lg font-semibold mb-4">📋 Today&apos;s Task Log</h2>
          <div className="rounded-xl border border-[#222] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222] bg-[#111]">
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Time</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Task</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Assigned To</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {TASKS.map((t, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[#1a1a1a] ${t.violation ? "bg-red-500/[0.04]" : "hover:bg-white/[0.02]"}`}
                    >
                      <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{t.time}</td>
                      <td className={`px-4 py-2 ${t.violation ? "text-red-400" : ""}`}>{t.task}</td>
                      <td className={`px-4 py-2 ${t.violation ? "text-red-400 font-medium" : "text-zinc-400"}`}>{t.assignedTo}</td>
                      <td className="px-4 py-2">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cron Job Monitor */}
        <section>
          <h2 className="text-lg font-semibold mb-4">⏰ Cron Job Monitor</h2>
          <div className="grid gap-2">
            {CRON_JOBS.map((j) => (
              <div key={j.name} className="rounded-xl border border-[#222] bg-[#111] px-4 py-3 flex items-center gap-4">
                <CronDot status={j.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{j.name}</p>
                  <p className="text-[11px] text-zinc-500">{j.schedule} · {j.owner}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-400">{j.lastRun}</p>
                  <p className="text-[10px] text-zinc-600">Next: {j.nextRun}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Decision Log */}
        <section>
          <h2 className="text-lg font-semibold mb-4">📜 Decision Log</h2>
          <div className="space-y-0 border-l-2 border-[#222] ml-3">
            {DECISIONS.map((d, i) => (
              <div key={i} className="pl-6 pb-6 relative">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-400" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{d.date} · {d.madeBy}</p>
                <p className="text-sm font-semibold">{d.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{d.description}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-zinc-700 text-xs pb-8">🕵️ This page is always watching. Behave accordingly.</p>
      </div>

      {/* Ticker animation */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </Shell>
  );
}
