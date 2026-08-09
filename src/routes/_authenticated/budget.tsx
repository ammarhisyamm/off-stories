import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddPaymentModal } from "@/components/add-payment-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import {
  formatIDR,
  formatIDRInput,
  parseIDRInput,
  type BudgetItem,
  type BudgetPayment,
} from "@/lib/types";
import type { EventData } from "@/lib/data.functions";
import { payerLabels } from "@/lib/onboarding";
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
  const { data, setKind, canEdit } = useWorkspaceData();
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
  const categorySummary = useMemo(() => {
    return Array.from(
      items
        .reduce((categories, item) => {
          const current = categories.get(item.category) ?? { committed: 0, paid: 0, count: 0 };
          categories.set(item.category, {
            committed: current.committed + item.committed,
            paid: current.paid + item.paid,
            count: current.count + 1,
          });
          return categories;
        }, new Map<string, { committed: number; paid: number; count: number }>())
        .entries(),
    )
      .map(([category, summary]) => ({
        category,
        ...summary,
        remaining: summary.committed - summary.paid,
      }))
      .sort((a, b) => b.committed - a.committed);
  }, [items]);

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

      <SavingsPanel event={wedding} onSave={(next) => setKind("event", next)} canEdit={canEdit} />

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

      {categorySummary.length > 0 && (
        <section className="panel mb-8 overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
            <div>
              <div className="eyebrow">By category</div>
              <h2 className="serif mt-1 text-lg">Budget summary</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {categorySummary.length} categories
            </span>
          </div>
          <div className="divide-y divide-border">
            {categorySummary.map((summary) => {
              const progress = summary.committed
                ? Math.min(100, (summary.paid / summary.committed) * 100)
                : 0;
              return (
                <div key={summary.category} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 text-sm">
                    <div className="text-foreground">
                      {summary.category}{" "}
                      <span className="text-xs text-muted-foreground">({summary.count})</span>
                    </div>
                    <div className="text-right tabular-nums text-muted-foreground">
                      {formatIDR(summary.paid)} paid{" "}
                      <span className="text-foreground">of {formatIDR(summary.committed)}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-sage"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">
                    {formatIDR(summary.remaining)} remaining
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
              canEdit ? (
                <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
                  Add expense
                </QuietButton>
              ) : undefined
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
                <th className="px-5 py-3 font-medium">Paid by</th>
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
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {payerLabels[b.payer ?? "shared"]}
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
            <Detail label="Paid by" value={payerLabels[viewing.payer ?? "shared"]} />
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
              {viewing.paid < viewing.amount && canEdit && (
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
                          {payment.payer ? ` · ${payerLabels[payment.payer]}` : ""}
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
          defaultPayer={paymentTarget.payer}
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

function SavingsPanel({
  event,
  onSave,
  canEdit,
}: {
  event: EventData;
  onSave: (event: EventData) => void;
  canEdit?: boolean;
}) {
  const [target, setTarget] = useState(event.savingsTarget ?? 0);
  const [saved, setSaved] = useState(event.savingsSaved ?? 0);
  const [targetInput, setTargetInput] = useState(formatIDRInput(event.savingsTarget));
  const [savedInput, setSavedInput] = useState(formatIDRInput(event.savingsSaved));
  const progress = target ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const weddingDate = event.date ? new Date(event.date) : null;
  const [startMonth, setStartMonth] = useState(
    event.savingsStartMonth ?? (weddingDate ? weddingMonth(weddingDate) : ""),
  );
  const [splitInput, setSplitInput] = useState(
    String(Math.round((event.savingsMonthlySplit ?? 0.5) * 100)),
  );
  const brideName = event.brideName || "Bride";
  const groomName = event.groomName || "Groom";
  const split = clampSplit(splitInput);
  const months = useMemo(() => {
    if (!weddingDate || !startMonth) return [];
    const start = new Date(`${startMonth}-01T00:00:00`);
    const end = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), 1);
    if (!isNaN(+start) && start <= end) return listMonths(start, end);
    return [];
  }, [startMonth, weddingDate]);
  const perMonth = target && months.length ? target / months.length : 0;
  const brideMonthly = Math.round(perMonth * split * 0.01);
  const groomMonthly = Math.round(perMonth * (100 - split) * 0.01);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextTarget = Math.max(0, parseIDRInput(targetInput));
    const nextSaved = Math.max(0, parseIDRInput(savedInput));
    const nextSplit = clampSplit(splitInput);
    setTarget(nextTarget);
    setSaved(nextSaved);
    onSave({
      ...event,
      savingsTarget: nextTarget,
      savingsSaved: nextSaved,
      savingsStartMonth: startMonth,
      savingsMonthlySplit: nextSplit / 100,
    });
  }

  return (
    <section className="panel mb-8 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <div className="eyebrow">Saving together</div>
          <h2 className="serif mt-1 text-xl">Build a little headroom for the big day</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Set a savings target separately from your wedding budget and keep track of progress as
            you go.
          </p>
          {!canEdit && (
            <p className="mt-3 rounded-md border border-[color:var(--taupe)]/30 bg-[color:var(--taupe)]/10 px-3 py-2 text-xs text-muted-foreground">
              Read-only — the owner can set or change savings targets.
            </p>
          )}
          {target > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatIDR(saved)} saved</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-sage" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Savings target (IDR)
            </span>
            <input
              name="savingsTarget"
              type="text"
              inputMode="numeric"
              value={targetInput}
              onChange={(event) => setTargetInput(formatIDRInput(event.target.value))}
              placeholder="e.g. 50.000.000"
              disabled={!canEdit}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Saved so far (IDR)
            </span>
            <input
              name="savingsSaved"
              type="text"
              inputMode="numeric"
              value={savedInput}
              onChange={(event) => setSavedInput(formatIDRInput(event.target.value))}
              placeholder="e.g. 10.000.000"
              disabled={!canEdit}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          {weddingDate && (
            <>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Monthly deposit plan
                </span>
                <span className="block text-xs leading-5 text-muted-foreground/70">
                  {months.length
                    ? `Saving from ${months[0].label} to ${months[months.length - 1].label}: ${formatIDR(perMonth)} per month, split ${split}% ${brideName} / ${100 - split}% ${groomName}.`
                    : "Pick a start month before the wedding to build a monthly deposit plan."}
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Start month
                </span>
                <input
                  name="savingsStartMonth"
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  disabled={!canEdit}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {brideName} share (%)
                </span>
                <input
                  name="savingsSplit"
                  type="number"
                  min={0}
                  max={100}
                  value={splitInput}
                  onChange={(e) => setSplitInput(e.target.value)}
                  disabled={!canEdit}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </>
          )}
          <div className="sm:col-span-2 sm:flex sm:justify-end">
            {canEdit && (
              <QuietButton variant="primary" type="submit">
                Save savings target
              </QuietButton>
            )}
          </div>
        </form>
      </div>

      {months.length > 0 && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex flex-wrap items-baseline gap-3">
            <div className="eyebrow">Monthly plan</div>
            <span className="text-xs text-muted-foreground">
              {formatIDR(perMonth)} / month · {formatIDR(brideMonthly)} from {brideName} ·{" "}
              {formatIDR(groomMonthly)} from {groomName}
            </span>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm min-w-[440px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground bg-surface-2">
                  <th className="px-3 py-2 font-medium">Month</th>
                  <th className="px-3 py-2 font-medium">{brideName}</th>
                  <th className="px-3 py-2 font-medium">{groomName}</th>
                  <th className="px-3 py-2 font-medium text-right">Combined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {months.map((m) => (
                  <tr key={m.key}>
                    <td className="px-3 py-2 tabular-nums">{m.label}</td>
                    <td className="px-3 py-2 tabular-nums">{formatIDR(brideMonthly)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatIDR(groomMonthly)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatIDR(brideMonthly + groomMonthly)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function clampSplit(input: string) {
  const n = Math.round(Number(input) || 0);
  return Math.max(0, Math.min(100, n));
}

function weddingMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function listMonths(start: Date, end: Date) {
  const months: { key: string; label: string }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end && months.length < 120) {
    months.push({
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      label: cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}
