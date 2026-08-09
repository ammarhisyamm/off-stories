import { useState } from "react";
import { ModalShell, ConfirmDelete } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import { taskCategories } from "@/lib/types";
import { Trash } from "@phosphor-icons/react";
import type { Task, Priority } from "@/lib/types";

export function AddTaskModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (id: string) => void;
}) {
  const [priority, setPriority] = useState<Priority | "">(initial?.priority ?? "");
  const [confirming, setConfirming] = useState(false);
  const [category, setCategory] = useState<string>(
    taskCategories.includes(initial?.category ?? "")
      ? (initial?.category ?? "")
      : initial?.category
        ? "Other"
        : "",
  );
  const [customCategory, setCustomCategory] = useState(
    taskCategories.includes(initial?.category ?? "") ? "" : (initial?.category ?? ""),
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const resolvedCategory = category === "Other" ? customCategory.trim() : category;
    if (!resolvedCategory) return;
    onSave({
      id: initial?.id ?? `t${Date.now()}`,
      title: (form.get("title") as string).trim(),
      category: resolvedCategory,
      due: (form.get("due") as string) || new Date().toISOString().split("T")[0],
      priority: (priority || "medium") as Priority,
      status: initial?.status ?? "todo",
      assignee: (form.get("assignee") as string)?.trim() || undefined,
      link: (form.get("link") as string)?.trim() || undefined,
    });
  }

  return (
    <ModalShell title={initial ? "Edit Task" : "Add Task"} onClose={onClose}>
      {confirming ? (
        <ConfirmDelete
          message="Delete this task? This can't be undone."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            if (initial) onDelete?.(initial.id);
          }}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Title</span>
            <input
              name="title"
              required
              autoFocus
              defaultValue={initial?.title}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="e.g. Booking fotografer cadangan"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Category</span>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="" disabled>
                  Select category
                </option>
                {taskCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Priority</span>
              <select
                name="priority"
                required
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority | "")}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="" disabled>
                  Select priority
                </option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
          {category === "Other" && (
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Custom category name</span>
              <input
                name="customCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Transportasi"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
          )}
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Shopping link (optional)</span>
            <input
              name="link"
              type="url"
              defaultValue={initial?.link}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="https://shopee.co.id/..."
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Due date</span>
              <input
                type="date"
                name="due"
                required
                defaultValue={initial?.due}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Assignee (optional)</span>
              <input
                name="assignee"
                defaultValue={initial?.assignee}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="e.g. Andra"
              />
            </label>
          </div>
          <div className="flex items-center justify-between pt-2">
            {initial && onDelete ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors"
              >
                <Trash size={16} /> Delete
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <QuietButton type="button" onClick={onClose}>
                Cancel
              </QuietButton>
              <QuietButton variant="primary" type="submit">
                {initial ? "Save Task" : "Add Task"}
              </QuietButton>
            </div>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
