import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddGuestModal } from "@/components/add-guest-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
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
  const [sideFilter, setSideFilter] = useState<"All" | Guest["side"]>("All");
  const [rsvpFilter, setRsvpFilter] = useState<"All" | Guest["rsvp"]>("All");
  const [invitationFilter, setInvitationFilter] = useState<"All" | "sent" | "draft">("All");
  const deferredQuery = useDeferredValue(query);
  const totalInvited = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const pending = guests.filter((g) => g.rsvp === "pending").reduce((s, g) => s + g.pax, 0);
  const declined = guests.filter((g) => g.rsvp === "no").reduce((s, g) => s + g.pax, 0);
  const filteredGuests = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase();
    return guests.filter((guest) => {
      const matchesQuery =
        !normalizedQuery ||
        [guest.name, guest.phone, guest.email, guest.table].some((value) =>
          value?.toLocaleLowerCase().includes(normalizedQuery),
        );
      const matchesSide = sideFilter === "All" || guest.side === sideFilter;
      const matchesRsvp = rsvpFilter === "All" || guest.rsvp === rsvpFilter;
      const matchesInvitation =
        invitationFilter === "All" ||
        (invitationFilter === "sent" ? guest.invited : !guest.invited);

      return matchesQuery && matchesSide && matchesRsvp && matchesInvitation;
    });
  }, [deferredQuery, guests, invitationFilter, rsvpFilter, sideFilter]);

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
      <div className="panel p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(3,auto)]">
          <label className="relative block">
            <MagnifyingGlass
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <span className="sr-only">Search guests</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, contact, or table"
              className="w-full rounded-md border border-border bg-surface-2 py-2 pl-9 pr-3 text-base sm:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <FilterSelect
            label="Side"
            value={sideFilter}
            onChange={setSideFilter}
            options={["All", "Bride", "Groom", "Both"]}
          />
          <FilterSelect
            label="RSVP"
            value={rsvpFilter}
            onChange={setRsvpFilter}
            options={["All", "pending", "yes", "maybe", "no"]}
          />
          <FilterSelect
            label="Invitation"
            value={invitationFilter}
            onChange={setInvitationFilter}
            options={["All", "sent", "draft"]}
          />
        </div>
      </div>
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
          <>
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
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No guest groups match these filters.
            </p>
          )}
          </>
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

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
}) {
  return (
    <label className="block">
      <span className="sr-only">Filter by {label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label.toLocaleLowerCase()}` : option}
          </option>
        ))}
      </select>
    </label>
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
