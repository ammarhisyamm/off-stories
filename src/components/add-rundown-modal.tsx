import { ModalShell, ConfirmDelete } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import type { RundownItem } from "@/lib/types";
import { Trash } from "@phosphor-icons/react";
import { useState } from "react";

export function AddRundownModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: RundownItem;
  onClose: () => void;
  onSave: (item: RundownItem) => void;
  onDelete?: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave({
      id: initial?.id ?? `rundown-${Date.now()}`,
      time: (form.get("time") as string) || "08:00",
      title: (form.get("title") as string).trim(),
      location: (form.get("location") as string)?.trim() || undefined,
      pic: (form.get("pic") as string)?.trim() || undefined,
      notes: (form.get("notes") as string)?.trim() || undefined,
      status: initial?.status ?? "planned",
    });
  }

  return (
    <ModalShell title={initial ? "Edit rundown item" : "Add rundown item"} onClose={onClose}>
      {confirming ? (
        <ConfirmDelete
          message="Delete this rundown item? This can't be undone."
          onCancel={() => setConfirming(false)}
          onConfirm={() => initial && onDelete?.(initial.id)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Time</span>
              <input
                name="time"
                type="time"
                required
                defaultValue={initial?.time ?? "08:00"}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">PIC</span>
              <input
                name="pic"
                defaultValue={initial?.pic}
                placeholder="e.g. Andra"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Agenda</span>
            <input
              name="title"
              required
              autoFocus={!initial}
              defaultValue={initial?.title}
              placeholder="e.g. Akad nikah"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Location (optional)</span>
            <input
              name="location"
              defaultValue={initial?.location}
              placeholder="e.g. Main hall"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Notes (optional)</span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={initial?.notes}
              placeholder="Vendor arrival, family cue, or equipment notes"
              className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
          <div className="flex items-center justify-between pt-2">
            {initial && onDelete ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
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
                {initial ? "Save item" : "Add item"}
              </QuietButton>
            </div>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
