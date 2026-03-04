"use client";

import { useEffect, useState } from "react";

const CORAL = "#FF5A5F";

const SOUL_SNIPPET = `# SOUL.md — Who I Am

I'm Dana 📊 — your data analyst.
Not a dashboard. An actual analyst.

## Rule Zero: Own the numbers
Before any report: pull fresh data.
Lead with the insight, not the method.

## Core Style
- If revenue dropped, say it dropped.
- Have opinions. No "it depends."
- Call problems before being asked.

## Tone
Dry wit. Direct. Never hedges.
Think: Bloomberg terminal with a personality.`;

const MEMORY_SNIPPET = `# MEMORY.md — Long-Term Memory

## Key Numbers (as of Mar 3, 2026)
- ISK: 403 active subs, ~$2.5K/week
- CLCP: 276 active subs, ~$1.1K/week
- SE: 238 active subs, ~$1.3K/week

## Lessons Learned
- GSC connects via service account
- Supabase keys: read-only discipline
- ISK IO issue: transcripts not batched

## Ben's Preferences
- Prefers agents with human names
- Cares deeply about UI/design
- Timezone: Africa/Windhoek (CAT)`;

export default function SlideH() {
  const [visible, setVisible] = useState(false);
  const [typedSoul, setTypedSoul] = useState("");
  const [typedMemory, setTypedMemory] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedSoul(SOUL_SNIPPET.slice(0, i));
      i++;
      if (i > SOUL_SNIPPET.length) clearInterval(interval);
    }, 14);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const delay = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setTypedMemory(MEMORY_SNIPPET.slice(0, i));
        i++;
        if (i > MEMORY_SNIPPET.length) clearInterval(interval);
      }, 12);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(delay);
  }, [visible]);

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-4">
      {/* Heading */}
      <div
        className="text-center flex-shrink-0"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">It thinks like a person</h2>
        <p className="mt-1 text-lg text-gray-400 font-medium">Two files that make your agent feel real.</p>
      </div>

      {/* Two-column: snippets */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* SOUL.md */}
        <div
          className="flex-1 flex flex-col gap-2"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.4s ease, transform 0.4s ease", transitionDelay: "120ms" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: `${CORAL}18` }}>📜</div>
            <div>
              <div className="text-sm font-bold text-gray-900">SOUL.md</div>
              <div className="text-xs text-gray-400">defines who the agent is</div>
            </div>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${CORAL}14`, color: CORAL }}>
              personality · voice · rules
            </span>
          </div>
          {/* Terminal */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-md" style={{ background: "#0d1117", border: "1px solid #30363d" }}>
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: "#30363d", background: "#161b22" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F56" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#27C93F" }} />
              <span className="ml-2 text-xs text-gray-500 font-mono">SOUL.md</span>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-hidden" style={{ color: "#e6edf3", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {typedSoul.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <span key={i} style={{ color: CORAL }}>{line}{"\n"}</span>;
                if (line.startsWith("## ")) return <span key={i} style={{ color: "#79c0ff" }}>{line}{"\n"}</span>;
                if (line.startsWith("- ")) return <span key={i} style={{ color: "#a5f3a5" }}>{line}{"\n"}</span>;
                return <span key={i} style={{ color: "#8b949e" }}>{line}{"\n"}</span>;
              })}
              <span className="inline-block w-1.5 h-3.5 align-middle" style={{ background: CORAL, animation: "blink 1s step-end infinite" }} />
            </pre>
          </div>
        </div>

        {/* MEMORY.md */}
        <div
          className="flex-1 flex flex-col gap-2"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.4s ease, transform 0.4s ease", transitionDelay: "250ms" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: "#6366f115" }}>🧠</div>
            <div>
              <div className="text-sm font-bold text-gray-900">MEMORY.md</div>
              <div className="text-xs text-gray-400">survives session restarts</div>
            </div>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#6366f114", color: "#6366f1" }}>
              long-term · curated · searchable
            </span>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden shadow-md" style={{ background: "#0d1117", border: "1px solid #30363d" }}>
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: "#30363d", background: "#161b22" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F56" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#27C93F" }} />
              <span className="ml-2 text-xs text-gray-500 font-mono">MEMORY.md</span>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-hidden" style={{ color: "#e6edf3", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {typedMemory.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <span key={i} style={{ color: "#6366f1" }}>{line}{"\n"}</span>;
                if (line.startsWith("## ")) return <span key={i} style={{ color: "#79c0ff" }}>{line}{"\n"}</span>;
                if (line.startsWith("- ")) return <span key={i} style={{ color: "#a5f3a5" }}>{line}{"\n"}</span>;
                return <span key={i} style={{ color: "#8b949e" }}>{line}{"\n"}</span>;
              })}
              <span className="inline-block w-1.5 h-3.5 align-middle" style={{ background: "#6366f1", animation: "blink 1s step-end infinite" }} />
            </pre>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
