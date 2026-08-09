import { useState } from "react";
import { ModalShell, ConfirmDelete } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import { Trash } from "@phosphor-icons/react";
import type { Guest } from "@/lib/types";

export function AddGuestModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: Guest;
  onClose: () => void;
  onSave: (guest: Guest) => void;
  onDelete?: (id: string) => void;
}) {
  const [side, setSide] = useState<Guest["side"] | "">(initial?.side ?? "");
  const [rsvp, setRsvp] = useState<Guest["rsvp"] | "">(initial?.rsvp ?? "");
  const [invited, setInvited] = useState(initial?.invited ?? false);
  const [confirming, setConfirming] = useState(false);
  const [mode, setMode] = useState<"single" | "group">(
    (initial?.pax ?? 1) > 1 ? "group" : "single",
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave({
      id: initial?.id ?? `g${Date.now()}`,
      name: (form.get("name") as string).trim(),
      side: (side || "Bride") as Guest["side"],
      pax: mode === "group" ? Number(form.get("pax")) || 1 : 1,
      invited,
      rsvp: (rsvp || "pending") as Guest["rsvp"],
      phone: (form.get("phone") as string)?.trim() || undefined,
      email: (form.get("email") as string)?.trim() || undefined,
      checkedIn: initial?.checkedIn ?? false,
    });
  }

  return (
    <ModalShell title={initial ? "Edit Guest" : "Add Guest"} onClose={onClose}>
      {confirming ? (
        <ConfirmDelete
          message="Delete this guest? This can't be undone."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            if (initial) onDelete?.(initial.id);
          }}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 rounded-md border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setMode("single")}
              aria-pressed={mode === "single"}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === "single" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              Single guest
            </button>
            <button
              type="button"
              onClick={() => setMode("group")}
              aria-pressed={mode === "group"}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === "group" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              Family / group
            </button>
          </div>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">
              {mode === "group" ? "Group name" : "Full name"}
            </span>
            <input
              name="name"
              required
              autoFocus
              defaultValue={initial?.name}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder={mode === "group" ? "e.g. Keluarga Rahardjo" : "e.g. Nyi Hasanah"}
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">WhatsApp / phone (optional)</span>
              <input
                name="phone"
                type="tel"
                defaultValue={initial?.phone}
                placeholder="e.g. 0812 3456 7890"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Side</span>
              <select
                name="side"
                required
                value={side}
                onChange={(e) => setSide(e.target.value as Guest["side"] | "")}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="" disabled>
                  Select side
                </option>
                <option value="Bride">Bride</option>
                <option value="Groom">Groom</option>
                <option value="Both">Both</option>
              </select>
            </label>
          </div>
          {mode === "group" && (
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Number of guests</span>
              <input
                name="pax"
                type="number"
                min={2}
                defaultValue={initial?.pax ?? 2}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">Invitation</span>
              <button
                type="button"
                onClick={() => setInvited((v) => !v)}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <span>{invited ? "Sent" : "Draft"}</span>
                <span
                  className={`h-4 w-4 rounded-sm border grid place-items-center ${invited ? "bg-sage border-sage" : "border-border"}`}
                >
                  {invited && (
                    <svg viewBox="0 0 16 16" className="text-primary-foreground">
                      <path fill="currentColor" d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z" />
                    </svg>
                  )}
                </span>
              </button>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">RSVP</span>
              <select
                name="rsvp"
                required
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value as Guest["rsvp"] | "")}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="" disabled>
                  Select RSVP
                </option>
                <option value="pending">Pending</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
              </select>
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
                {initial ? "Save Guest" : "Add Guest"}
              </QuietButton>
            </div>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
