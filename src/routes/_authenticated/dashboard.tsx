import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  ArrowRight,
  CalendarBlank,
  Check,
  WarningCircle,
} from "@phosphor-icons/react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { Countdown } from "@/components/countdown";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { AddTaskModal } from "@/components/add-task-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { getBrowserStorage } from "@/lib/browser-storage";
import {
  daysUntil,
  formatIDR,
  type Task,
  type BudgetItem,
  type Vendor,
  type Guest,
  type Milestone,
  type Note,
} from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Wedding Preparation" },
      {
        name: "description",
        content:
          "Quiet command center for wedding preparation: checklist, budget, vendors, guests, milestones.",
      },
      { property: "og:title", content: "Wedding Preparation Dashboard" },
      {
        property: "og:description",
        content: "One calm workspace for everything: timeline, budget, vendors, guests, decisions.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, setKind, loading, error, refresh, canEdit } = useWorkspaceData();
  const tasks = data.tasks as Task[];
  const budgetItems = data.budget as BudgetItem[];
  const vendors = data.vendors as Vendor[];
  const guests = data.guests as Guest[];
  const milestones = data.milestones as Milestone[];
  const notes = data.notes as Note[];
  const event = data.event;
  const [editing, setEditing] = useState<Task | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingPreview, setOnboardingPreview] = useState(false);

  useEffect(() => {
    try {
      setOnboardingComplete(
        getBrowserStorage("local").getItem("offstories-onboarding-complete") === "true",
      );
      setOnboardingPreview(
        getBrowserStorage("session").getItem("offstories-onboarding-preview") === "true",
      );
    } catch {
      setOnboardingComplete(false);
    }
  }, []);

  const hasEvent = Boolean(event.date && event.name);
  const showOnboarding =
    canEdit && !loading && ((!hasEvent && !onboardingComplete) || onboardingPreview);
  const days = hasEvent ? daysUntil(event.date) : null;
  const eventDatePassed = hasEvent && new Date(`${event.date}T23:59:59`) < new Date();
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const totalBudget = event.budget;
  const spent = budgetItems.reduce((s, b) => s + b.paid, 0);
  const committed = budgetItems.reduce((s, b) => s + b.committed, 0);
  const remaining = totalBudget - committed;
  const budgetPct = totalBudget ? Math.round((committed / totalBudget) * 100) : 0;
  const isOverBudget = totalBudget > 0 && committed > totalBudget;
  const vendorsBooked = vendors.filter((v) => v.status === "booked").length;
  const vendorsPending = vendors.filter(
    (v) => v.status !== "booked" && v.status !== "cancelled",
  ).length;
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const invitedPax = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
  const confirmedPct = event.guestEstimate
    ? Math.round((confirmed / event.guestEstimate) * 100)
    : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const urgent = tasks
    .filter((t) => t.status !== "done")
    .filter((t) => new Date(t.due) < nextWeek)
    .sort((a, b) => +new Date(a.due) - +new Date(b.due))
    .slice(0, 4);

  const upcomingPayments = budgetItems
    .filter((b) => b.status !== "paid" && b.status !== "planned" && b.dueDate)
    .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
    .slice(0, 3);

  const nextMilestones = [...milestones]
    .filter((m) => !m.done)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 4);
  const recentNotes = [...notes].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 3);

  function handleSaveTask(task: Task) {
    const exists = tasks.some((t) => t.id === task.id);
    const next = exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [task, ...tasks];
    setKind("tasks", next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDeleteTask(id: string) {
    setKind(
      "tasks",
      tasks.filter((t) => t.id !== id),
      { success: "Task deleted" },
    );
    setIsModalOpen(false);
    setEditing(null);
  }

  const eyebrowParts = [event.type, event.location].filter(Boolean).join(" · ");

  return (
    <AppLayout
      eyebrow={eyebrowParts || undefined}
      title={
        error
          ? "Unable to load your workspace"
          : showOnboarding
            ? "Set up your wedding"
            : hasEvent
              ? eventDatePassed
                ? `${event.name} · Wedding date passed`
                : days !== null
                  ? `${days} days to ${event.name}`
                  : event.name
              : "Set up your event"
      }
      actions={
        showOnboarding || error ? undefined : (
          <>
            <QuietButton onClick={() => window.print()}>Print</QuietButton>
            <QuietButton
              variant="primary"
              onClick={() => {
                setEditing(null);
                setIsModalOpen(true);
              }}
            >
              Add task
            </QuietButton>
          </>
        )
      }
    >
      {loading ? (
        <LoadingNote />
      ) : error ? (
        <WorkspaceErrorState message={error} onRetry={() => void refresh()} />
      ) : showOnboarding ? (
        <DashboardOnboarding
          setKind={setKind}
          onClose={() => {
            getBrowserStorage("session").removeItem("offstories-onboarding-preview");
            setOnboardingPreview(false);
            setOnboardingComplete(true);
          }}
          onComplete={() => {
            getBrowserStorage("session").removeItem("offstories-onboarding-preview");
            setOnboardingPreview(false);
            setOnboardingComplete(true);
          }}
        />
      ) : !hasEvent ? (
        <BlankWorkspaceState />
      ) : (
        <>
          {hasEvent && !eventDatePassed && (
            <section className="panel editorial-panel p-6 sm:p-8 mb-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="eyebrow">Counting down</div>
                  <h2 className="serif text-2xl mt-1 text-balance">{event.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                <div className="w-full shrink-0 sm:w-auto">
                  <Countdown target={event.date} />
                </div>
              </div>
            </section>
          )}

          {/* Top summary */}
          <section className="dashboard-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <SummaryCard
              label="Planning progress"
              value={`${progress}%`}
              sub={`${done} of ${tasks.length} tasks done`}
              featured
              href="/checklist"
            >
              <ProgressBar value={progress} />
            </SummaryCard>
            <SummaryCard
              label={isOverBudget ? "Over budget" : "Budget remaining"}
              value={formatIDR(Math.abs(remaining))}
              sub={
                isOverBudget
                  ? `${formatIDR(committed - totalBudget)} over committed budget`
                  : `${formatIDR(spent)} paid · ${formatIDR(committed)} committed`
              }
              href="/budget"
            >
              <ProgressBar value={budgetPct} tone={isOverBudget ? "rose" : "taupe"} />
            </SummaryCard>
            <SummaryCard
              label="Vendors"
              value={`${vendorsBooked} booked`}
              sub={`${vendorsPending} in review`}
              href="/vendors"
            >
              <div className="mt-3 flex gap-1.5">
                {vendors.slice(0, 6).map((v) => (
                  <span
                    key={v.id}
                    className={`h-1.5 flex-1 rounded-full ${v.status === "booked" ? "bg-sage" : v.status === "shortlisted" ? "bg-[color:var(--taupe)]/70" : "bg-border"}`}
                    title={v.name}
                  />
                ))}
              </div>
            </SummaryCard>
            <SummaryCard
              label="Guests confirmed"
              value={`${confirmed}`}
              sub={`${invitedPax} invited · target ${event.guestEstimate}`}
              href="/guests"
            >
              <ProgressBar value={confirmedPct} tone="sage" />
            </SummaryCard>
          </section>

          {/* Priority area */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            <div className="panel editorial-panel p-6 lg:col-span-2">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <div className="eyebrow">Needs attention</div>
                  <h2 className="serif text-xl mt-1 text-balance">This week</h2>
                </div>
                <Link
                  to="/checklist"
                  className="text-xs text-muted-foreground rounded-md px-2 py-1 -m-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View all →
                </Link>
              </div>
              {urgent.length > 0 ? (
                <ul className="divide-y divide-border">
                  {urgent.map((t) => {
                    const d = daysUntil(t.due);
                    const overdue = new Date(t.due) < today;
                    return (
                      <li
                        key={t.id}
                        className="py-2 flex items-center gap-3 hover:bg-surface-2/60 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const next = tasks.map((task) =>
                              task.id === t.id ? { ...task, status: "done" as const } : task,
                            );
                            setKind("tasks", next, { success: null });
                          }}
                          aria-label={`Mark ${t.title} as done`}
                          disabled={!canEdit}
                          className={`group -m-1 grid h-7 w-7 shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${canEdit ? "active:scale-90" : "cursor-not-allowed opacity-50"}`}
                        >
                          <span className="grid h-4 w-4 place-items-center rounded-sm border border-border transition-colors group-hover:border-muted-foreground">
                            <Check
                              size={12}
                              weight="bold"
                              className="text-transparent transition-colors group-hover:text-muted-foreground"
                            />
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewing(t)}
                          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <div className="text-sm text-foreground truncate">{t.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t.category} · {t.assignee ?? "Unassigned"}
                          </div>
                        </button>
                        <Pill tone={overdue || d <= 7 ? "warn" : "neutral"}>
                          {overdue
                            ? `Overdue by ${Math.max(1, Math.ceil((today.getTime() - new Date(`${t.due}T00:00:00`).getTime()) / 86400000))}d`
                            : d === 0
                              ? "Today"
                              : d === 1
                                ? "Tomorrow"
                                : `in ${d}d`}
                        </Pill>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-xl bg-surface-2 px-4 py-5 text-sm text-muted-foreground">
                  Nothing due in the next 7 days. Your checklist is in good shape.
                </div>
              )}
            </div>

            <div className="panel editorial-panel p-6">
              <div className="eyebrow">Payments due</div>
              <h2 className="serif text-xl mt-1 mb-5 text-balance">Upcoming</h2>
              {upcomingPayments.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingPayments.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-foreground">{p.vendor ?? p.category}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm tabular-nums text-foreground">
                          {formatIDR(p.amount - p.paid)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Due{" "}
                          {new Date(p.dueDate!).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <PanelEmptyState
                  description="No upcoming payments to review."
                  href="/budget"
                  action="Open budget"
                />
              )}
            </div>
          </section>

          {/* Lower detail */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="panel editorial-panel p-6 lg:col-span-2">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <div className="eyebrow">Timeline</div>
                  <h2 className="serif text-xl mt-1 text-balance">Next milestones</h2>
                </div>
                <Link
                  to="/timeline"
                  className="text-xs text-muted-foreground rounded-md px-2 py-1 -m-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open timeline →
                </Link>
              </div>
              {nextMilestones.length > 0 ? (
                <ol className="relative border-l border-border ml-2 space-y-5">
                  {nextMilestones.map((m) => (
                    <li key={m.id} className="pl-5 relative">
                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-sage" />
                      <div className="text-sm text-foreground">{m.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(m.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        · {daysUntil(m.date)} days from now
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <PanelEmptyState
                  description="No milestones have been added yet."
                  href="/timeline"
                  action="Open timeline"
                />
              )}
            </div>

            <div className="panel editorial-panel p-6">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <div className="eyebrow">Decision log</div>
                  <h2 className="serif text-xl mt-1 text-balance">Recent notes</h2>
                </div>
                <Link
                  to="/notes"
                  className="text-xs text-muted-foreground rounded-md px-2 py-1 -m-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  All →
                </Link>
              </div>
              {notes.length > 0 ? (
                <ul className="space-y-4">
                  {recentNotes.map((n) => (
                    <li key={n.id}>
                      <div className="flex items-center gap-2 mb-1">
                        <Pill tone="sage">{n.tag}</Pill>
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-foreground">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {n.body}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <PanelEmptyState
                  description="Capture decisions, questions, and family notes here."
                  href="/notes"
                  action="Open notes"
                />
              )}
            </div>
          </section>
        </>
      )}
      {viewing && (
        <ViewModal
          title="Task details"
          onClose={() => setViewing(null)}
          onDelete={() => handleDeleteTask(viewing.id)}
          onEdit={() => {
            const t = viewing;
            setViewing(null);
            setEditing(t);
            setIsModalOpen(true);
          }}
          badge={
            <Pill
              tone={
                viewing.priority === "high"
                  ? "rose"
                  : viewing.priority === "medium"
                    ? "taupe"
                    : "neutral"
              }
            >
              {viewing.priority}
            </Pill>
          }
        >
          <Detail label="Title" value={viewing.title} />
          <DetailGrid>
            <Detail label="Category" value={viewing.category} />
            <Detail
              label="Due"
              value={new Date(viewing.due).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Detail label="Assignee" value={viewing.assignee ?? "Unassigned"} />
            <Detail label="Status" value={viewing.status.replace("_", " ")} />
          </DetailGrid>
        </ViewModal>
      )}
      {isModalOpen && (
        <AddTaskModal
          initial={editing ?? undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </AppLayout>
  );
}

function LoadingNote() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto h-8 w-8 rounded-full border-2 border-border border-t-[color:var(--sage)] animate-spin" />
      <p className="text-sm text-muted-foreground mt-4">Loading workspace…</p>
    </div>
  );
}

function WorkspaceErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="panel mx-auto flex max-w-xl flex-col items-center px-6 py-14 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <WarningCircle size={22} weight="regular" />
      </div>
      <h2 className="display mt-5 text-xl text-foreground">We couldn&apos;t load your workspace</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Something interrupted the connection. Your saved plans are still safe. Try loading the
        workspace again.
      </p>
      <p className="mt-3 max-w-md truncate text-xs text-muted-foreground/70" title={message}>
        {message}
      </p>
      <QuietButton variant="primary" className="mt-6" onClick={onRetry}>
        <ArrowClockwise size={16} />
        Try again
      </QuietButton>
    </div>
  );
}

function BlankWorkspaceState() {
  return (
    <div className="panel mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center sm:px-10">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <CalendarBlank size={24} />
      </div>
      <div className="eyebrow mt-5">Your workspace is ready</div>
      <h2 className="display mt-2 text-2xl text-foreground">Start with the details that matter.</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Your blank canvas is ready. Add your wedding date, location, guest count, and budget to make
        the dashboard useful from day one.
      </p>
      <Link
        to="/settings"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgb(17_24_39_/_0.04)] transition duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
      >
        Add event details
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function PanelEmptyState({
  description,
  href,
  action,
}: {
  description: string;
  href: "/budget" | "/timeline" | "/notes";
  action: string;
}) {
  return (
    <div className="rounded-xl bg-surface-2 px-4 py-5">
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      <Link
        to={href}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {action}
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  children,
  featured = false,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  children?: React.ReactNode;
  featured?: boolean;
  href: "/checklist" | "/budget" | "/vendors" | "/guests";
}) {
  const content = (
    <div
      className={`panel editorial-panel dashboard-metric p-5 ${featured ? "bg-surface-2 sm:p-6" : ""}`}
    >
      <div className="eyebrow">{label}</div>
      <div
        className={`editorial-value mt-3 text-foreground tabular-nums ${featured ? "text-4xl" : "text-3xl"}`}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      {children}
    </div>
  );
  return (
    <Link
      to={href}
      aria-label={`${label}: ${value}. Open ${label.toLowerCase()}`}
      className="block rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
    >
      {content}
    </Link>
  );
}

function ProgressBar({
  value,
  tone = "sage",
}: {
  value: number;
  tone?: "sage" | "taupe" | "rose";
}) {
  const color =
    tone === "sage"
      ? "bg-sage"
      : tone === "rose"
        ? "bg-[color:var(--rose)]"
        : "bg-[color:var(--taupe)]";
  const normalizedValue = Math.min(100, Math.max(0, value));
  return (
    <div
      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-label="Progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
    >
      <div className={`h-full ${color}`} style={{ width: `${normalizedValue}%` }} />
    </div>
  );
}
