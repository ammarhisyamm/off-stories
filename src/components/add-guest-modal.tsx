import { useState } from "react";
import { ModalShell } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import type { Guest } from "@/lib/mock-data";

export function AddGuestModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (guest: Guest) => void;
}) {
  const [side, setSide] = useState<Guest["side"]>("Bride");
  const [rsvp, setRsvp] = useState<Guest["rsvp"]>("pending");
  const [invited, setInvited] = useState(true);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave({
      id: `g${Date.now()}`,
      name: (form.get("name") as string).trim(),
      side,
      pax: Number(form.get("pax")) || 1,
      invited,
      rsvp,
    });
  }

  return (
    <ModalShell title="Add Guest Group" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Group name</span>
          <input
            name="name"
            required
            autoFocus
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="e.g. Keluarga besar — Bride"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Side</span>
            <select
              name="side"
              value={side}
              onChange={(e) => setSide(e.target.value as Guest["side"])}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="Bride">Bride</option>
              <option value="Groom">Groom</option>
              <option value="Both">Both</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Pax</span>
            <input
              name="pax"
              type="number"
              required
              min={1}
              defaultValue={1}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Invitation</span>
            <button
              type="button"
              onClick={() => setInvited((v) => !v)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
              value={rsvp}
              onChange={(e) => setRsvp(e.target.value as Guest["rsvp"])}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="pending">Pending</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <QuietButton type="button" onClick={onClose}>
            Cancel
          </QuietButton>
          <QuietButton variant="primary" type="submit">
            Add Guest Group
          </QuietButton>
        </div>
      </form>
    </ModalShell>
  );
}
