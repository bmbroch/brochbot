"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useActivities, useTasks, agentColors, teamMembers } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface BotProps {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: string;
  isWorking: boolean;
  currentTask?: string;
  lastActivity?: string;
  lastActivityTime?: number;
  x: number;
  y: number;
  onClick: () => void;
}

// ─── SVG Bot Avatars ─────────────────────────────────────────────────────────

function SamBot({ isWorking, color }: { isWorking: boolean; color: string }) {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" className={isWorking ? "animate-typing" : "animate-float"}>
      {/* Body */}
      <rect x="16" y="30" width="48" height="42" rx="12" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      {/* Head */}
      <rect x="12" y="4" width="56" height="32" rx="14" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2"/>
      {/* Eyes */}
      <circle cx="30" cy="18" r="4" fill={color}>
        {isWorking && <animate attributeName="r" values="4;3;4" dur="0.6s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="50" cy="18" r="4" fill={color}>
        {isWorking && <animate attributeName="r" values="4;3;4" dur="0.6s" repeatCount="indefinite"/>}
      </circle>
      {/* Smile */}
      <path d="M32 26 Q40 32 48 26" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Antenna - hub symbol */}
      <circle cx="40" cy="2" r="3" fill={color} fillOpacity="0.6">
        <animate attributeName="fillOpacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <line x1="40" y1="5" x2="40" y2="4" stroke={color} strokeWidth="1.5"/>
      {/* Arms */}
      <rect x="6" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="64" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="24" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="44" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function CaraBot({ isWorking, color }: { isWorking: boolean; color: string }) {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" className={isWorking ? "animate-typing" : "animate-float"} style={{ animationDelay: "0.4s" }}>
      {/* Body */}
      <rect x="16" y="30" width="48" height="42" rx="12" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      {/* Head */}
      <rect x="12" y="4" width="56" height="32" rx="14" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2"/>
      {/* Headphones band */}
      <path d="M12 20 Q12 4 40 4 Q68 4 68 20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Headphone pads */}
      <rect x="4" y="14" width="12" height="16" rx="4" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5"/>
      <rect x="64" y="14" width="12" height="16" rx="4" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5"/>
      {/* Eyes */}
      <circle cx="30" cy="18" r="3.5" fill={color}/>
      <circle cx="50" cy="18" r="3.5" fill={color}/>
      {/* Mouth */}
      <ellipse cx="40" cy="27" rx="4" ry="2" fill={color} fillOpacity="0.5"/>
      {/* Arms */}
      <rect x="6" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="64" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="24" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="44" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function DanaBot({ isWorking, color }: { isWorking: boolean; color: string }) {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" className={isWorking ? "animate-typing" : "animate-float"} style={{ animationDelay: "0.8s" }}>
      {/* Body */}
      <rect x="16" y="30" width="48" height="42" rx="12" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      {/* Chart on body */}
      <polyline points="26,62 34,52 42,56 50,44 56,48" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {isWorking && <animate attributeName="points" values="26,62 34,52 42,56 50,44 56,48;26,58 34,48 42,54 50,42 56,46;26,62 34,52 42,56 50,44 56,48" dur="1.5s" repeatCount="indefinite"/>}
      </polyline>
      {/* Head */}
      <rect x="12" y="4" width="56" height="32" rx="14" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2"/>
      {/* Eyes - rectangular/screen-like */}
      <rect x="25" y="14" width="10" height="8" rx="2" fill={color} fillOpacity="0.8"/>
      <rect x="45" y="14" width="10" height="8" rx="2" fill={color} fillOpacity="0.8"/>
      {/* Inner eye glow */}
      <rect x="27" y="16" width="3" height="4" rx="1" fill="white" fillOpacity="0.6"/>
      <rect x="47" y="16" width="3" height="4" rx="1" fill="white" fillOpacity="0.6"/>
      {/* Mouth */}
      <rect x="34" y="26" width="12" height="3" rx="1.5" fill={color} fillOpacity="0.4"/>
      {/* Arms */}
      <rect x="6" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="64" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="24" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="44" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function MilesBot({ isWorking, color }: { isWorking: boolean; color: string }) {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" className={isWorking ? "animate-typing" : "animate-float"} style={{ animationDelay: "1.2s" }}>
      {/* Body */}
      <rect x="16" y="30" width="48" height="42" rx="12" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      {/* Rocket on body */}
      <path d="M40 40 L36 54 L40 50 L44 54 Z" fill={color} fillOpacity="0.5">
        {isWorking && <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="0.8s" repeatCount="indefinite"/>}
      </path>
      {/* Rocket flames */}
      {isWorking && (
        <g>
          <circle cx="38" cy="56" r="2" fill="#ef4444" fillOpacity="0.6">
            <animate attributeName="r" values="1;3;1" dur="0.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="42" cy="56" r="2" fill="#eab308" fillOpacity="0.6">
            <animate attributeName="r" values="2;1;2" dur="0.3s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}
      {/* Head */}
      <rect x="12" y="4" width="56" height="32" rx="14" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2"/>
      {/* Eyes */}
      <circle cx="30" cy="18" r="4" fill={color}/>
      <circle cx="50" cy="18" r="4" fill={color}/>
      {/* Star eyes when working */}
      {isWorking && (
        <>
          <circle cx="30" cy="18" r="2" fill="white" fillOpacity="0.8"/>
          <circle cx="50" cy="18" r="2" fill="white" fillOpacity="0.8"/>
        </>
      )}
      {/* Grin */}
      <path d="M30 26 Q40 34 50 26" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Arms */}
      <rect x="6" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="64" y="38" width="10" height="24" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="24" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="44" y="72" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function BenAvatar({ isWorking, color }: { isWorking: boolean; color: string }) {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" className={isWorking ? "animate-typing" : "animate-float"} style={{ animationDelay: "1.6s" }}>
      {/* Body - shirt */}
      <rect x="16" y="38" width="48" height="36" rx="10" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      {/* Collar */}
      <path d="M30 38 L40 48 L50 38" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Head - more rounded for human */}
      <circle cx="40" cy="20" r="18" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      {/* Hair */}
      <path d="M22 16 Q24 6 40 4 Q56 6 58 16" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5"/>
      {/* Eyes */}
      <circle cx="33" cy="20" r="2.5" fill={color}/>
      <circle cx="47" cy="20" r="2.5" fill={color}/>
      {/* Smile */}
      <path d="M34 27 Q40 31 46 27" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Arms */}
      <rect x="6" y="42" width="10" height="22" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="64" y="42" width="10" height="22" rx="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="24" y="74" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <rect x="44" y="74" width="12" height="14" rx="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

const botComponents: Record<string, React.FC<{ isWorking: boolean; color: string }>> = {
  sam: SamBot,
  cara: CaraBot,
  dana: DanaBot,
  miles: MilesBot,
  ben: BenAvatar,
};

// ─── Workstation Component ───────────────────────────────────────────────────

function Workstation({ id, name, role, color, isWorking, currentTask, lastActivity, lastActivityTime, x, y, onClick }: BotProps) {
  const [hovered, setHovered] = useState(false);
  const BotComponent = botComponents[id] || SamBot;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* Desk */}
      <rect x="-50" y="70" width="180" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Desk legs */}
      <rect x="-40" y="82" width="4" height="20" rx="1" fill="#1a1a1a"/>
      <rect x="116" y="82" width="4" height="20" rx="1" fill="#1a1a1a"/>

      {/* Monitor */}
      <g transform="translate(90, 20)">
        {/* Monitor stand */}
        <rect x="14" y="48" width="12" height="22" rx="2" fill="#1a1a1a"/>
        <rect x="6" y="68" width="28" height="4" rx="2" fill="#1a1a1a"/>
        {/* Monitor frame */}
        <rect x="-4" y="0" width="48" height="50" rx="6" fill="#111" stroke="#262626" strokeWidth="1.5"/>
        {/* Screen */}
        <rect x="2" y="4" width="36" height="38" rx="3" fill={isWorking ? `${color}10` : "#0a0a0a"}>
          {isWorking && (
            <animate attributeName="fill" values={`${color}08;${color}15;${color}08`} dur="2s" repeatCount="indefinite"/>
          )}
        </rect>
        {/* Screen content when working */}
        {isWorking && (
          <g>
            <rect x="6" y="10" width="20" height="2" rx="1" fill={color} fillOpacity="0.4">
              <animate attributeName="width" values="12;20;16;20" dur="1.5s" repeatCount="indefinite"/>
            </rect>
            <rect x="6" y="16" width="16" height="2" rx="1" fill={color} fillOpacity="0.3">
              <animate attributeName="width" values="16;12;20;16" dur="1.8s" repeatCount="indefinite"/>
            </rect>
            <rect x="6" y="22" width="24" height="2" rx="1" fill={color} fillOpacity="0.2">
              <animate attributeName="width" values="20;24;14;20" dur="2s" repeatCount="indefinite"/>
            </rect>
            <rect x="6" y="28" width="14" height="2" rx="1" fill={color} fillOpacity="0.3">
              <animate attributeName="width" values="14;18;10;14" dur="1.2s" repeatCount="indefinite"/>
            </rect>
          </g>
        )}
        {/* Monitor glow */}
        {isWorking && (
          <ellipse cx="20" cy="50" rx="30" ry="8" fill={color} fillOpacity="0.03" className="animate-glow"/>
        )}
      </g>

      {/* Bot */}
      <foreignObject x="-2" y="-20" width="80" height="90">
        <div className="flex items-end justify-center h-full">
          <BotComponent isWorking={isWorking} color={color} />
        </div>
      </foreignObject>

      {/* Status dot */}
      <circle cx="70" cy="-10" r="5" fill={isWorking ? "#22c55e" : "#52525b"} stroke="#0a0a0a" strokeWidth="2">
        {isWorking && <animate attributeName="fillOpacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>}
      </circle>

      {/* Name label */}
      <text x="40" y="115" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">{name}</text>
      <text x="40" y="130" textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="Inter, sans-serif">{role}</text>

      {/* Tooltip on hover */}
      {hovered && (
        <g>
          <rect x="-20" y="-90" width="200" height="72" rx="10" fill="#141414" stroke="#333" strokeWidth="1"/>
          <text x="-8" y="-68" fill="white" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">{name} — {role}</text>
          <text x="-8" y="-52" fill="#71717a" fontSize="10" fontFamily="Inter, sans-serif">
            {isWorking ? `Working: ${currentTask || "Active"}` : "Idle"}
          </text>
          <text x="-8" y="-36" fill="#52525b" fontSize="9" fontFamily="Inter, sans-serif">
            {lastActivity ? `Last: ${lastActivity}` : "No recent activity"}
          </text>
          {lastActivityTime && (
            <text x="-8" y="-24" fill="#3f3f46" fontSize="9" fontFamily="Inter, sans-serif">
              {formatRelativeDate(lastActivityTime)}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

// ─── Main Office Page ────────────────────────────────────────────────────────

export default function OfficePage() {
  const activities = useActivities();
  const tasks = useTasks();
  const router = useRouter();

  const getAgentInfo = (id: string) => {
    const member = teamMembers.find((m) => m.id === id);
    const agentActivities = activities.filter((a) => a.agent === id);
    const agentTasks = tasks.filter((t) => t.assignee === id && t.status === "in_progress");
    const recentCount = agentActivities.filter((a) => Date.now() - a.createdAt < 86400000).length;
    const lastAct = agentActivities[0];

    return {
      name: member?.name || id,
      emoji: member?.emoji || "🤖",
      role: member?.role || "Agent",
      isWorking: recentCount > 0 || agentTasks.length > 0,
      currentTask: agentTasks[0]?.title,
      lastActivity: lastAct?.title,
      lastActivityTime: lastAct?.createdAt,
    };
  };

  // Semicircle layout positions
  const positions = [
    { id: "sam" as const, x: 280, y: 120 },    // Center back (hub)
    { id: "cara" as const, x: 80, y: 180 },     // Left
    { id: "dana" as const, x: 480, y: 180 },    // Right
    { id: "miles" as const, x: 130, y: 320 },   // Front left
    { id: "ben" as const, x: 430, y: 320 },     // Front right (CEO desk)
  ];

  return (
    <Shell>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">The Office</h1>
          <p className="text-sm text-zinc-500 mt-1">Where the magic happens ✨</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-zinc-500">Working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <span className="text-xs text-zinc-500">Idle</span>
          </div>
          <span className="text-xs text-zinc-600">Hover for details · Click to view profile</span>
        </div>

        {/* Office Scene */}
        <div className="rounded-2xl border border-[#262626] bg-[#0c0c0c] overflow-hidden relative">
          {/* Grid floor pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Ambient glow from ceiling */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-blue-500/[0.03] to-transparent rounded-full" />

          <svg
            viewBox="0 0 650 500"
            className="w-full relative z-10"
            style={{ minHeight: "500px" }}
          >
            {/* Floor perspective lines */}
            <defs>
              <radialGradient id="floorGlow" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="white" stopOpacity="0.015"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="650" height="500" fill="url(#floorGlow)"/>

            {/* Workstations */}
            {positions.map((pos) => {
              const info = getAgentInfo(pos.id);
              const color = agentColors[pos.id] || "#3b82f6";
              return (
                <Workstation
                  key={pos.id}
                  id={pos.id}
                  name={info.name}
                  emoji={info.emoji}
                  role={info.role}
                  color={color}
                  isWorking={info.isWorking}
                  currentTask={info.currentTask}
                  lastActivity={info.lastActivity}
                  lastActivityTime={info.lastActivityTime}
                  x={pos.x}
                  y={pos.y}
                  onClick={() => router.push("/team")}
                />
              );
            })}
          </svg>
        </div>

        {/* Quick status cards below */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {positions.map((pos) => {
            const info = getAgentInfo(pos.id);
            const color = agentColors[pos.id] || "#3b82f6";
            return (
              <div
                key={pos.id}
                className="p-3 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all cursor-pointer"
                onClick={() => router.push("/team")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: `${color}15` }}>
                    {info.emoji}
                  </div>
                  <span className="text-xs font-semibold">{info.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ml-auto ${info.isWorking ? "bg-green-400" : "bg-zinc-600"}`} />
                </div>
                <p className="text-[10px] text-zinc-500 truncate">
                  {info.currentTask || info.lastActivity || "No recent activity"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
