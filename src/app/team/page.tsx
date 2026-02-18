"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useActivities, agentColors, teamMembers, type TeamMember, type Activity } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

// ─── Detail Panel ────────────────────────────────────────────────────────────

function DetailPanel({ member, activities, onClose }: { member: TeamMember; activities: Activity[]; onClose: () => void }) {
  const color = agentColors[member.id] || "#3b82f6";
  const recent = activities.filter(a => a.agent === member.id).slice(0, 5);
  const todayCount = activities.filter(a => a.agent === member.id && Date.now() - a.createdAt < 86400000).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#262626]" style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${color}20` }}>
                {member.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold">{member.name}</h2>
                <p className="text-sm font-medium" style={{ color }}>{member.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${todayCount > 0 ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
                  <span className="text-xs text-zinc-500">{todayCount > 0 ? "Active" : "Idle"} · {todayCount} actions today</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">About</p>
            <p className="text-sm text-zinc-400 leading-relaxed">{member.description}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Data Sources</p>
            <div className="flex flex-wrap gap-1.5">
              {member.dataSources.map(ds => (
                <span key={ds} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-[#262626]">{ds}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Recent Activity</p>
            {recent.length === 0 ? (
              <p className="text-xs text-zinc-600">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recent.map(a => (
                  <div key={a._id} className="flex items-start gap-2 text-xs">
                    <span className="text-zinc-600 w-16 flex-shrink-0">{formatRelativeDate(a.createdAt)}</span>
                    <span className="text-zinc-400">{a.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Workstation SVG Scenes ──────────────────────────────────────────────────

function BenStation({ hover }: { hover: boolean }) {
  const c = "#f59e0b";
  return (
    <g>
      {/* Corner desk — L-shaped */}
      <rect x="0" y="80" width="200" height="14" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      <rect x="160" y="40" width="14" height="54" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Monitor */}
      <rect x="100" y="52" width="50" height="32" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="104" y="56" width="42" height="22" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      <rect x="120" y="84" width="10" height="8" rx="1" fill="#1a1a1a"/>
      {/* Coffee mug */}
      <rect x="30" y="70" width="12" height="12" rx="3" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1"/>
      <path d="M42 73 Q48 76 42 79" stroke={c} strokeWidth="1" fill="none" strokeOpacity="0.3"/>
      {/* Steam */}
      <path d="M34 66 Q36 60 38 66" stroke={c} strokeWidth="0.8" fill="none" strokeOpacity="0.3">
        <animate attributeName="d" values="M34,66 Q36,60 38,66;M34,64 Q36,58 38,64;M34,66 Q36,60 38,66" dur="3s" repeatCount="indefinite"/>
      </path>
      {/* Ben — human, leaning back, feet on desk */}
      <g transform="translate(50, -10)">
        {/* Chair */}
        <rect x="10" y="60" width="40" height="35" rx="8" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.5" strokeOpacity="0.3"/>
        {/* Body leaning back */}
        <rect x="15" y="40" width="30" height="30" rx="8" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        {/* Head */}
        <circle cx="30" cy="28" r="14" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        {/* Hair */}
        <path d="M16 24 Q18 14 30 12 Q42 14 44 24" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1"/>
        {/* Sunglasses (cool founder) */}
        <rect x="21" y="24" width="8" height="5" rx="2" fill={c} fillOpacity="0.6"/>
        <rect x="31" y="24" width="8" height="5" rx="2" fill={c} fillOpacity="0.6"/>
        <line x1="29" y1="26" x2="31" y2="26" stroke={c} strokeWidth="1"/>
        {/* Smile */}
        <path d="M24 34 Q30 38 36 34" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* Arm behind head */}
        <path d="M42 40 Q50 30 44 22" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" strokeOpacity="0.3"/>
        {/* Legs up on desk */}
        <line x1="30" y1="70" x2="90" y2="78" stroke={c} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.2"/>
        <line x1="28" y1="74" x2="88" y2="82" stroke={c} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.2"/>
        {/* Shoes on desk */}
        <ellipse cx="92" cy="76" rx="6" ry="4" fill={c} fillOpacity="0.3"/>
        <ellipse cx="90" cy="82" rx="6" ry="4" fill={c} fillOpacity="0.3"/>
      </g>
      {/* Desk lamp */}
      <g transform="translate(160, 20)">
        <line x1="0" y1="60" x2="0" y2="30" stroke="#333" strokeWidth="2"/>
        <line x1="0" y1="30" x2="-15" y2="20" stroke="#333" strokeWidth="2"/>
        <ellipse cx="-20" cy="18" rx="10" ry="5" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1" strokeOpacity="0.3"/>
        {/* Lamp glow */}
        <ellipse cx="-20" cy="40" rx="20" ry="15" fill={c} fillOpacity="0.03"/>
      </g>
    </g>
  );
}

function SamStation({ hover }: { hover: boolean }) {
  const c = "#3b82f6";
  return (
    <g>
      {/* Standing desk (slightly elevated) */}
      <rect x="20" y="85" width="160" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      <rect x="30" y="97" width="6" height="25" rx="1" fill="#1a1a1a"/>
      <rect x="164" y="97" width="6" height="25" rx="1" fill="#1a1a1a"/>
      {/* Multiple monitors — command center */}
      <rect x="40" y="52" width="45" height="35" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="44" y="56" width="37" height="25" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      <rect x="95" y="52" width="45" height="35" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="99" y="56" width="37" height="25" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      {/* Screen content — dashboards */}
      <rect x="48" y="60" width="15" height="2" rx="1" fill={c} fillOpacity="0.3"/>
      <rect x="48" y="65" width="25" height="2" rx="1" fill={c} fillOpacity="0.2"/>
      <rect x="48" y="70" width="20" height="2" rx="1" fill={c} fillOpacity="0.15"/>
      <rect x="103" y="60" width="20" height="8" rx="2" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="0.5" strokeOpacity="0.2"/>
      <rect x="103" y="72" width="12" height="2" rx="1" fill={c} fillOpacity="0.2"/>
      {/* Sam — standing, slightly larger, clipboard */}
      <g transform="translate(0, -15)">
        {/* Body */}
        <rect x="70" y="50" width="48" height="42" rx="12" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="2"/>
        {/* Head */}
        <rect x="66" y="18" width="56" height="34" rx="14" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="2"/>
        {/* Eyes */}
        <circle cx="84" cy="32" r="4" fill={c}/>
        <circle cx="104" cy="32" r="4" fill={c}/>
        {/* Confident smile */}
        <path d="M86 42 Q94 48 102 42" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Antenna — hub signal */}
        <circle cx="94" cy="14" r="3.5" fill={c} fillOpacity="0.6">
          <animate attributeName="fillOpacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <line x1="94" y1="17" x2="94" y2="18" stroke={c} strokeWidth="1.5"/>
        {/* Signal rings */}
        <circle cx="94" cy="14" r="8" fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.15">
          <animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite"/>
        </circle>
        {/* Clipboard in hand */}
        <g transform="translate(125, 55)">
          <rect x="0" y="0" width="18" height="24" rx="3" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1.5"/>
          <rect x="4" y="-3" width="10" height="5" rx="2" fill={c} fillOpacity="0.3"/>
          <line x1="4" y1="8" x2="14" y2="8" stroke={c} strokeWidth="1" strokeOpacity="0.3"/>
          <line x1="4" y1="12" x2="12" y2="12" stroke={c} strokeWidth="1" strokeOpacity="0.2"/>
          <line x1="4" y1="16" x2="10" y2="16" stroke={c} strokeWidth="1" strokeOpacity="0.15"/>
        </g>
        {/* Arms */}
        <rect x="60" y="58" width="10" height="24" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.5"/>
        <rect x="118" y="52" width="10" height="28" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.5"/>
        {/* Legs */}
        <rect x="78" y="92" width="12" height="16" rx="6" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.5"/>
        <rect x="98" y="92" width="12" height="16" rx="6" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.5"/>
      </g>
    </g>
  );
}

function CaraStation({ hover }: { hover: boolean }) {
  const c = "#a855f7";
  return (
    <g>
      {/* Desk */}
      <rect x="10" y="85" width="180" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Triple monitors — support command center */}
      <rect x="15" y="50" width="38" height="30" rx="4" fill="#111" stroke="#262626" strokeWidth="1"/>
      <rect x="16" y="52" width="36" height="24" rx="3" fill={hover ? `${c}08` : "#0a0a0a"}/>
      <rect x="60" y="45" width="50" height="38" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="64" y="49" width="42" height="28" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      <rect x="117" y="50" width="38" height="30" rx="4" fill="#111" stroke="#262626" strokeWidth="1"/>
      <rect x="118" y="52" width="36" height="24" rx="3" fill={hover ? `${c}08` : "#0a0a0a"}/>
      {/* Ticket list on screens */}
      {[0, 5, 10].map(y => (
        <g key={y}>
          <circle cx="70" cy={55 + y} r="1.5" fill="#22c55e" fillOpacity="0.5"/>
          <rect x="74" y={53.5 + y} width="20" height="2" rx="1" fill={c} fillOpacity="0.2"/>
        </g>
      ))}
      {/* Cara bot */}
      <g transform="translate(50, -10)">
        <rect x="20" y="45" width="44" height="38" rx="11" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        <rect x="16" y="16" width="52" height="30" rx="13" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
        {/* Headphones */}
        <path d="M16 30 Q16 10 42 10 Q68 10 68 30" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <rect x="8" y="24" width="12" height="14" rx="4" fill={c} fillOpacity="0.4" stroke={c} strokeWidth="1"/>
        <rect x="64" y="24" width="12" height="14" rx="4" fill={c} fillOpacity="0.4" stroke={c} strokeWidth="1"/>
        {/* Mic boom */}
        <path d="M8 34 Q0 40 6 46" stroke={c} strokeWidth="1.5" fill="none" strokeOpacity="0.5"/>
        <circle cx="6" cy="48" r="3" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1"/>
        {/* Eyes — kind */}
        <circle cx="32" cy="28" r="3" fill={c}/>
        <circle cx="52" cy="28" r="3" fill={c}/>
        {/* Friendly smile */}
        <ellipse cx="42" cy="38" rx="5" ry="2.5" fill={c} fillOpacity="0.4"/>
        {/* Arms */}
        <rect x="10" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="64" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        {/* Legs */}
        <rect x="28" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="46" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
      </g>
    </g>
  );
}

function DanaStation({ hover }: { hover: boolean }) {
  const c = "#22c55e";
  return (
    <g>
      {/* Desk */}
      <rect x="10" y="85" width="180" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Monitor */}
      <rect x="55" y="45" width="55" height="40" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="59" y="49" width="47" height="30" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      {/* Chart on screen */}
      <polyline points="65,72 73,65 81,68 89,58 97,62" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="points" values="65,72 73,65 81,68 89,58 97,62;65,70 73,62 81,66 89,55 97,58;65,72 73,65 81,68 89,58 97,62" dur="4s" repeatCount="indefinite"/>
      </polyline>
      {/* Bar chart mini */}
      <rect x="65" y="53" width="4" height="8" rx="1" fill={c} fillOpacity="0.3"/>
      <rect x="71" y="50" width="4" height="11" rx="1" fill={c} fillOpacity="0.4"/>
      <rect x="77" y="52" width="4" height="9" rx="1" fill={c} fillOpacity="0.3"/>
      {/* Scattered papers/charts on desk */}
      <rect x="20" y="72" width="25" height="16" rx="2" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" transform="rotate(-8 32 80)"/>
      <rect x="140" y="72" width="22" height="14" rx="2" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" transform="rotate(5 151 79)"/>
      {/* Magnifying glass on desk */}
      <circle cx="155" cy="76" r="6" fill="none" stroke={c} strokeWidth="1.5" strokeOpacity="0.3"/>
      <line x1="160" y1="81" x2="165" y2="86" stroke={c} strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round"/>
      {/* Dana bot */}
      <g transform="translate(50, -10)">
        <rect x="20" y="45" width="44" height="38" rx="11" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        <rect x="16" y="16" width="52" height="30" rx="13" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
        {/* Screen-like eyes */}
        <rect x="27" y="24" width="10" height="8" rx="2" fill={c} fillOpacity="0.8"/>
        <rect x="47" y="24" width="10" height="8" rx="2" fill={c} fillOpacity="0.8"/>
        <rect x="29" y="26" width="3" height="4" rx="1" fill="white" fillOpacity="0.5"/>
        <rect x="49" y="26" width="3" height="4" rx="1" fill="white" fillOpacity="0.5"/>
        {/* Mouth — data processing */}
        <rect x="36" y="38" width="12" height="3" rx="1.5" fill={c} fillOpacity="0.4"/>
        {/* Arms */}
        <rect x="10" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="64" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        {/* Legs */}
        <rect x="28" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="46" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
      </g>
    </g>
  );
}

function MilesStation({ hover }: { hover: boolean }) {
  const c = "#f97316";
  return (
    <g>
      {/* Desk */}
      <rect x="10" y="85" width="180" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Monitor */}
      <rect x="60" y="48" width="50" height="36" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="64" y="52" width="42" height="26" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      {/* Rocket poster on wall */}
      <rect x="140" y="10" width="40" height="55" rx="4" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="1" strokeOpacity="0.2"/>
      <path d="M160 20 L154 40 L160 36 L166 40 Z" fill={c} fillOpacity="0.2"/>
      <circle cx="157" cy="44" r="2" fill="#ef4444" fillOpacity="0.3"/>
      <circle cx="163" cy="44" r="2" fill={c} fillOpacity="0.3"/>
      <text x="160" y="58" textAnchor="middle" fill={c} fillOpacity="0.3" fontSize="5" fontFamily="monospace">LAUNCH</text>
      {/* Sticky notes on wall */}
      <rect x="10" y="15" width="22" height="22" rx="2" fill="#eab308" fillOpacity="0.08" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.2"/>
      <rect x="36" y="20" width="22" height="22" rx="2" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="0.5" strokeOpacity="0.2"/>
      <rect x="18" y="40" width="22" height="22" rx="2" fill="#ec4899" fillOpacity="0.08" stroke="#ec4899" strokeWidth="0.5" strokeOpacity="0.2"/>
      {/* Miles bot */}
      <g transform="translate(45, -10)">
        <rect x="20" y="45" width="44" height="38" rx="11" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        {/* Rocket on body */}
        <path d="M42 52 L38 66 L42 62 L46 66 Z" fill={c} fillOpacity="0.4">
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0" dur="1.5s" repeatCount="indefinite"/>
        </path>
        <rect x="16" y="16" width="52" height="30" rx="13" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
        {/* Excited eyes */}
        <circle cx="32" cy="28" r="4" fill={c}/>
        <circle cx="52" cy="28" r="4" fill={c}/>
        <circle cx="32" cy="28" r="2" fill="white" fillOpacity="0.6"/>
        <circle cx="52" cy="28" r="2" fill="white" fillOpacity="0.6"/>
        {/* Big grin */}
        <path d="M32 38 Q42 46 52 38" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Arms */}
        <rect x="10" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="64" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        {/* Legs */}
        <rect x="28" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="46" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
      </g>
    </g>
  );
}

function PennyStation({ hover }: { hover: boolean }) {
  const c = "#f43f5e";
  return (
    <g>
      {/* Desk */}
      <rect x="10" y="85" width="180" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Monitor */}
      <rect x="65" y="50" width="48" height="34" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="69" y="54" width="40" height="24" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      {/* Corkboard behind */}
      <rect x="5" y="5" width="80" height="60" rx="4" fill="#92400e" fillOpacity="0.06" stroke="#92400e" strokeWidth="1" strokeOpacity="0.15"/>
      {/* Pins on corkboard */}
      <circle cx="20" cy="20" r="3" fill={c} fillOpacity="0.5"/>
      <rect x="14" y="24" width="18" height="12" rx="1" fill="#3b82f6" fillOpacity="0.06" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.2"/>
      <circle cx="50" cy="15" r="3" fill="#eab308" fillOpacity="0.5"/>
      <rect x="42" y="18" width="20" height="15" rx="1" fill="#22c55e" fillOpacity="0.06" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.2"/>
      <circle cx="70" cy="22" r="3" fill="#a855f7" fillOpacity="0.5"/>
      <rect x="62" y="25" width="16" height="10" rx="1" fill={c} fillOpacity="0.06" stroke={c} strokeWidth="0.5" strokeOpacity="0.2"/>
      <circle cx="30" cy="42" r="3" fill="#f97316" fillOpacity="0.5"/>
      <rect x="22" y="45" width="22" height="14" rx="1" fill="#06b6d4" fillOpacity="0.06" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.2"/>
      {/* Neat stack of papers */}
      <rect x="140" y="72" width="20" height="3" rx="1" fill="white" fillOpacity="0.04" stroke="#333" strokeWidth="0.5"/>
      <rect x="141" y="69" width="20" height="3" rx="1" fill="white" fillOpacity="0.04" stroke="#333" strokeWidth="0.5"/>
      <rect x="140" y="66" width="20" height="3" rx="1" fill="white" fillOpacity="0.04" stroke="#333" strokeWidth="0.5"/>
      {/* Penny bot */}
      <g transform="translate(45, -10)">
        <rect x="20" y="45" width="44" height="38" rx="11" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        {/* Clipboard on body */}
        <rect x="30" y="50" width="22" height="28" rx="3" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1"/>
        <rect x="35" y="47" width="12" height="5" rx="2" fill={c} fillOpacity="0.25"/>
        <line x1="34" y1="60" x2="48" y2="60" stroke={c} strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="34" y1="65" x2="44" y2="65" stroke={c} strokeWidth="1" strokeOpacity="0.2"/>
        <line x1="34" y1="70" x2="46" y2="70" stroke={c} strokeWidth="1" strokeOpacity="0.15"/>
        <rect x="16" y="16" width="52" height="30" rx="13" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
        {/* Pin on head */}
        <circle cx="56" cy="12" r="4" fill={c} fillOpacity="0.5" stroke={c} strokeWidth="1">
          <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <line x1="56" y1="16" x2="56" y2="20" stroke={c} strokeWidth="1.5"/>
        {/* Eyes */}
        <circle cx="32" cy="28" r="3.5" fill={c}/>
        <circle cx="52" cy="28" r="3.5" fill={c}/>
        {/* Smile */}
        <path d="M35 38 Q42 42 49 38" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* Arms */}
        <rect x="10" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="64" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        {/* Legs */}
        <rect x="28" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="46" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
      </g>
    </g>
  );
}

function MiaStation({ hover }: { hover: boolean }) {
  const c = "#d946ef";
  return (
    <g>
      {/* Desk */}
      <rect x="10" y="85" width="180" height="12" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1"/>
      {/* Monitor */}
      <rect x="60" y="48" width="50" height="36" rx="5" fill="#111" stroke="#262626" strokeWidth="1.5"/>
      <rect x="64" y="52" width="42" height="26" rx="3" fill={hover ? `${c}10` : "#0a0a0a"}/>
      {/* Social media icons floating */}
      <g opacity="0.4">
        {/* TikTok icon */}
        <circle cx="150" cy="30" r="10" fill="#06b6d4" fillOpacity="0.1" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3">
          <animate attributeName="cy" values="30;26;30" dur="3s" repeatCount="indefinite"/>
        </circle>
        <text x="150" y="34" textAnchor="middle" fontSize="10">♪</text>
        {/* IG icon */}
        <circle cx="165" cy="50" r="10" fill="#ec4899" fillOpacity="0.1" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.3">
          <animate attributeName="cy" values="50;46;50" dur="3.5s" repeatCount="indefinite"/>
        </circle>
        <rect x="160" y="45" width="10" height="10" rx="3" fill="none" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.4"/>
        <circle cx="165" cy="50" r="2" fill="none" stroke="#ec4899" strokeWidth="0.8" strokeOpacity="0.4"/>
        {/* Heart */}
        <text x="140" y="62" fontSize="10" fillOpacity="0.5">
          ❤️
          <animate attributeName="y" values="62;58;62" dur="2.5s" repeatCount="indefinite"/>
        </text>
      </g>
      {/* Phone on desk */}
      <rect x="25" y="68" width="16" height="22" rx="3" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1" strokeOpacity="0.3"/>
      <rect x="28" y="72" width="10" height="14" rx="1.5" fill={c} fillOpacity="0.05"/>
      {/* Mia bot */}
      <g transform="translate(45, -10)">
        <rect x="20" y="45" width="44" height="38" rx="11" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
        {/* Phone in hand on body */}
        <rect x="32" y="50" width="16" height="24" rx="3" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1"/>
        <circle cx="40" cy="62" r="4" fill={c} fillOpacity="0.2">
          <animate attributeName="fillOpacity" values="0.15;0.35;0.15" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <polygon points="38,60 38,64 42,62" fill={c} fillOpacity="0.35"/>
        <rect x="16" y="16" width="52" height="30" rx="13" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
        {/* Signal waves */}
        <path d="M60 10 Q66 6 62 2" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.3">
          <animate attributeName="strokeOpacity" values="0.15;0.5;0.15" dur="1.5s" repeatCount="indefinite"/>
        </path>
        <path d="M64 14 Q72 8 66 2" stroke={c} strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.2">
          <animate attributeName="strokeOpacity" values="0.1;0.35;0.1" dur="1.5s" repeatCount="indefinite"/>
        </path>
        {/* Eyes */}
        <circle cx="32" cy="28" r="3.5" fill={c}/>
        <circle cx="52" cy="28" r="3.5" fill={c}/>
        {/* Wink */}
        <path d="M34 38 Q42 44 50 38" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Arms */}
        <rect x="10" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="64" y="52" width="10" height="22" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        {/* Legs */}
        <rect x="28" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
        <rect x="46" y="83" width="10" height="14" rx="5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1"/>
      </g>
    </g>
  );
}

const stationComponents: Record<string, React.FC<{ hover: boolean }>> = {
  ben: BenStation,
  sam: SamStation,
  cara: CaraStation,
  dana: DanaStation,
  miles: MilesStation,
  penny: PennyStation,
  mia: MiaStation,
};

// ─── Layout Config ───────────────────────────────────────────────────────────

const positions: { id: string; x: number; y: number }[] = [
  { id: "sam", x: 360, y: 30 },
  { id: "cara", x: 40, y: 130 },
  { id: "dana", x: 680, y: 130 },
  { id: "penny", x: 40, y: 290 },
  { id: "miles", x: 360, y: 290 },
  { id: "mia", x: 680, y: 290 },
  { id: "ben", x: 360, y: 450 },
];

// ─── Main Team Page ──────────────────────────────────────────────────────────

export default function TeamPage() {
  const activities = useActivities();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMember = selectedId ? teamMembers.find(m => m.id === selectedId) : null;

  return (
    <Shell>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">The Team</h1>
          <p className="text-sm text-zinc-500 mt-1">Your AI agent workforce — click anyone to learn more</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-zinc-500">Active today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <span className="text-xs text-zinc-500">Idle</span>
          </div>
        </div>

        {/* Office Scene */}
        <div className="rounded-2xl border border-[#262626] bg-[#0c0c0c] overflow-hidden relative">
          {/* Grid floor */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
          {/* Ceiling glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-b from-blue-500/[0.02] to-transparent rounded-full" />

          <svg viewBox="0 0 900 620" className="w-full relative z-10" style={{ minHeight: "550px" }}>
            <defs>
              <radialGradient id="teamFloorGlow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="white" stopOpacity="0.01"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="900" height="620" fill="url(#teamFloorGlow)"/>

            {positions.map(pos => {
              const member = teamMembers.find(m => m.id === pos.id);
              if (!member) return null;
              const color = agentColors[pos.id] || "#3b82f6";
              const isHovered = hoveredId === pos.id;
              const agentActivities = activities.filter(a => a.agent === pos.id);
              const todayCount = agentActivities.filter(a => Date.now() - a.createdAt < 86400000).length;
              const isActive = todayCount > 0;
              const StationComp = stationComponents[pos.id];

              return (
                <g
                  key={pos.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredId(pos.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(pos.id)}
                  className="cursor-pointer"
                >
                  {/* Station */}
                  {StationComp && <StationComp hover={isHovered} />}

                  {/* Status indicator */}
                  <circle cx="170" cy="10" r="5" fill={isActive ? "#22c55e" : "#52525b"} stroke="#0a0a0a" strokeWidth="2">
                    {isActive && <animate attributeName="fillOpacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>}
                  </circle>

                  {/* Name + role label */}
                  <text x="100" y="115" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">{member.name}</text>
                  <text x="100" y="130" textAnchor="middle" fill={color} fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif">{member.role}</text>

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect x="10" y="-30" width="180" height="32" rx="8" fill="#141414" stroke="#333" strokeWidth="1" fillOpacity="0.95"/>
                      <text x="20" y="-12" fill="white" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">
                        {member.emoji} {member.name} — {member.role}
                      </text>
                      <text x="20" y="-1" fill="#71717a" fontSize="9" fontFamily="Inter, sans-serif">
                        {isActive ? `${todayCount} actions today` : "Idle"} · Click for details
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Quick status cards below */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {positions.map(pos => {
            const member = teamMembers.find(m => m.id === pos.id);
            if (!member) return null;
            const color = agentColors[pos.id] || "#3b82f6";
            const todayCount = activities.filter(a => a.agent === pos.id && Date.now() - a.createdAt < 86400000).length;
            const lastAct = activities.find(a => a.agent === pos.id);
            return (
              <div
                key={pos.id}
                className="p-3 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all cursor-pointer"
                onClick={() => setSelectedId(pos.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: `${color}15` }}>
                    {member.emoji}
                  </div>
                  <span className="text-xs font-semibold">{member.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ml-auto ${todayCount > 0 ? "bg-green-400" : "bg-zinc-600"}`} />
                </div>
                <p className="text-[10px] text-zinc-500 truncate">
                  {lastAct?.title || "No recent activity"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMember && (
        <DetailPanel member={selectedMember} activities={activities} onClose={() => setSelectedId(null)} />
      )}
    </Shell>
  );
}
