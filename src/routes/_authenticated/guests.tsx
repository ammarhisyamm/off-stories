import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddGuestModal } from "@/components/add-guest-modal";
import { ModalShell, ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { Guest } from "@/lib/types";
import { Check, MagnifyingGlass, Users } from "@phosphor-icons/react";

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
  const { data, setKind } = useWorkspaceData();
  const guests = data.guests as Guest[];
  const [editing, setEditing] = useState<Guest | null>(null);
  const [viewing, setViewing] = useState<Guest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState("All");
  const [rsvpFilter, setRsvpFilter] = useState("All");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const filteredGuests = useMemo(
    () =>
      guests.filter((guest) => {
        const matchesQuery =
          !deferredQuery ||
          [guest.name, guest.phone, guest.email, guest.table].some((value) =>
            value?.toLocaleLowerCase().includes(deferredQuery),
          );
        return (
          matchesQuery &&
          (sideFilter === "All" || guest.side === sideFilter) &&
          (rsvpFilter === "All" || guest.rsvp === rsvpFilter)
        );
      }),
    [deferredQuery, guests, rsvpFilter, sideFilter],
  );
  const totalInvited = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const pending = guests.filter((g) => g.rsvp === "pending").reduce((s, g) => s + g.pax, 0);
  const declined = guests.filter((g) => g.rsvp === "no").reduce((s, g) => s + g.pax, 0);

  function handleSave(guest: Guest) {
    const exists = guests.some((g) => g.id === guest.id);
    const next = exists ? guests.map((g) => (g.id === guest.id ? guest : g)) : [guest, ...guests];
    setKind("guests", next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    setKind(
      "guests",
      guests.filter((g) => g.id !== id),
      { success: "Guest deleted" },
    );
    setIsModalOpen(false);
    setEditing(null);
  }

  function openEdit(guest: Guest) {
    setEditing(guest);
    setIsModalOpen(true);
  }

  function openView(guest: Guest) {
    setViewing(guest);
  }

  function toggleCheckIn(guest: Guest) {
    setKind(
      "guests",
      guests.map((item) => (item.id === guest.id ? { ...item, checkedIn: !item.checkedIn } : item)),
      { success: null },
    );
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Invited" value={totalInvited} />
        <Stat label="Confirmed" value={confirmed} tone="sage" />
        <Stat label="Pending" value={pending} tone="taupe" />
        <Stat label="Declined" value={declined} tone="warn" />
      </div>
      {guests.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search guests</span>
            <MagnifyingGlass
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search group, contact, or table"
              className="w-full rounded-md border border-border bg-surface px-10 py-2.5 text-base sm:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <select
            value={sideFilter}
            onChange={(event) => setSideFilter(event.target.value)}
            aria-label="Filter by side"
            className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="All">All sides</option>
            <option value="Bride">Bride</option>
            <option value="Groom">Groom</option>
            <option value="Both">Both</option>
          </select>
          <select
            value={rsvpFilter}
            onChange={(event) => setRsvpFilter(event.target.value)}
            aria-label="Filter by RSVP"
            className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="All">All RSVPs</option>
            <option value="pending">Pending</option>
            <option value="yes">Confirmed</option>
            <option value="maybe">Maybe</option>
            <option value="no">Declined</option>
          </select>
        </div>
      )}
      <div className="panel overflow-x-auto">
        {guests.length === 0 ? (
          <EmptyState
            icon={<Users size={20} weight="duotone" />}
            title="No guest groups yet"
            description="Group guests by household or friend circle, mark who's invited, and track RSVPs as replies come in."
            action={
              <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
                Add guest group
              </QuietButton>
            }
          />
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-surface-2">
                <th className="px-5 py-3 font-medium">Group</th>
                <th className="px-5 py-3 font-medium">Side</th>
                <th className="px-5 py-3 font-medium text-right">Pax</th>
                <th className="px-5 py-3 font-medium">Invitation</th>
                <th className="px-5 py-3 font-medium">RSVP</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGuests.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => openView(g)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openView(g);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-surface-2/60 focus-within:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <td className="px-5 py-3 text-foreground">{g.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.side}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{g.pax}</td>
                  <td className="px-5 py-3">
                    <Pill tone={g.invited ? "sage" : "neutral"}>
                      {g.invited ? "Sent" : "Draft"}
                    </Pill>
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
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleCheckIn(g)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${g.checkedIn ? "border-[color:var(--sage)] bg-[color:var(--sage)]/10 text-[color:var(--sage)]" : "border-border text-muted-foreground hover:border-primary"}`}
                    >
                      {g.checkedIn && <Check size={13} weight="bold" />}
                      {g.checkedIn ? "Checked in" : "Not checked in"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No guest groups match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {viewing && (
        <ViewModal
          title="Guest group details"
          onClose={() => setViewing(null)}
          onDelete={() => handleDelete(viewing.id)}
          onEdit={() => {
            const g = viewing;
            setViewing(null);
            openEdit(g);
          }}
          badge={
            <Pill
              tone={
                viewing.rsvp === "yes"
                  ? "sage"
                  : viewing.rsvp === "no"
                    ? "warn"
                    : viewing.rsvp === "maybe"
                      ? "taupe"
                      : "neutral"
              }
            >
              {viewing.rsvp}
            </Pill>
          }
        >
          <Detail label="Group name" value={viewing.name} />
          <DetailGrid>
            <Detail label="Side" value={viewing.side} />
            <Detail label="Pax" value={viewing.pax} />
          </DetailGrid>
          <Detail
            label="Invitation"
            value={viewing.invited ? "Invitation sent" : "Draft — not yet sent"}
          />
          <Detail label="Contact" value={viewing.phone ?? viewing.email ?? "Not set"} />
          <Detail label="Table" value={viewing.table ?? "Not assigned"} />
          <Detail label="Check-in" value={viewing.checkedIn ? "Checked in" : "Not checked in"} />
        </ViewModal>
      )}
      {isModalOpen && (
        <AddGuestModal
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
