import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddMilestoneModal } from "@/components/add-milestone-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { daysUntil, type Milestone } from "@/lib/types";
import { CalendarDots, CaretLeft, CaretRight, ListBullets } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Wedding Preparation" },
      { name: "description", content: "Milestones and key dates from booking to the wedding day." },
    ],
  }),
  component: Timeline,
});

function Timeline() {
  const { data, setKind } = useWorkspaceData();
  const milestones = data.milestones as Milestone[];
  const [view, setView] = useState<"list" | "calendar">("list");
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [viewing, setViewing] = useState<Milestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const byMonth = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    const k = new Date(m.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    (acc[k] ||= []).push(m);
    return acc;
  }, {});

  function handleSave(milestone: Milestone) {
    const exists = milestones.some((m) => m.id === milestone.id);
    const next = exists
      ? milestones.map((m) => (m.id === milestone.id ? milestone : m))
      : [...milestones, milestone];
    setKind("milestones", next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    setKind(
      "milestones",
      milestones.filter((m) => m.id !== id),
      { success: "Milestone deleted" },
    );
    setIsModalOpen(false);
    setEditing(null);
  }

  function openEdit(milestone: Milestone) {
    setEditing(milestone);
    setIsModalOpen(true);
  }

  function openView(milestone: Milestone) {
    setViewing(milestone);
  }

  return (
    <AppLayout
      eyebrow="Planning"
      title="Timeline & milestones"
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          Add milestone
        </QuietButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total milestones", value: milestones.length },
          { label: "Completed", value: milestones.filter((m) => m.done).length },
          {
            label: "Next 30 days",
            value: milestones.filter((m) => !m.done && daysUntil(m.date) <= 30).length,
          },
        ].map((s) => (
          <div key={s.label} className="panel p-5">
            <div className="eyebrow">{s.label}</div>
            <div className="serif text-2xl mt-2 tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon={<CalendarDots size={20} weight="duotone" />}
          title="No milestones yet"
          description="Map the journey from venue booking to the big day — fitting, deposits, legal docs and final reviews."
          action={
            <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
              Add milestone
            </QuietButton>
          }
        />
      ) : (
        <>
          <div className="mb-6 inline-flex rounded-md border border-border bg-surface p-0.5">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              <ListBullets size={15} />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              aria-pressed={view === "calendar"}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${view === "calendar" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              <CalendarDots size={15} />
              Calendar
            </button>
          </div>
          {view === "list" ? (
            <div className="space-y-10">
              {Object.entries(byMonth).map(([month, list]) => (
                <section key={month}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="serif text-xl">{month}</h2>
                    <span className="text-xs text-muted-foreground">
                      {list.length} milestone{list.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <ol className="panel divide-y divide-border">
                    {list.map((m) => (
                      <li
                        key={m.id}
                        onClick={() => openView(m)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openView(m);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="px-5 py-4 flex items-center gap-5 cursor-pointer hover:bg-surface-2/60 transition-colors focus-within:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        <div className="w-14 text-center">
                          <div className="serif text-2xl text-foreground tabular-nums">
                            {new Date(m.date).getDate()}
                          </div>
                          <div className="text-xs uppercase tracking-widest text-muted-foreground">
                            {new Date(m.date).toLocaleDateString("en-GB", { weekday: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground">{m.title}</div>
                          <div className="text-xs text-muted-foreground capitalize mt-0.5">
                            {m.kind}
                          </div>
                        </div>
                        {m.done ? <Pill tone="sage">Done</Pill> : <Pill>{daysUntil(m.date)}d</Pill>}
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <MilestoneCalendar
              milestones={milestones}
              onOpen={(m) => openView(m)}
              onAdd={() => setIsModalOpen(true)}
            />
          )}
        </>
      )}
      {viewing && (
        <ViewModal
          title="Milestone details"
          onClose={() => setViewing(null)}
          onDelete={() => handleDelete(viewing.id)}
          onEdit={() => {
            const m = viewing;
            setViewing(null);
            openEdit(m);
          }}
          badge={viewing.done ? <Pill tone="sage">Done</Pill> : undefined}
        >
          <Detail label="Title" value={viewing.title} />
          <DetailGrid>
            <Detail
              label="Date"
              value={new Date(viewing.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Detail label="Kind" value={viewing.kind} />
          </DetailGrid>
        </ViewModal>
      )}
      {isModalOpen && (
        <AddMilestoneModal
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

function MilestoneCalendar({
  milestones,
  onOpen,
  onAdd,
}: {
  milestones: Milestone[];
  onOpen: (m: Milestone) => void;
  onAdd: () => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState<{ month: number; year: number }>({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const firstDay = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const monthLabel = firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const byDate = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    const key = m.date.slice(0, 10);
    (acc[key] ||= []).push(m);
    return acc;
  }, {});

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { month: d.getMonth(), year: d.getFullYear() };
    });
  }

  const monthMilestones = milestones.filter((m) => {
    const d = new Date(m.date);
    return d.getMonth() === cursor.month && d.getFullYear() === cursor.year;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="serif text-xl">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-auto sm:mr-1">
            {monthMilestones.length} milestone{monthMilestones.length !== 1 ? "s" : ""} this month
          </span>
          <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
            <button
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground transition duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.95]"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button
              onClick={() => setCursor({ month: today.getMonth(), year: today.getFullYear() })}
              className="h-7 rounded-sm px-2 text-xs font-medium text-muted-foreground transition duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            >
              Today
            </button>
            <button
              onClick={() => shift(1)}
              aria-label="Next month"
              className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground transition duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.95]"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="px-3 py-2 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground border-b border-border"
            >
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div key={`blank-${i}`} className="min-h-20 border-b border-r border-border" />
              );
            }
            const dateStr = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayMilestones = byDate[dateStr] ?? [];
            const isToday =
              day === today.getDate() &&
              cursor.month === today.getMonth() &&
              cursor.year === today.getFullYear();
            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (dayMilestones.length > 0) onOpen(dayMilestones[0]);
                }}
                className={`min-h-20 border-b border-r border-border p-2 text-left align-top transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  dayMilestones.length > 0
                    ? "bg-surface-2/60 cursor-pointer hover:bg-surface-2"
                    : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs tabular-nums ${
                      isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  {dayMilestones.length > 0 && (
                    <span className="hidden rounded-full bg-sage px-1.5 py-0.5 text-[10px] font-medium text-white sm:inline">
                      {dayMilestones.length}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 space-y-1">
                  {dayMilestones.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      className={`truncate rounded-sm px-1 py-0.5 text-[11px] leading-tight ${
                        m.done ? "bg-sage/20 text-sage" : "bg-[#f0eee8] text-[#555555]"
                      }`}
                    >
                      {m.title}
                    </div>
                  ))}
                  {dayMilestones.length > 2 && (
                    <div className="px-1 text-[10px] text-muted-foreground">
                      +{dayMilestones.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f0eee8]" />
          Scheduled
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sage/40" />
          Done
        </span>
        {milestones.length > 0 && (
          <button
            onClick={onAdd}
            className="ml-auto rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
          >
            Add milestone
          </button>
        )}
      </div>
    </div>
  );
}
