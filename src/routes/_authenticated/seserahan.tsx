import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowSquareOut, ShoppingBag } from "@phosphor-icons/react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { ModalShell } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import {
  formatIDR,
  type BudgetItem,
  type Payer,
  type SeserahanItem,
  type SeserahanStatus,
} from "@/lib/types";
import { payerLabels } from "@/lib/onboarding";

export const Route = createFileRoute("/_authenticated/seserahan")({
  head: () => ({
    meta: [
      { title: "Seserahan — Wedding Preparation" },
      { name: "description", content: "Track Indonesian seserahan items, purchases, and budget." },
    ],
  }),
  component: Seserahan,
});

const statusLabels: Record<SeserahanStatus, string> = {
  to_buy: "Belum dibeli",
  bought: "Sudah dibeli",
  wrapped: "Sudah dihias",
  ready: "Siap dibawa",
};

function Seserahan() {
  const { data, setKind } = useWorkspaceData();
  const items = data.seserahan;
  const [editing, setEditing] = useState<SeserahanItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const estimated = items.reduce((sum, item) => sum + item.estimatedCost * item.quantity, 0);
  const actual = items.reduce((sum, item) => sum + item.actualCost * item.quantity, 0);
  const ready = items.filter((item) => item.status === "ready").length;

  function saveItem(item: SeserahanItem) {
    const next = items.some((current) => current.id === item.id)
      ? items.map((current) => (current.id === item.id ? item : current))
      : [item, ...items];
    setKind("seserahan", next);
    setModalOpen(false);
    setEditing(null);
  }

  function syncToBudget() {
    const existing = data.budget.find((item) => item.id === "seserahan-budget");
    const synced: BudgetItem = {
      id: "seserahan-budget",
      category: "Seserahan",
      vendor: "Seserahan tracker",
      amount: actual,
      paid: actual,
      committed: actual,
      status: actual > 0 ? "paid" : "planned",
      payer: "shared",
      payments: existing?.payments,
    };
    const budget = existing
      ? data.budget.map((item) => (item.id === synced.id ? synced : item))
      : [synced, ...data.budget];
    setKind("budget", budget, { success: "Seserahan synced to budget" });
  }

  return (
    <AppLayout
      eyebrow="Preparation"
      title="Seserahan tracker"
      actions={
        <QuietButton variant="primary" onClick={() => setModalOpen(true)}>
          Add item
        </QuietButton>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <Stat label="Items ready" value={`${ready} / ${items.length}`} />
        <Stat label="Estimated" value={formatIDR(estimated)} />
        <Stat label="Actual spent" value={formatIDR(actual)} />
      </div>

      <section className="panel mb-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow">Buy thoughtfully</div>
            <h2 className="serif mt-1 text-xl">A calm list for every box.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Track common Indonesian seserahan items one by one, assign a person, and keep actual
              purchases visible in your main budget.
            </p>
          </div>
          <QuietButton type="button" onClick={syncToBudget} disabled={items.length === 0}>
            Sync actual to budget
          </QuietButton>
        </div>
      </section>

      <div className="panel overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={20} />}
            title="No seserahan items yet"
            description="Start with a common item, then customize the list for your family tradition."
            action={
              <QuietButton variant="primary" onClick={() => setModalOpen(true)}>
                Add first item
              </QuietButton>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveItem({ ...item, status: nextStatus(item.status) })}
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs transition-colors ${item.status === "ready" ? "border-sage bg-sage text-white" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                      aria-label={`Update status for ${item.name}`}
                    >
                      {item.status === "ready" ? "✓" : item.quantity}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      className="truncate text-left text-sm font-medium text-foreground hover:text-primary"
                    >
                      {item.name}
                    </button>
                    <Pill>{statusLabels[item.status]}</Pill>
                  </div>
                  <div className="mt-1 pl-9 text-xs text-muted-foreground">
                    {item.category} · {item.assignedTo || "Belum ada PIC"} · {item.quantity} item
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-9 sm:pl-0">
                  <div className="text-right text-xs tabular-nums">
                    <div className="text-foreground">
                      {formatIDR(item.actualCost || item.estimatedCost)}
                    </div>
                    <div className="text-muted-foreground">
                      {item.actualCost ? "actual" : "estimate"}
                    </div>
                  </div>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      Shop <ArrowSquareOut size={12} />
                    </a>
                  )}
                  <QuietButton
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </QuietButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <SeserahanModal
          initial={editing ?? undefined}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={saveItem}
        />
      )}
    </AppLayout>
  );
}

function nextStatus(status: SeserahanStatus): SeserahanStatus {
  const sequence: SeserahanStatus[] = ["to_buy", "bought", "wrapped", "ready"];
  return sequence[(sequence.indexOf(status) + 1) % sequence.length];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <div className="eyebrow">{label}</div>
      <div className="serif mt-2 text-2xl tabular-nums">{value}</div>
    </div>
  );
}

function SeserahanModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: SeserahanItem;
  onClose: () => void;
  onSave: (item: SeserahanItem) => void;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      id: initial?.id ?? `seserahan-${Date.now()}`,
      name: String(form.get("name") || "Seserahan item").trim(),
      category: String(form.get("category") || "Other"),
      quantity: Math.max(1, Number(form.get("quantity")) || 1),
      estimatedCost: Math.max(0, Number(form.get("estimatedCost")) || 0),
      actualCost: Math.max(0, Number(form.get("actualCost")) || 0),
      status: (form.get("status") as SeserahanStatus) || "to_buy",
      payer: (form.get("payer") as Payer) || "shared",
      assignedTo: String(form.get("assignedTo") || "").trim() || undefined,
      link: String(form.get("link") || "").trim() || undefined,
      notes: String(form.get("notes") || "").trim() || undefined,
    });
  }

  return (
    <ModalShell title={initial ? "Edit seserahan item" : "Add seserahan item"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Item name *</span>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="e.g. Alat ibadah"
            className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Category</span>
            <input
              name="category"
              defaultValue={initial?.category}
              placeholder="e.g. Perawatan"
              className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Quantity</span>
            <input
              name="quantity"
              type="number"
              min={1}
              defaultValue={initial?.quantity ?? 1}
              className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Estimated cost</span>
            <input
              name="estimatedCost"
              type="number"
              min={0}
              defaultValue={initial?.estimatedCost || ""}
              placeholder="0"
              className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Actual cost</span>
            <input
              name="actualCost"
              type="number"
              min={0}
              defaultValue={initial?.actualCost || ""}
              placeholder="0"
              className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Status</span>
            <select
              name="status"
              defaultValue={initial?.status ?? "to_buy"}
              className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Paid by</span>
            <select
              name="payer"
              defaultValue={initial?.payer ?? "shared"}
              className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            >
              {Object.entries(payerLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">PIC (optional)</span>
          <input
            name="assignedTo"
            defaultValue={initial?.assignedTo}
            placeholder="e.g. Kirana"
            className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Shopping link (optional)</span>
          <input
            name="link"
            type="url"
            defaultValue={initial?.link}
            placeholder="https://shopee.co.id/..."
            className="w-full border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Notes (optional)</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={initial?.notes}
            className="w-full resize-none border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <QuietButton type="button" onClick={onClose}>
            Cancel
          </QuietButton>
          <QuietButton variant="primary" type="submit">
            Save item
          </QuietButton>
        </div>
      </form>
    </ModalShell>
  );
}
