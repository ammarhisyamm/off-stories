import { useState } from "react";
import { ModalShell } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import type { BudgetPayment } from "@/lib/types";

export function AddPaymentModal({
  remaining,
  onClose,
  onSave,
}: {
  remaining: number;
  onClose: () => void;
  onSave: (payment: BudgetPayment) => void;
}) {
  const [date] = useState(() => new Date().toISOString().slice(0, 10));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = Math.min(Number(form.get("amount")), remaining);
    if (!amount) return;
    onSave({
      id: `payment-${Date.now()}`,
      amount,
      date: (form.get("date") as string) || date,
      note: (form.get("note") as string)?.trim() || undefined,
    });
  }

  return (
    <ModalShell title="Record payment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
          Remaining on this item:{" "}
          <span className="font-medium text-foreground">Rp{remaining.toLocaleString("id-ID")}</span>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Payment amount (IDR)</span>
          <input
            name="amount"
            type="number"
            required
            min={1}
            max={remaining}
            autoFocus
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="e.g. 10000000"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Payment date</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={date}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Note (optional)</span>
          <textarea
            name="note"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="e.g. DP venue via transfer"
          />
        </label>
        <div className="flex items-center justify-end gap-2 pt-2">
          <QuietButton type="button" onClick={onClose}>
            Cancel
          </QuietButton>
          <QuietButton variant="primary" type="submit">
            Save payment
          </QuietButton>
        </div>
      </form>
    </ModalShell>
  );
}
