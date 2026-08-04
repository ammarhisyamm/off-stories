import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
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
  const { data, setKind, loading } = useWorkspaceData();
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
  const showOnboarding = !loading && ((!hasEvent && !onboardingComplete) || onboardingPreview);
  const days = hasEvent ? daysUntil(event.date) : null;
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const totalBudget = event.budget;
  const spent = budgetItems.reduce((s, b) => s + b.paid, 0);
  const committed = budgetItems.reduce((s, b) => s + b.committed, 0);
  const remaining = totalBudget - committed;
  const budgetPct = totalBudget ? Math.round((committed / totalBudget) * 100) : 0;
  const vendorsBooked = vendors.filter((v) => v.status === "booked").length;
  const vendorsPending = vendors.filter(
    (v) => v.status !== "booked" && v.status !== "cancelled",
  ).length;
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const invitedPax = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
  const confirmedPct = event.guestEstimate
    ? Math.round((confirmed / event.guestEstimate) * 100)
    : 0;

  const urgent = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => +new Date(a.due) - +new Date(b.due))
    .slice(0, 4);

  const upcomingPayments = budgetItems
    .filter((b) => b.status !== "paid" && b.status !== "planned" && b.dueDate)
    .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
    .slice(0, 3);

  const nextMilestones = milestones.filter((m) => !m.done).slice(0, 4);

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
        showOnboarding
          ? "Set up your wedding"
          : hasEvent
            ? days !== null
              ? `${days} days to ${event.name}`
              : event.name
            : "Set up your event"
      }
      actions={
        showOnboarding ? undefined : (
          <>
            <QuietButton onClick={() => window.print()}>Export</QuietButton>
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
      ) : showOnboarding ? (
        <DashboardOnboarding
          setKind={setKind}
          onComplete={() => {
            getBrowserStorage("session").removeItem("offstories-onboarding-preview");
            setOnboardingPreview(false);
            setOnboardingComplete(true);
          }}
        />
      ) : (
        <>
          {/* Top summary */}
          <section className="dashboard-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <SummaryCard
              label="Planning progress"
              value={`${progress}%`}
              sub={`${done} of ${tasks.length} tasks done`}
            >
              <ProgressBar value={progress} />
            </SummaryCard>
            <SummaryCard
              label="Budget health"
              value={formatIDR(remaining)}
              sub={`${formatIDR(spent)} paid · ${formatIDR(committed)} committed`}
            >
              <ProgressBar value={budgetPct} tone="taupe" />
            </SummaryCard>
            <SummaryCard
              label="Vendors"
              value={`${vendorsBooked} booked`}
              sub={`${vendorsPending} in review`}
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
            >
              <ProgressBar value={confirmedPct} tone="sage" />
            </SummaryCard>
          </section>

          {/* Priority area */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="panel p-6 lg:col-span-2">
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
              <ul className="divide-y divide-border">
                {urgent.map((t) => {
                  const d = daysUntil(t.due);
                  return (
                    <li
                      key={t.id}
                      onClick={() => setViewing(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setViewing(t);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="py-3 flex items-center gap-4 cursor-pointer hover:bg-surface-2/60 transition-colors focus-within:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-[color:var(--rose)]" : "bg-[color:var(--taupe)]"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-foreground truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t.category} · {t.assignee ?? "Unassigned"}
                        </div>
                      </div>
                      <Pill tone={d <= 7 ? "warn" : "neutral"}>in {d}d</Pill>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="panel p-6">
              <div className="eyebrow">Payments due</div>
              <h2 className="serif text-xl mt-1 mb-5 text-balance">Upcoming</h2>
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
                        by{" "}
                        {new Date(p.dueDate!).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Lower detail */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="panel p-6 lg:col-span-2">
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
                      · {daysUntil(m.date)} days away
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="panel p-6">
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
              <ul className="space-y-4">
                {notes.slice(0, 3).map((n) => (
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
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</div>
                  </li>
                ))}
              </ul>
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

function SummaryCard({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="panel dashboard-metric p-5">
      <div className="eyebrow">{label}</div>
      <div className="display text-2xl mt-3 text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      {children}
    </div>
  );
}

function ProgressBar({ value, tone = "sage" }: { value: number; tone?: "sage" | "taupe" }) {
  const color = tone === "sage" ? "bg-sage" : "bg-[color:var(--taupe)]";
  return (
    <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
