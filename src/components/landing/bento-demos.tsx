import { Check } from "@phosphor-icons/react";

const checklistRows = [
  { label: "Book the venue tour", priority: "high" },
  { label: "Finalize the catering menu", priority: "medium" },
  { label: "Send the save-the-dates", priority: "low" },
];

const priorityStyles: Record<string, string> = {
  high: "bg-[color:var(--rose)]/15 text-[color:var(--rose)]",
  medium: "bg-[color:var(--taupe)]/15 text-[color:var(--taupe)]",
  low: "bg-secondary text-muted-foreground",
};

export function ChecklistDemo() {
  return (
    <div className="w-full max-w-sm space-y-2">
      {checklistRows.map((r, i) => (
        <div
          key={r.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-soft transition-[box-shadow] duration-300 ease-out group-hover:shadow-[0_1px_2px_rgb(0_0_0/0.05),0_24px_48px_-24px_rgb(0_0_0/0.18)]"
        >
          <span
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-border text-background transition-colors duration-200 ease-out group-hover:border-sage group-hover:bg-sage"
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <Check size={13} weight="bold" />
          </span>
          <span
            className="flex-1 truncate text-sm text-foreground transition-colors duration-200 ease-out group-hover:text-muted-foreground group-hover:line-through"
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            {r.label}
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityStyles[r.priority]}`}
          >
            {r.priority}
          </span>
        </div>
      ))}
    </div>
  );
}

const budgetRows = [
  { label: "Venue", amount: "Rp 32m", bar: "scale-x-[0.62] group-hover:scale-x-[0.95]" },
  { label: "Catering", amount: "Rp 48m", bar: "scale-x-[0.78] group-hover:scale-x-[0.92]" },
  { label: "Photography", amount: "Rp 18m", bar: "scale-x-[0.35] group-hover:scale-x-[0.88]" },
];

export function BudgetDemo() {
  return (
    <div className="w-full max-w-sm space-y-3">
      {budgetRows.map((r) => (
        <div key={r.label} className="rounded-xl border border-border bg-background px-3.5 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm text-foreground">{r.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{r.amount}</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full origin-left rounded-full bg-sage transition-transform duration-500 ease-out group-hover:bg-[color:var(--taupe)] ${r.bar}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const guestNames = ["Andra & Kirana", "Rani & Dimas", "Sinta & Bagas"];

export function GuestsDemo() {
  return (
    <div className="w-full max-w-sm space-y-2">
      {guestNames.map((name, i) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
        >
          <span className="flex-1 truncate text-sm text-foreground">{name}</span>
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--taupe)]/10 px-2.5 py-1 text-[10px] font-medium text-[color:var(--taupe)] transition-colors duration-300 ease-out group-hover:bg-[color:var(--sage)]/15 group-hover:text-[color:var(--sage)]"
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current transition-transform duration-300 ease-out group-hover:scale-125" />
            <span className="relative block h-[10px] overflow-hidden">
              <span className="block leading-none transition-all duration-300 ease-out group-hover:-translate-y-full group-hover:opacity-0">
                Pending
              </span>
              <span className="absolute inset-x-0 top-full block translate-y-0 leading-none transition-all duration-300 ease-out group-hover:-translate-y-full group-hover:opacity-100">
                Confirmed
              </span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

const timelineRows = [
  { label: "Venue secured", d: "D-250" },
  { label: "Send the invites", d: "D-90" },
  { label: "Final fitting", d: "D-20" },
  { label: "The big day", d: "D-0" },
];

export function TimelineDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <div className="absolute bottom-2 left-[5px] top-2 w-px bg-border" />
        <div className="absolute bottom-2 left-[5px] top-2 w-px origin-top scale-y-0 bg-sage transition-transform duration-500 ease-out group-hover:scale-y-100" />
        <div className="space-y-4">
          {timelineRows.map((m, i) => (
            <div key={m.label} className="relative flex items-center gap-4 pl-6">
              <span
                className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-border bg-background transition-colors duration-300 ease-out group-hover:border-sage group-hover:bg-sage"
                style={{ transitionDelay: `${i * 90}ms` }}
              />
              <span className="min-w-0 truncate text-sm text-foreground">{m.label}</span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.d}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
