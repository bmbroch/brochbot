"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, FileText, Activity, Clock, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { mockActivities, mockDocuments, mockScheduledTasks, typeConfig } from "@/lib/mock-data";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const activities = mockActivities
      .filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
      .slice(0, 5);
    const documents = mockDocuments
      .filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
      .slice(0, 5);
    const tasks = mockScheduledTasks
      .filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, 5);

    return { activities, documents, tasks };
  }, [query]);

  const hasResults = results && (results.activities.length + results.documents.length + results.tasks.length > 0);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-slide-down">
          <div className="bg-surface-1 border border-border-medium rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
              <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activities, documents, tasks..."
                className="flex-1 bg-transparent text-[15px] text-white placeholder-zinc-600 outline-none"
              />
              <Dialog.Close asChild>
                <button className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-500">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!query.trim() && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-zinc-600">Start typing to search across everything...</p>
                  <div className="flex justify-center gap-2 mt-3">
                    {["revenue", "backup", "schema", "churn"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-border-subtle text-[12px] text-zinc-500 hover:text-zinc-300 hover:border-border-strong transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && !hasResults && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-zinc-500">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}

              {results && results.activities.length > 0 && (
                <ResultGroup icon={Activity} label="Activities" count={results.activities.length}>
                  {results.activities.map((a) => (
                    <ResultItem
                      key={a._id}
                      title={a.title}
                      subtitle={a.description}
                      meta={format(a.timestamp, "MMM d, h:mm a")}
                      badge={typeConfig[a.type].label}
                      badgeColor={typeConfig[a.type].color}
                    />
                  ))}
                </ResultGroup>
              )}

              {results && results.documents.length > 0 && (
                <ResultGroup icon={FileText} label="Documents" count={results.documents.length}>
                  {results.documents.map((d) => (
                    <ResultItem
                      key={d._id}
                      title={d.title}
                      subtitle={d.content}
                      meta={d.path}
                      badge={d.type}
                      badgeColor="text-zinc-400"
                    />
                  ))}
                </ResultGroup>
              )}

              {results && results.tasks.length > 0 && (
                <ResultGroup icon={Clock} label="Scheduled Tasks" count={results.tasks.length}>
                  {results.tasks.map((t) => (
                    <ResultItem
                      key={t._id}
                      title={t.name}
                      subtitle={t.description}
                      meta={t.schedule}
                      badge={t.status}
                      badgeColor="text-green-400"
                    />
                  ))}
                </ResultGroup>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border-subtle flex items-center gap-4 text-[11px] text-zinc-600">
              <span><kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border-subtle font-mono mr-1">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border-subtle font-mono mr-1">↵</kbd> Open</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border-subtle font-mono mr-1">esc</kbd> Close</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ResultGroup({ icon: Icon, label, count, children }: { icon: React.ElementType; label: string; count: number; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <div className="px-5 py-2 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
        <span className="text-[11px] text-zinc-600">({count})</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultItem({ title, subtitle, meta, badge, badgeColor }: { title: string; subtitle: string; meta: string; badge: string; badgeColor: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.04] transition-colors group text-left">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white truncate">{title}</span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.04]", badgeColor)}>{badge}</span>
        </div>
        <p className="text-[12px] text-zinc-600 truncate mt-0.5">{subtitle}</p>
      </div>
      <span className="text-[11px] text-zinc-600 flex-shrink-0">{meta}</span>
      <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
    </button>
  );
}
