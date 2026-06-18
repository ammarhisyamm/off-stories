import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { tasks, daysUntil, type Task } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist — Wedding Preparation" },
      { name: "description", content: "Auto-generated master checklist grouped by category and phase." },
    ],
  }),
  component: Checklist,
});

function Checklist() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filter, setFilter] = useState<string>("All");
  const categories = ["All", ...Array.from(new Set(tasks.map((t) => t.category)))];
  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.category === filter);

  return (
    <AppLayout
      eyebrow="Operational"
      title="Master checklist"
      actions={
        <>
          <div className="inline-flex rounded-md border border-border bg-surface p-0.5 text-xs">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-sm ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>List</button>
            <button onClick={() => setView("kanban")} className={`px-3 py-1.5 rounded-sm ${view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>Kanban</button>
          </div>
          <QuietButton variant="primary">Add task</QuietButton>
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <div className="panel divide-y divide-border">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["todo", "in_progress", "done"] as const).map((status) => (
            <div key={status} className="panel-muted p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="eyebrow">{status.replace("_", " ")}</div>
                <span className="text-xs text-muted-foreground">{filtered.filter((t) => t.status === status).length}</span>
              </div>
              <div className="space-y-2">
                {filtered.filter((t) => t.status === status).map((t) => (
                  <div key={t.id} className="panel p-3">
                    <div className="text-sm text-foreground">{t.title}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Pill>{t.category}</Pill>
                      <span className="text-[11px] text-muted-foreground">in {daysUntil(t.due)}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [done, setDone] = useState(task.status === "done");
  const d = daysUntil(task.due);
  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <button
        onClick={() => setDone((v) => !v)}
        aria-label="Toggle done"
        className={`h-4 w-4 rounded-sm border transition-colors ${done ? "bg-sage border-sage" : "border-border hover:border-muted-foreground"}`}
      >
        {done && <svg viewBox="0 0 16 16" className="text-primary-foreground"><path fill="currentColor" d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z"/></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {task.category}{task.assignee ? ` · ${task.assignee}` : ""}
        </div>
      </div>
      <Pill tone={task.priority === "high" ? "rose" : task.priority === "medium" ? "taupe" : "neutral"}>{task.priority}</Pill>
      <div className="text-xs text-muted-foreground w-20 text-right tabular-nums">
        {done ? "—" : `in ${d}d`}
      </div>
    </div>
  );
}
