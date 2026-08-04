import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddPaymentModal } from "@/components/add-payment-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { formatIDR, type BudgetItem, type BudgetPayment } from "@/lib/types";
import { CurrencyDollar } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Wedding Preparation" },
      {
        name: "description",
        content: "Track total budget, committed spend, payments, and remaining headroom.",
      },
    ],
  }),
  component: Budget,
});

function Budget() {
  const { data, setKind } = useWorkspaceData();
  const items = data.budget as BudgetItem[];
  const wedding = data.event;
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [viewing, setViewing] = useState<BudgetItem | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<BudgetItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const total = wedding.budget;
  const paid = items.reduce((s, b) => s + b.paid, 0);
  const committed = items.reduce((s, b) => s + b.committed, 0);
  const remaining = total - committed;
  const committedPct = total ? Math.round((committed / total) * 100) : 0;
  const paidPct = total ? (paid / total) * 100 : 0;
  const committedPendingPct = total ? ((committed - paid) / total) * 100 : 0;

  function handleSave(item: BudgetItem) {
    const exists = items.some((i) => i.id === item.id);
    const next = exists ? items.map((i) => (i.id === item.id ? item : i)) : [item, ...items];
    setKind("budget", next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    setKind(
      "budget",
      items.filter((i) => i.id !== id),
      { success: "Budget item deleted" },
    );
    setIsModalOpen(false);
    setEditing(null);
  }

  function openEdit(item: BudgetItem) {
    setEditing(item);
    setIsModalOpen(true);
  }

  function openView(item: BudgetItem) {
    setViewing(item);
  }

  function handleSavePayment(payment: BudgetPayment) {
    if (!paymentTarget) return;
    const previousPayments = paymentTarget.payments ?? [];
    const payments = [...previousPayments, payment];
    const legacyPaid = previousPayments.length === 0 ? paymentTarget.paid : 0;
    const paid = legacyPaid + payments.reduce((sum, entry) => sum + entry.amount, 0);
    const status: BudgetItem["status"] =
      paid >= paymentTarget.amount
        ? "paid"
        : paid > 0
          ? "partial"
          : paymentTarget.status === "planned"
            ? "planned"
            : "due";
    handleSave({ ...paymentTarget, paid, payments, status });
    setPaymentTarget(null);
    setViewing(null);
  }

  return (
    <AppLayout
      eyebrow="Financials"
      title="Budget tracker"
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          Add expense
        </QuietButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total budget" value={formatIDR(total)} />
        <Stat label="Paid" value={formatIDR(paid)} tone="sage" />
        <Stat label="Committed" value={formatIDR(committed)} tone="taupe" />
        <Stat
          label="Remaining"
          value={formatIDR(remaining)}
          tone={remaining < 0 ? "warn" : "neutral"}
        />
      </div>

      <div className="panel p-6 mb-8">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="eyebrow">Allocation</div>
            <h2 className="serif text-xl mt-1">Spend distribution</h2>
          </div>
          <span className="text-xs text-muted-foreground">{committedPct}% committed</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
          <div className="bg-sage" style={{ width: `${paidPct}%` }} />
          <div
            className="bg-[color:var(--taupe)]/60"
            style={{ width: `${committedPendingPct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <Legend color="bg-sage" label={`Paid · ${formatIDR(paid)}`} />
          <Legend
            color="bg-[color:var(--taupe)]/60"
            label={`Committed pending · ${formatIDR(committed - paid)}`}
          />
          <Legend color="bg-secondary" label={`Headroom · ${formatIDR(remaining)}`} />
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="serif text-lg">Line items</h2>
          <span className="text-xs text-muted-foreground">{items.length} entries</span>
        </div>
        {items.length === 0 ? (
          <EmptyState
            icon={<CurrencyDollar size={20} weight="duotone" />}
            title="No expenses yet"
            description="Start by adding your first line item — a venue deposit, catering quote, or whatever comes next."
            action={
              <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
                Add expense
              </QuietButton>
            }
          />
        ) : (
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-surface-2">
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Paid</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => openView(b)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openView(b);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-surface-2/60 focus-within:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <td className="px-5 py-3 text-foreground">{b.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.vendor ?? "—"}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatIDR(b.amount)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {formatIDR(b.paid)}
                  </td>
                  <td className="px-5 py-3">
                    <Pill
                      tone={
                        b.status === "paid"
                          ? "sage"
                          : b.status === "partial"
                            ? "taupe"
                            : b.status === "due"
                              ? "warn"
                              : "neutral"
                      }
                    >
                      {b.status}
                    </Pill>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {b.dueDate
                      ? new Date(b.dueDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {viewing && (
        <ViewModal
          title="Expense details"
          onClose={() => setViewing(null)}
          onDelete={() => handleDelete(viewing.id)}
          onEdit={() => {
            const b = viewing;
            setViewing(null);
            openEdit(b);
          }}
          badge={
            <Pill
              tone={
                viewing.status === "paid"
                  ? "sage"
                  : viewing.status === "partial"
                    ? "taupe"
                    : viewing.status === "due"
                      ? "warn"
                      : "neutral"
              }
            >
              {viewing.status}
            </Pill>
          }
        >
          <DetailGrid>
            <Detail label="Category" value={viewing.category} />
            <Detail label="Vendor" value={viewing.vendor ?? "—"} />
            <Detail label="Amount" value={formatIDR(viewing.amount)} />
            <Detail label="Paid" value={formatIDR(viewing.paid)} />
          </DetailGrid>
          <Detail
            label="Due date"
            value={
              viewing.dueDate
                ? new Date(viewing.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">Payment history</div>
                <div className="text-sm text-foreground mt-1">
                  {viewing.payments?.length ?? 0} recorded payments
                </div>
              </div>
              {viewing.paid < viewing.amount && (
                <QuietButton
                  variant="primary"
                  type="button"
                  onClick={() => {
                    setPaymentTarget(viewing);
                    setViewing(null);
                  }}
                >
                  Record payment
                </QuietButton>
              )}
            </div>
            {viewing.payments && viewing.payments.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {viewing.payments
                  .slice()
                  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                  .map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-start justify-between gap-3 rounded-xl bg-secondary px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-foreground">{formatIDR(payment.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {payment.note ? ` · ${payment.note}` : ""}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No payment history yet. Record a payment when the first deposit is made.
              </p>
            )}
          </div>
        </ViewModal>
      )}
      {paymentTarget && (
        <AddPaymentModal
          remaining={Math.max(0, paymentTarget.amount - paymentTarget.paid)}
          onClose={() => setPaymentTarget(null)}
          onSave={handleSavePayment}
        />
      )}
      {isModalOpen && (
        <AddExpenseModal
          initial={editing ?? undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </AppLayout>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "sage" | "taupe" | "warn";
}) {
  const colors = {
    neutral: "text-foreground",
    sage: "text-[color:var(--sage)]",
    taupe: "text-[color:var(--taupe)]",
    warn: "text-destructive",
  } as const;
  return (
    <div className="panel p-5">
      <div className="eyebrow">{label}</div>
      <div className={`serif text-2xl mt-2 tabular-nums ${colors[tone]}`}>{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
