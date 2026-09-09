import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useMemo, useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddTaskModal } from "@/components/add-task-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { daysUntil, type Task } from "@/lib/types";
import { ArrowSquareOut, BellRinging, WarningCircle, X } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";

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
  component: ChecklistWrapper,
  errorComponent: ChecklistError,
});

function ChecklistError({ reset }: { reset: () => void }) {
  return (
    <AppLayout eyebrow="Operational" title="Checklist">
      <section className="panel editorial-panel mx-auto max-w-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Checklist couldn’t load</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your workspace is safe. Try loading this section again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
      </section>
    </AppLayout>
  );
}

function ChecklistWrapper() {
  return <Checklist />;
}

function Checklist() {
  const { t } = useI18n();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filter, setFilter] = useState<string>("All");
  const { data, setKind, canEdit } = useWorkspaceData();
  const tasks = useMemo(() => (Array.isArray(data.tasks) ? data.tasks : []), [data.tasks]);
  const [editing, setEditing] = useState<Task | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(tasks.map((t) => t.category)))],
    [tasks],
  );
  const filtered = useMemo(
    () => (filter === "All" ? tasks : tasks.filter((t) => t.category === filter)),
    [filter, tasks],
  );
  const reminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return tasks
      .filter((task) => task.status !== "done")
      .filter((task) => {
        const due = new Date(`${task.due}T00:00:00`);
        return due <= nextWeek;
      })
      .sort((a, b) => +new Date(a.due) - +new Date(b.due));
  }, [tasks]);

  const persist = useCallback(
    (next: Task[], opts?: { success?: string | null }) => {
      setKind("tasks", next, opts);
    },
    [setKind],
  );

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

  const handleToggle = useCallback(
    (id: string) => {
      persist(
        tasks.map((t) =>
          t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t,
        ),
        { success: null },
      );
    },
    [persist, tasks],
  );

  function openEdit(task: Task) {
    setEditing(task);
    setIsModalOpen(true);
  }

  const openView = useCallback((task: Task) => {
    setViewing(task);
  }, []);

  const overview = useMemo(() => {
    const byCategory = new Map<string, { total: number; done: number }>();
    for (const t of tasks) {
      const entry = byCategory.get(t.category) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (t.status === "done") entry.done += 1;
      byCategory.set(t.category, entry);
    }
    return Array.from(byCategory.entries());
  }, [tasks]);
  const overallTotal = overview.reduce((s, [, v]) => s + v.total, 0);
  const overallDone = overview.reduce((s, [, v]) => s + v.done, 0);

  return (
    <AppLayout
      eyebrow={t("checklist.eyebrow")}
      title={t("checklist.title")}
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          {t("checklist.addTask")}
        </QuietButton>
      }
    >
      {/* Best practice 2026: Select dropdown > horizontal scroll chips
          Chips punya masalah: overflow hidden tanpa affordance, swipe bentrok
          scroll halaman, target kecil <44px, tidak keyboard-accessible.
          Select: native picker di mobile, searchable, 44px, screen-reader. */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="category-filter" className="text-sm font-medium text-foreground">
            {t("checklist.filterCategory")}
          </label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger id="category-filter" className="w-[200px] bg-white">
              <SelectValue placeholder={t("checklist.filterCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => {
                const count =
                  c === "All" ? tasks.length : tasks.filter((t) => t.category === c).length;
                const label = c === "All" ? t("checklist.all") : c;
                return (
                  <SelectItem key={c} value={c}>
                    {label} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {filter !== "All" && (
            <button
              type="button"
              onClick={() => setFilter("All")}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("checklist.reset")}
            >
              <X size={14} /> {t("checklist.reset")}
            </button>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} {t("checklist.of")} {tasks.length} {t("checklist.tasks")}
        </span>
      </div>

      {reminders.length > 0 && (
        <section className="panel mb-6 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <BellRinging size={20} className="text-[color:var(--taupe)]" weight="duotone" />
            <div>
              <div className="eyebrow">Deadline reminders</div>
              <h2 className="serif mt-1 text-lg">
                {reminders.length} task{reminders.length === 1 ? "" : "s"} need attention
              </h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {reminders.slice(0, 5).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => openView(task)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <WarningCircle size={16} className="shrink-0 text-destructive" weight="fill" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {task.title}
                </span>
                <Pill tone="warn">{deadlineLabel(task.due)}</Pill>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mb-6 inline-flex rounded-md border border-border bg-surface p-0.5">
        <button
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
          className={`px-3 py-1 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
        >
          List
        </button>
        <button
          onClick={() => setView("kanban")}
          aria-pressed={view === "kanban"}
          className={`px-3 py-1 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
        >
          Kanban
        </button>
      </div>

      <div className="panel p-5 mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="eyebrow">Progress overview</div>
            <h2 className="serif mt-1 text-xl">
              {overallDone} of {overallTotal} tasks
            </h2>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {overallTotal ? Math.round((overallDone / overallTotal) * 100) : 0}% complete
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-sage transition-[width] duration-500"
            style={{ width: `${overallTotal ? (overallDone / overallTotal) * 100 : 0}%` }}
          />
        </div>
        {overview.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {overview.map(([cat, stats]) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-xl border p-3 text-left transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
                  filter === cat ? "border-primary/60 bg-surface-2" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-medium text-foreground">{cat}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {stats.done}/{stats.total}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-sage transition-[width] duration-500"
                    style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "list" ? (
        <div className="panel divide-y divide-border">
          {filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={handleToggle}
              onEdit={openView}
              canEdit={canEdit}
            />
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

const TaskRow = memo(function TaskRow({
  task,
  onToggle,
  onEdit,
  canEdit = true,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  canEdit?: boolean;
}) {
  const done = task.status === "done";
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
        disabled={!canEdit}
        className={`-m-2 p-2 rounded-md transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90 ${canEdit ? "" : "cursor-not-allowed opacity-50"}`}
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
      {task.link && (
        <a
          href={task.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Shop <ArrowSquareOut size={12} />
        </a>
      )}
      <Pill
        tone={task.priority === "high" ? "rose" : task.priority === "medium" ? "taupe" : "neutral"}
      >
        {task.priority}
      </Pill>
      <div className="text-xs text-muted-foreground w-20 text-right tabular-nums">
        {done ? "—" : deadlineLabel(task.due)}
      </div>
    </div>
  );
});

function deadlineLabel(due: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${due}T00:00:00`);
  const difference = Math.round((dueDate.getTime() - today.getTime()) / 86400000);

  if (difference < 0) return `${Math.abs(difference)}d overdue`;
  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  return `in ${difference}d`;
}
