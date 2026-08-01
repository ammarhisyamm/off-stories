import {
  CalendarDots,
  CheckSquare,
  CurrencyDollar,
  FolderOpen,
  Gear,
  House,
  NoteBlank,
  Storefront,
  Users,
} from "@phosphor-icons/react";
import {
  budgetItems,
  daysUntil,
  event,
  formatIDR,
  guests,
  milestones,
  notes,
  tasks,
  vendors,
} from "@/lib/mock-data";

const nav = [
  { to: "/dashboard", label: "Dashboard", Icon: House, active: true },
  { to: "/timeline", label: "Timeline", Icon: CalendarDots },
  { to: "/checklist", label: "Checklist", Icon: CheckSquare },
  { to: "/budget", label: "Budget", Icon: CurrencyDollar },
  { to: "/vendors", label: "Vendors", Icon: Storefront },
  { to: "/guests", label: "Guests", Icon: Users },
  { to: "/notes", label: "Notes", Icon: NoteBlank },
  { to: "/documents", label: "Documents", Icon: FolderOpen },
  { to: "/settings", label: "Settings", Icon: Gear },
];

const done = tasks.filter((t) => t.status === "done").length;
const progress = Math.round((done / tasks.length) * 100);
const committed = budgetItems.reduce((s, b) => s + b.committed, 0);
const spent = budgetItems.reduce((s, b) => s + b.paid, 0);
const remaining = event.budget - committed;
const vendorsBooked = vendors.filter((v) => v.status === "booked").length;
const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
const invited = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
const urgent = tasks
  .filter((t) => t.status !== "done")
  .sort((a, b) => +new Date(a.due) - +new Date(b.due))
  .slice(0, 4);
const upcoming = budgetItems
  .filter((b) => b.status !== "paid" && b.status !== "planned" && b.dueDate)
  .slice(0, 3);

