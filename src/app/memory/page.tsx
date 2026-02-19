"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useDocuments, type MemoryDocument } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  memory: { label: "Daily Notes", color: "text-blue-400", bg: "bg-blue-500/10", icon: "📅" },
  note: { label: "Notes", color: "text-purple-400", bg: "bg-purple-500/10", icon: "📝" },
  config: { label: "Config", color: "text-orange-400", bg: "bg-orange-500/10", icon: "⚙️" },
  schema: { label: "Schema", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "🗃️" },
};

export default function MemoryPage() {
  const documents = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<MemoryDocument | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = documents.filter((d) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || d.path.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by type
  const groups: Record<string, MemoryDocument[]> = {};
  filtered.forEach((d) => {
    const key = d.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Memory</h1>
          <p className="text-sm text-zinc-500 mt-1">All knowledge and documentation</p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all memories..."
              className="w-full bg-[#141414] border border-[#262626] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>
          <div className="flex gap-1">
            {["all", "memory", "config", "schema"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  filterType === t
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                }`}
              >
                {t === "all" ? "All" : typeConfig[t]?.label || t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document list */}
          <div className="space-y-6">
            {Object.entries(groups).map(([type, docs]) => {
              const conf = typeConfig[type] || typeConfig.memory;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <span>{conf.icon}</span>
                    <h3 className="text-sm font-semibold text-zinc-300">{conf.label}</h3>
                    <span className="text-xs text-zinc-600">{docs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <button
                        key={doc._id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                          selectedDoc?._id === doc._id
                            ? "bg-[#141414] border-[#3b82f6]/50"
                            : "bg-[#141414] border-[#262626] hover:border-[#333]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium">{doc.title}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>{conf.label}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1 font-mono">{doc.path}</p>
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{doc.content.replace(/[#\n*`]/g, " ").trim()}</p>
                        <p className="text-[10px] text-zinc-600 mt-2">{formatRelativeDate(doc.updatedAt)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview pane — desktop inline, mobile bottom sheet */}
          <div className="hidden lg:block lg:sticky lg:top-6">
            {selectedDoc ? (
              <div className="rounded-xl bg-[#141414] border border-[#262626] p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{selectedDoc.title}</h2>
                  <button onClick={() => setSelectedDoc(null)} className="text-zinc-500 hover:text-white text-sm">✕</button>
                </div>
                <p className="text-xs text-zinc-600 font-mono mb-4">{selectedDoc.path}</p>
                <div className="prose prose-invert prose-sm max-w-none">
                  {selectedDoc.content.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
                    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-zinc-200 mt-3 mb-2">{line.slice(3)}</h2>;
                    if (line.startsWith("- ")) return <div key={i} className="flex gap-2 text-sm text-zinc-400 mb-1"><span className="text-zinc-600">•</span><span>{line.slice(2)}</span></div>;
                    if (line.trim() === "") return <div key={i} className="h-2" />;
                    return <p key={i} className="text-sm text-zinc-400 mb-1">{line}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#141414] border border-[#262626] p-12 text-center">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-sm text-zinc-500">Select a document to preview</p>
              </div>
            )}
          </div>

          {/* Mobile bottom sheet preview */}
          {selectedDoc && (
            <div className="lg:hidden fixed inset-0 z-[100]" onClick={() => setSelectedDoc(null)}>
              <div className="absolute inset-0 bg-black/60" />
              <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-[#141414] border-t border-[#262626] rounded-t-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-zinc-700" />
                </div>
                <div className="flex items-center justify-between px-4 pb-3 border-b border-[#262626]">
                  <h2 className="text-base font-semibold truncate">{selectedDoc.title}</h2>
                  <button onClick={() => setSelectedDoc(null)} className="text-zinc-500 hover:text-white text-sm p-2">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <p className="text-xs text-zinc-600 font-mono mb-4">{selectedDoc.path}</p>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {selectedDoc.content.split("\n").map((line, i) => {
                      if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
                      if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-zinc-200 mt-3 mb-2">{line.slice(3)}</h2>;
                      if (line.startsWith("- ")) return <div key={i} className="flex gap-2 text-sm text-zinc-400 mb-1"><span className="text-zinc-600">•</span><span>{line.slice(2)}</span></div>;
                      if (line.trim() === "") return <div key={i} className="h-2" />;
                      return <p key={i} className="text-sm text-zinc-400 mb-1">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
