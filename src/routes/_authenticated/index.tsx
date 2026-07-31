import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddTaskModal } from "@/components/add-task-modal";
import { loadTasks, saveTasks } from "@/lib/tasks-store";
import {
  event,
  daysUntil,
  formatIDR,
  budgetItems,
  vendors,
  guests,
  milestones,
  notes,
  type Task,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/")({
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
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const days = daysUntil(event.date);
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = Math.round((done / tasks.length) * 100);
  const totalBudget = event.budget;
  const spent = budgetItems.reduce((s, b) => s + b.paid, 0);
  const committed = budgetItems.reduce((s, b) => s + b.committed, 0);
  const remaining = totalBudget - committed;
  const vendorsBooked = vendors.filter((v) => v.status === "booked").length;
  const vendorsPending = vendors.filter(
    (v) => v.status !== "booked" && v.status !== "cancelled",
  ).length;
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const invitedPax = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);

  const urgent = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => +new Date(a.due) - +new Date(b.due))
    .slice(0, 4);

  const upcomingPayments = budgetItems
    .filter((b) => b.status !== "paid" && b.status !== "planned" && b.dueDate)
    .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
    .slice(0, 3);

  const nextMilestones = milestones.filter((m) => !m.done).slice(0, 4);

  function handleAddTask(task: Task) {
    const next = [task, ...tasks];
    saveTasks(next);
    setTasks(next);
  }

  return (
    <AppLayout
      eyebrow={`${event.type} · ${event.location}`}
      title={`${days} days to ${event.name.split(" & ")[0]} & ${event.name.split(" & ")[1]}`}
      actions={
        <>
          <QuietButton onClick={() => window.print()}>Export</QuietButton>
          <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
            Add task
          </QuietButton>
        </>
      }
    >
      {/* Top summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
          <ProgressBar value={Math.round((committed / totalBudget) * 100)} tone="taupe" />
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
          <ProgressBar value={Math.round((confirmed / event.guestEstimate) * 100)} tone="sage" />
        </SummaryCard>
      </section>

      {/* Priority area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <div className="eyebrow">Needs attention</div>
              <h2 className="serif text-xl mt-1">This week</h2>
            </div>
            <Link to="/checklist" className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {urgent.map((t) => {
              const d = daysUntil(t.due);
              return (
                <li key={t.id} className="py-3 flex items-center gap-4">
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
          <h2 className="serif text-xl mt-1 mb-5">Upcoming</h2>
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
              <h2 className="serif text-xl mt-1">Next milestones</h2>
            </div>
            <Link to="/timeline" className="text-xs text-muted-foreground hover:text-foreground">
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
              <h2 className="serif text-xl mt-1">Recent notes</h2>
            </div>
            <Link to="/notes" className="text-xs text-muted-foreground hover:text-foreground">
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
      {isModalOpen && (
        <AddTaskModal onClose={() => setIsModalOpen(false)} onSave={handleAddTask} />
      )}
    </AppLayout>
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
    <div className="panel p-5">
      <div className="eyebrow">{label}</div>
      <div className="serif text-2xl mt-2 text-foreground tabular-nums">{value}</div>
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
