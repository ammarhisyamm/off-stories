import { useState } from "react";
import { ModalShell } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import { Trash } from "@phosphor-icons/react";
import type { Milestone } from "@/lib/mock-data";

const milestoneKinds: Milestone["kind"][] = [
  "venue",
  "vendor",
  "fitting",
  "legal",
  "payment",
  "review",
];

export function AddMilestoneModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: Milestone;
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
  onDelete?: (id: string) => void;
}) {
  const [kind, setKind] = useState<Milestone["kind"]>(initial?.kind ?? "vendor");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave({
      id: initial?.id ?? `m${Date.now()}`,
      title: (form.get("title") as string).trim(),
      date: (form.get("date") as string) || new Date().toISOString().split("T")[0],
      kind,
      done: initial?.done ?? false,
    });
  }

  return (
    <ModalShell title={initial ? "Edit Milestone" : "Add Milestone"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Title</span>
          <input
            name="title"
            required
            autoFocus
            defaultValue={initial?.title}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="e.g. Pelunasan catering"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Date</span>
            <input
              type="date"
              name="date"
              required
              defaultValue={initial?.date ?? new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Kind</span>
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as Milestone["kind"])}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              {milestoneKinds.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between pt-2">
          {initial && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(initial.id)}
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
              {initial ? "Save Milestone" : "Add Milestone"}
            </QuietButton>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
