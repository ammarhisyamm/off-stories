import { useState } from "react";
import { ModalShell, ConfirmDelete } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import { Trash } from "@phosphor-icons/react";
import type { Vendor } from "@/lib/mock-data";

const vendorCategories = [
  "Venue",
  "Catering",
  "Dekorasi",
  "Foto & Video",
  "Attire",
  "MUA",
  "Entertainment",
  "Souvenir",
  "Other",
];

export function AddVendorModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: Vendor;
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
  onDelete?: (id: string) => void;
}) {
  const [status, setStatus] = useState<Vendor["status"] | "">(initial?.status ?? "");
  const [confirming, setConfirming] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave({
      id: initial?.id ?? `v${Date.now()}`,
      name: (form.get("name") as string).trim(),
      category: (form.get("category") as string) || "Other",
      contact: (form.get("contact") as string)?.trim() || "—",
      phone: (form.get("phone") as string)?.trim() || "—",
      packageName: (form.get("packageName") as string)?.trim() || "—",
      quoted: Number(form.get("quoted")) || 0,
      final: initial?.final,
      status: (status || "researching") as Vendor["status"],
    });
  }

  return (
    <ModalShell title={initial ? "Edit Vendor" : "Add Vendor"} onClose={onClose}>
      {confirming ? (
        <ConfirmDelete
          message="Delete this vendor? This can't be undone."
          onCancel={() => setConfirming(false)}
          onConfirm={() => { if (initial) onDelete?.(initial.id); }}
        />
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Vendor name</span>
          <input
            name="name"
            required
            autoFocus
            defaultValue={initial?.name}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="e.g. Sanggar Rias Melati"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Category</span>
            <select
              name="category"
              required
              defaultValue={initial?.category ?? ""}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="" disabled>
                Select category
              </option>
              {vendorCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Status</span>
            <select
              name="status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as Vendor["status"] | "")}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="" disabled>
                Select status
              </option>
              <option value="researching">Researching</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Contact name</span>
            <input
              name="contact"
              defaultValue={initial?.contact !== "—" ? initial?.contact : ""}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="e.g. Bu Maya"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Phone</span>
            <input
              name="phone"
              defaultValue={initial?.phone !== "—" ? initial?.phone : ""}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="+62 812-…"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Package name</span>
            <input
              name="packageName"
              defaultValue={initial?.packageName !== "—" ? initial?.packageName : ""}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="e.g. Full Rias + Baju Adat"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Quoted (IDR)</span>
            <input
              name="quoted"
              type="number"
              required
              min={0}
              defaultValue={initial?.quoted}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="e.g. 15000000"
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
              {initial ? "Save Vendor" : "Add Vendor"}
            </QuietButton>
          </div>
        </div>
      </form>
      )}
    </ModalShell>
  );
}
