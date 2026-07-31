import { useState } from "react";
import { ModalShell } from "@/components/modal-shell";
import { QuietButton } from "@/components/app-layout";
import type { BudgetItem } from "@/lib/mock-data";

const budgetCategories = [
  "Venue",
  "Catering",
  "Dekorasi",
  "Foto & Video",
  "Attire",
  "MUA",
  "Entertainment",
  "Souvenir",
  "Legal",
  "Other",
];

export function AddExpenseModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (item: BudgetItem) => void;
}) {
  const [status, setStatus] = useState<BudgetItem["status"]>("partial");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = Number(form.get("amount"));
    const paid = Math.min(Number(form.get("paid") ?? 0) || 0, amount);
    onSave({
      id: `b${Date.now()}`,
      category: (form.get("category") as string) || "Other",
      vendor: (form.get("vendor") as string)?.trim() || undefined,
      amount,
      paid,
      committed: amount,
      status,
      dueDate: (form.get("dueDate") as string) || undefined,
    });
  }

  return (
    <ModalShell title="Add Expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Category</span>
          <select
            name="category"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            {budgetCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Vendor (optional)</span>
          <input
            name="vendor"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="e.g. Padma Hall"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Amount (IDR)</span>
            <input
              name="amount"
              type="number"
              required
              min={1}
              autoFocus
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="e.g. 25000000"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Paid so far (IDR)</span>
            <input
              name="paid"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="0"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Status</span>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BudgetItem["status"])}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="due">Due</option>
              <option value="planned">Planned</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Due date (optional)</span>
            <input
              type="date"
              name="dueDate"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <QuietButton type="button" onClick={onClose}>
            Cancel
          </QuietButton>
          <QuietButton variant="primary" type="submit">
            Add Expense
          </QuietButton>
        </div>
      </form>
    </ModalShell>
  );
}
