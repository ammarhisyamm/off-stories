import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddGuestModal } from "@/components/add-guest-modal";
import { guestStore } from "@/lib/stores";
import type { Guest } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/guests")({
  head: () => ({
    meta: [
      { title: "Guests — Wedding Preparation" },
      {
        name: "description",
        content: "Guest list with side grouping, invitation status, and RSVP tracking.",
      },
    ],
  }),
  component: Guests,
});

function Guests() {
  const [guests, setGuests] = useState<Guest[]>(() => guestStore.load());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalInvited = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const pending = guests.filter((g) => g.rsvp === "pending").reduce((s, g) => s + g.pax, 0);
  const declined = guests.filter((g) => g.rsvp === "no").reduce((s, g) => s + g.pax, 0);

  function handleAdd(guest: Guest) {
    const next = [guest, ...guests];
    guestStore.save(next);
    setGuests(next);
  }

  return (
    <AppLayout
      eyebrow="Hospitality"
      title="Guest list"
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          Add guest group
        </QuietButton>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Invited" value={totalInvited} />
        <Stat label="Confirmed" value={confirmed} tone="sage" />
        <Stat label="Pending" value={pending} tone="taupe" />
        <Stat label="Declined" value={declined} tone="warn" />
      </div>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-surface-2">
              <th className="px-5 py-3 font-medium">Group</th>
              <th className="px-5 py-3 font-medium">Side</th>
              <th className="px-5 py-3 font-medium text-right">Pax</th>
              <th className="px-5 py-3 font-medium">Invitation</th>
              <th className="px-5 py-3 font-medium">RSVP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {guests.map((g) => (
              <tr key={g.id} className="hover:bg-surface-2/60">
                <td className="px-5 py-3 text-foreground">{g.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{g.side}</td>
                <td className="px-5 py-3 text-right tabular-nums">{g.pax}</td>
                <td className="px-5 py-3">
                  <Pill tone={g.invited ? "sage" : "neutral"}>{g.invited ? "Sent" : "Draft"}</Pill>
                </td>
                <td className="px-5 py-3">
                  <Pill
                    tone={
                      g.rsvp === "yes"
                        ? "sage"
                        : g.rsvp === "no"
                          ? "warn"
                          : g.rsvp === "maybe"
                            ? "taupe"
                            : "neutral"
                    }
                  >
                    {g.rsvp}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <AddGuestModal onClose={() => setIsModalOpen(false)} onSave={handleAdd} />
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
  value: number;
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
