import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddMilestoneModal } from "@/components/add-milestone-modal";
import { milestoneStore } from "@/lib/stores";
import { daysUntil, type Milestone } from "@/lib/mock-data";

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
  const [milestones, setMilestones] = useState<Milestone[]>(() => milestoneStore.load());
  const [editing, setEditing] = useState<Milestone | null>(null);
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
    milestoneStore.save(next);
    setMilestones(next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    const next = milestones.filter((m) => m.id !== id);
    milestoneStore.save(next);
    setMilestones(next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function openEdit(milestone: Milestone) {
    setEditing(milestone);
    setIsModalOpen(true);
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
                  onClick={() => openEdit(m)}
                  className="px-5 py-4 flex items-center gap-5 cursor-pointer hover:bg-surface-2/60 transition-colors focus-within:bg-surface-2/60"
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
                    <div className="text-xs text-muted-foreground capitalize mt-0.5">{m.kind}</div>
                  </div>
                  {m.done ? <Pill tone="sage">Done</Pill> : <Pill>{daysUntil(m.date)}d</Pill>}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
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
