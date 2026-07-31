import { useState } from "react";
import { ModalShell } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
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
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
}) {
  const [kind, setKind] = useState<Milestone["kind"]>("vendor");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave({
      id: `m${Date.now()}`,
      title: (form.get("title") as string).trim(),
      date: (form.get("date") as string) || new Date().toISOString().split("T")[0],
      kind,
      done: false,
    });
  }

  return (
    <ModalShell title="Add Milestone" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Title</span>
          <input
            name="title"
            required
            autoFocus
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
              defaultValue={new Date().toISOString().split("T")[0]}
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
        <div className="flex items-center justify-end gap-2 pt-2">
          <QuietButton type="button" onClick={onClose}>
            Cancel
          </QuietButton>
          <QuietButton variant="primary" type="submit">
            Add Milestone
          </QuietButton>
        </div>
      </form>
    </ModalShell>
  );
}