function Sidebar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`hidden shrink-0 flex-col border-r border-border bg-sidebar sm:flex ${
        compact ? "w-28 p-2 lg:w-32" : "w-36 p-2 lg:w-44 lg:p-3"
      }`}
    >
      <div className={`mb-2 ${compact ? "px-2 py-2" : "px-3 py-4"}`}>
        <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Workspace
        </div>
        <div className="serif text-sm leading-tight text-foreground">{event.name}</div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {daysUntil(event.date)} days until akad + resepsi
        </div>
      </div>
      {nav.map(({ to, label, Icon, active }) => (
        <div
          key={to}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
            active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
          }`}
        >
          <Icon size={13} weight={active ? "duotone" : "regular"} />
          <span className="flex-1 truncate">{label}</span>
          {active && <span className="h-1 w-1 rounded-full bg-sage" />}
        </div>
      ))}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-browser">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <div className="border-b border-border px-4 py-3">
            <div className="eyebrow mb-1 text-[10px]">
              {event.type} · {event.location}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="serif text-base text-foreground">
                {daysUntil(event.date)} days to {event.name}
              </h3>
              <span className="rounded-md bg-primary px-2 py-1 text-[9px] font-medium text-primary-foreground">
                + Add task
              </span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <SummaryStat
                label="Planning progress"
                value={`${progress}%`}
                sub={`${done} of ${tasks.length} tasks`}
                pct={progress}
              />
              <SummaryStat
                label="Budget health"
                value={formatIDR(remaining)}
                sub={`${formatIDR(committed)} committed`}
                pct={Math.round((committed / event.budget) * 100)}
                tone="taupe"
              />
              <SummaryStat
                label="Vendors"
                value={`${vendorsBooked} booked`}
                sub="2 in review"
                pct={0}
                mini
              />
              <SummaryStat
                label="Guests"
                value={`${confirmed} confirmed`}
                sub={`${invited} invited`}
                pct={Math.round((confirmed / event.guestEstimate) * 100)}
                tone="sage"
              />
            </div>
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
              <div className="rounded-lg border border-border bg-surface p-3 lg:col-span-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-foreground">
                    This week
                  </span>
                  <span className="text-[10px] text-sage">3 due</span>
                </div>
                <div className="divide-y divide-border">
                  {urgent.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 py-1.5">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          t.priority === "high"
                            ? "bg-[color:var(--rose)]"
                            : "bg-[color:var(--taupe)]"
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                        {t.title}
                      </span>
                      <span className="ml-auto shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">
                        in {daysUntil(t.due)}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3 lg:col-span-2">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-foreground">
                  Payments due
                </div>
                <div className="space-y-2">
                  {upcoming.map((b) => (
                    <div key={b.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[11px] text-foreground">
                          {b.vendor ?? b.category}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          by{" "}
                          {new Date(b.dueDate!).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] tabular-nums text-foreground">
                        {formatIDR(b.amount - b.paid)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  pct,
  tone = "sage",
  mini = false,
}: {
  label: string;
  value: string;
  sub: string;
  pct: number;
  tone?: "sage" | "taupe";
  mini?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 serif text-sm leading-none text-foreground">{value}</div>
      <div className="mt-0.5 text-[9px] text-muted-foreground">{sub}</div>
      {!mini && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full ${tone === "sage" ? "bg-sage" : "bg-[color:var(--taupe)]"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ChecklistPreview() {
  const rows = tasks.filter((t) => t.status !== "done").slice(0, 5);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-browser">
      <div className="flex">
        <Sidebar compact />
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Checklist
            </span>
            <span className="text-[10px] text-foreground">{progress}% done</span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-sage" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-2.5 py-2"
              >
                <span className="h-3 w-3 shrink-0 rounded-full border border-border bg-background" />
                <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                  {r.title}
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium ${
                    r.priority === "high"
                      ? "bg-[color:var(--rose)]/15 text-[color:var(--rose)]"
                      : r.priority === "medium"
                        ? "bg-[color:var(--taupe)]/15 text-[color:var(--taupe)]"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {r.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BudgetPreview() {
  const rows = budgetItems.slice(0, 5);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-browser">
      <div className="flex">
        <Sidebar compact />
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Budget
            </span>
            <span className="serif text-sm text-foreground">{formatIDR(event.budget)}</span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-sage"
              style={{ width: `${Math.round((committed / event.budget) * 100)}%` }}
            />
          </div>
          <div className="space-y-2">
            {rows.map((r) => {
              const pct = r.amount ? Math.round((r.committed / r.amount) * 100) : 0;
              return (
                <div key={r.id} className="rounded-md border border-border bg-surface px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                      {r.category}
                    </span>
                    <span className="shrink-0 text-[9px] text-muted-foreground">{r.vendor}</span>
                    <span className="shrink-0 text-[10px] font-medium tabular-nums text-foreground">
                      {formatIDR(r.amount)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${pct === 0 ? "bg-[color:var(--taupe)]/60" : "bg-sage"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GuestsPreview() {
  const rows = guests.filter((g) => g.invited).slice(0, 5);
  const tone = (rsvp: string) =>
    rsvp === "yes"
      ? "bg-[color:var(--sage)]/20 text-[color:var(--sage)]"
      : rsvp === "maybe"
        ? "bg-[color:var(--taupe)]/20 text-[color:var(--taupe)]"
        : rsvp === "no"
          ? "bg-[color:var(--rose)]/15 text-[color:var(--rose)]"
          : "bg-secondary text-muted-foreground";
  const label = (rsvp: string) =>
    rsvp === "yes"
      ? "Confirmed"
      : rsvp === "maybe"
        ? "Maybe"
        : rsvp === "no"
          ? "Declined"
          : "Pending";
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-browser">
      <div className="flex">
        <Sidebar compact />
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Guests
            </span>
            <span className="serif text-sm text-foreground">{confirmed} confirmed</span>
          </div>
          <div className="mb-3 flex gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-sage/70" />
            <div className="h-1.5 w-[14%] rounded-full bg-[color:var(--taupe)]/50" />
            <div className="h-1.5 w-[8%] rounded-full bg-secondary" />
          </div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                  {r.name}
                </span>
                <span className="shrink-0 text-[9px] text-muted-foreground">
                  {r.side} · {r.pax}
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium ${tone(r.rsvp)}`}
                >
                  {label(r.rsvp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimelinePreview() {
  const rows = milestones.slice(0, 5);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-browser">
      <div className="flex">
        <Sidebar compact />
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Timeline · {event.name}
          </div>
          <div className="relative space-y-3 pl-4">
            <div className="absolute bottom-1 left-[3px] top-1 w-px bg-border" />
            {rows.map((m) => (
              <div key={m.id} className="relative flex items-start gap-2.5">
                <span
                  className={`absolute -left-4 mt-0.5 h-2 w-2 rounded-full ${
                    m.done ? "bg-sage" : "border border-border bg-background"
                  }`}
                />
                <div className="w-20 shrink-0 text-[8px] uppercase tracking-wider text-muted-foreground">
                  T-
                  {Math.max(
                    0,
                    Math.round(
                      (new Date(event.date).getTime() - new Date(m.date).getTime()) / 86400000,
                    ),
                  )}
                  m
                </div>
                <span
                  className={`min-w-0 text-[11px] ${m.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotesPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-browser">
      <div className="flex">
        <Sidebar compact />
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Decision log
          </div>
          <div className="space-y-3">
            {notes.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-md border border-border bg-surface p-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--sage)]/15 px-1.5 py-0.5 text-[8px] font-medium text-[color:var(--sage)]">
                    {n.tag}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(n.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="text-[11px] text-foreground">{n.title}</div>
                <div className="mt-0.5 line-clamp-2 text-[9px] text-muted-foreground">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
