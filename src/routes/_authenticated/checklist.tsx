import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddTaskModal } from "@/components/add-task-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { daysUntil, type Task } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist — Wedding Preparation" },
      {
        name: "description",
        content: "Auto-generated master checklist grouped by category and phase.",
      },
    ],
  }),
  component: Checklist,
});

function Checklist() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filter, setFilter] = useState<string>("All");
  const { data, setKind } = useWorkspaceData();
  const tasks = data.tasks as Task[];
  const [editing, setEditing] = useState<Task | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = ["All", ...Array.from(new Set(tasks.map((t) => t.category)))];
  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.category === filter);

  function persist(next: Task[], opts?: { success?: string | null }) {
    setKind("tasks", next, opts);
  }

  function handleSave(task: Task) {
    const exists = tasks.some((t) => t.id === task.id);
    persist(exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [task, ...tasks]);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    persist(
      tasks.filter((t) => t.id !== id),
      { success: "Task deleted" },
    );
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleToggle(id: string) {
    persist(
      tasks.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t)),
      { success: null },
    );
  }

  function openEdit(task: Task) {
    setEditing(task);
    setIsModalOpen(true);
  }

  function openView(task: Task) {
    setViewing(task);
  }

  return (
    <AppLayout
      eyebrow="Operational"
      title="Master checklist"
      actions={
        <>
          <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              Kanban
            </button>
          </div>
          <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
            Add task
          </QuietButton>
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs px-3 py-2 rounded-full border transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${
              filter === c
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <div className="panel divide-y divide-border">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={handleToggle} onEdit={openView} />
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No tasks in this category yet.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["todo", "in_progress", "done"] as const).map((status) => (
            <div key={status} className="panel-muted p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="eyebrow">{status.replace("_", " ")}</div>
                <span className="text-xs text-muted-foreground">
                  {filtered.filter((t) => t.status === status).length}
                </span>
              </div>
              <div className="space-y-2">
                {filtered
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openView(t)}
                      className="w-full text-left panel p-3 transition duration-150 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                    >
                      <div className="text-sm text-foreground">{t.title}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Pill>{t.category}</Pill>
                        <span className="text-xs text-muted-foreground">
                          in {daysUntil(t.due)}d
                        </span>
                      </div>
                    </button>
                  ))}
                {filtered.filter((t) => t.status === status).length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">Nothing here.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {viewing && (
        <ViewModal
          title="Task details"
          onClose={() => setViewing(null)}
          onDelete={() => handleDelete(viewing.id)}
          onEdit={() => {
            const t = viewing;
            setViewing(null);
            openEdit(t);
          }}
          badge={
            <Pill
              tone={
                viewing.priority === "high"
                  ? "rose"
                  : viewing.priority === "medium"
                    ? "taupe"
                    : "neutral"
              }
            >
              {viewing.priority}
            </Pill>
          }
        >
          <Detail label="Title" value={viewing.title} />
          <DetailGrid>
            <Detail label="Category" value={viewing.category} />
            <Detail
              label="Due"
              value={new Date(viewing.due).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Detail label="Assignee" value={viewing.assignee ?? "Unassigned"} />
            <Detail label="Status" value={viewing.status.replace("_", " ")} />
          </DetailGrid>
        </ViewModal>
      )}
      {isModalOpen && (
        <AddTaskModal
          initial={editing ?? undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </AppLayout>
  );
}

function TaskRow({
  task,
  onToggle,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  const done = task.status === "done";
  const d = daysUntil(task.due);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(task);
        }
      }}
      className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-2/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className={`-m-2 p-2 rounded-md transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90`}
      >
        <span
          className={`h-4 w-4 grid place-items-center rounded-sm border ${
            done ? "bg-sage border-sage" : "border-border hover:border-muted-foreground"
          }`}
        >
          {done && (
            <svg viewBox="0 0 16 16" className="text-primary-foreground">
              <path fill="currentColor" d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z" />
            </svg>
          )}
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm truncate ${done ? "text-muted-foreground line-through" : "text-foreground"}`}
        >
          {task.title}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {task.category}
          {task.assignee ? ` · ${task.assignee}` : ""}
        </div>
      </div>
      <Pill
        tone={task.priority === "high" ? "rose" : task.priority === "medium" ? "taupe" : "neutral"}
      >
        {task.priority}
      </Pill>
      <div className="text-xs text-muted-foreground w-20 text-right tabular-nums">
        {done ? "—" : `in ${d}d`}
      </div>
    </div>
  );
}
