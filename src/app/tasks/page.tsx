"use client";

import Shell from "@/components/Shell";
import { useState } from "react";
import { useTasks, priorityConfig, productConfig, agentEmojis, agentColors, type Task, type TaskStatus, type Priority, type Assignee } from "@/lib/data-provider";
import { formatRelativeDate } from "@/lib/utils";

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "#71717a" },
  { id: "in_progress", label: "In Progress", color: "#3b82f6" },
  { id: "done", label: "Done", color: "#22c55e" },
];

const statusOrder: TaskStatus[] = ["todo", "in_progress", "done"];

export default function TasksPage() {
  const allTasks = useTasks();
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showNewTask, setShowNewTask] = useState(false);

  const filtered = tasks.filter((t) => {
    if (filterAssignee !== "all" && t.assignee !== filterAssignee) return false;
    if (filterProduct !== "all" && t.product !== filterProduct) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const moveTask = (taskId: string, direction: 1 | -1) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== taskId) return t;
        const idx = statusOrder.indexOf(t.status);
        const newIdx = Math.max(0, Math.min(statusOrder.length - 1, idx + direction));
        return { ...t, status: statusOrder[newIdx], updatedAt: Date.now() };
      })
    );
  };

  const addTask = (task: Omit<Task, "_id" | "createdAt" | "updatedAt">) => {
    const now = Date.now();
    setTasks((prev) => [...prev, { ...task, _id: `t${now}`, createdAt: now, updatedAt: now }]);
    setShowNewTask(false);
  };

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage work across the team</p>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span>+</span> New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterPill label="Assignee" value={filterAssignee} onChange={setFilterAssignee} options={[
            { value: "all", label: "All" },
            ...["ben", "sam", "cara", "dana", "miles"].map(a => ({ value: a, label: `${agentEmojis[a]} ${a.charAt(0).toUpperCase() + a.slice(1)}` }))
          ]} />
          <FilterPill label="Product" value={filterProduct} onChange={setFilterProduct} options={[
            { value: "all", label: "All" }, { value: "CLCP", label: "CLCP" }, { value: "ISK", label: "ISK" }, { value: "SE", label: "SE" }
          ]} />
          <FilterPill label="Priority" value={filterPriority} onChange={setFilterPriority} options={[
            { value: "all", label: "All" }, { value: "high", label: "🔴 High" }, { value: "medium", label: "🟡 Medium" }, { value: "low", label: "⚪ Low" }
          ]} />
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="text-sm font-semibold text-zinc-300">{col.label}</h3>
                  <span className="text-xs text-zinc-600 ml-auto">{colTasks.length}</span>
                </div>
                <div className="flex-1 space-y-2 min-h-[200px]">
                  {colTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onMove={moveTask} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* New Task Modal */}
        {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} onAdd={addTask} />}
      </div>
    </Shell>
  );
}

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, dir: 1 | -1) => void }) {
  const pConf = priorityConfig[task.priority];
  const color = agentColors[task.assignee] || "#3b82f6";

  return (
    <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333] transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${pConf.bg} ${pConf.color}`}>
          {pConf.label}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ backgroundColor: `${color}15` }}
          >
            {agentEmojis[task.assignee] || "👤"}
          </div>
          {task.product && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${productConfig[task.product].bg} ${productConfig[task.product].color}`}>
              {task.product}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">{formatRelativeDate(task.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {task.status !== "todo" && (
            <button onClick={() => onMove(task._id, -1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-zinc-400 transition-colors">←</button>
          )}
          {task.status !== "done" && (
            <button onClick={() => onMove(task._id, 1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-zinc-400 transition-colors">→</button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (task: Omit<Task, "_id" | "createdAt" | "updatedAt">) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("ben");
  const [priority, setPriority] = useState<Priority>("medium");
  const [product, setProduct] = useState<string>("");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">New Task</h2>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3b82f6] transition-colors" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3b82f6] transition-colors resize-none" />
          <div className="grid grid-cols-3 gap-2">
            <select value={assignee} onChange={(e) => setAssignee(e.target.value as Assignee)} className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-2 py-2 text-sm outline-none">
              {["ben", "sam", "cara", "dana", "miles"].map((a) => <option key={a} value={a}>{agentEmojis[a]} {a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-2 py-2 text-sm outline-none">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-2 py-2 text-sm outline-none">
              <option value="">No product</option><option value="CLCP">CLCP</option><option value="ISK">ISK</option><option value="SE">SE</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-[#262626] text-zinc-400 hover:bg-white/5 transition-colors">Cancel</button>
          <button
            onClick={() => title && onAdd({ title, description: description || undefined, status: "todo", assignee, priority, product: product as any || undefined })}
            className="flex-1 py-2 text-sm rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium transition-colors"
          >Create</button>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs bg-[#141414] border border-[#262626] text-zinc-400 rounded-lg px-3 py-1.5 outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
