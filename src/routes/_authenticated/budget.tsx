import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { budgetItems, event, formatIDR } from "@/lib/mock-data";

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
  const total = event.budget;
  const paid = budgetItems.reduce((s, b) => s + b.paid, 0);
  const committed = budgetItems.reduce((s, b) => s + b.committed, 0);
  const remaining = total - committed;

  return (
    <AppLayout
      eyebrow="Financials"
      title="Budget tracker"
      actions={<QuietButton variant="primary">Add expense</QuietButton>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <span className="text-xs text-muted-foreground">
            {Math.round((committed / total) * 100)}% committed
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
          <div className="bg-sage" style={{ width: `${(paid / total) * 100}%` }} />
          <div
            className="bg-[color:var(--taupe)]/60"
            style={{ width: `${((committed - paid) / total) * 100}%` }}
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

      <div className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="serif text-lg">Line items</h2>
          <span className="text-xs text-muted-foreground">{budgetItems.length} entries</span>
        </div>
        <table className="w-full text-sm">
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
            {budgetItems.map((b) => (
              <tr key={b.id} className="hover:bg-surface-2/60">
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
      </div>
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
