import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddGuestModal } from "@/components/add-guest-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { createRsvpLink, revokeRsvpLink } from "@/lib/rsvp.functions";
import { showToast } from "@/components/toast";
import type { Guest } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  Check,
  ClipboardText,
  Gift,
  LinkSimple,
  LinkBreak,
  MagnifyingGlass,
  Users,
} from "@phosphor-icons/react";

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
  const { data, setKind, canEdit } = useWorkspaceData();
  const guests = data.guests as Guest[];
  const [editing, setEditing] = useState<Guest | null>(null);
  const [viewing, setViewing] = useState<Guest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<"All" | Guest["side"]>("All");
  const [rsvpFilter, setRsvpFilter] = useState<"All" | Guest["rsvp"]>("All");
  const [invitationFilter, setInvitationFilter] = useState<"All" | "sent" | "draft">("All");
  const deferredQuery = useDeferredValue(query);
  const [links, setLinks] = useState<Record<string, { url: string; checkInUrl: string }>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const createLink = useServerFn(createRsvpLink);
  const revokeLinkFn = useServerFn(revokeRsvpLink);
  const totalInvited = guests.filter((g) => g.invited).reduce((s, g) => s + g.pax, 0);
  const confirmed = guests.filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.pax, 0);
  const pending = guests.filter((g) => g.rsvp === "pending").reduce((s, g) => s + g.pax, 0);
  const declined = guests.filter((g) => g.rsvp === "no").reduce((s, g) => s + g.pax, 0);
  const gifts = guests.filter((g) => g.gift);
  const giftCount = gifts.length;
  const giftTotal = gifts.reduce((sum, g) => sum + (g.gift?.amount ?? 0), 0);
  const filteredGuests = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase();
    return guests.filter((guest) => {
      const matchesQuery =
        !normalizedQuery ||
        [guest.name, guest.phone, guest.email, guest.side].some((value) =>
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

  async function handleGenerateLink(guest: Guest) {
    setGenerating((prev) => ({ ...prev, [guest.id]: true }));
    try {
      const created = await createLink({ data: { guestId: guest.id } });
      setLinks((prev) => ({ ...prev, [guest.id]: created }));
      showToast("RSVP link created");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't create RSVP link", "error");
    } finally {
      setGenerating((prev) => ({ ...prev, [guest.id]: false }));
    }
  }

  async function handleRevokeLink(guest: Guest) {
    setGenerating((prev) => ({ ...prev, [guest.id]: true }));
    try {
      await revokeLinkFn({ data: { guestId: guest.id } });
      setLinks((prev) => {
        const next = { ...prev };
        delete next[guest.id];
        return next;
      });
      showToast("RSVP link revoked");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't revoke RSVP link", "error");
    } finally {
      setGenerating((prev) => ({ ...prev, [guest.id]: false }));
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Couldn't copy link", "error");
    }
  }

  const guestLinks = viewing ? links[viewing.id] : undefined;

  return (
    <AppLayout
      eyebrow="Hospitality"
      title="Guest list"
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          Add guest
        </QuietButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Stat label="Invited" value={totalInvited} />
        <Stat label="Confirmed" value={confirmed} tone="sage" />
        <Stat label="Pending" value={pending} tone="taupe" />
        <Stat label="Declined" value={declined} tone="warn" />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-[color:var(--sage)]/5 px-4 py-3 mb-6">
        <Gift size={17} className="text-[color:var(--sage)]" weight="duotone" />
        <div className="text-sm text-foreground">
          <span className="font-medium">Gift tracking:</span> {giftCount} records · total{" "}
          <span className="tabular-nums">{giftTotal ? formatIDR(giftTotal) : "—"}</span>
        </div>
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
              placeholder="Search name, contact, or side"
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
            title="No guests yet"
            description="Add your first guest and track RSVPs and check-ins as replies come in."
            action={
              canEdit ? (
                <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
                  Add guest
                </QuietButton>
              ) : undefined
            }
          />
        ) : (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-surface-2">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Side</th>
                <th className="px-5 py-3 font-medium">Invitation</th>
                <th className="px-5 py-3 font-medium">RSVP</th>
                <th className="px-5 py-3 font-medium">Gift</th>
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
                  <td className="px-5 py-3">
                    {g.gift ? (
                      <Pill
                        tone={
                          g.gift.status === "received"
                            ? "sage"
                            : g.gift.status === "thanked"
                              ? "neutral"
                              : "taupe"
                        }
                      >
                        <span className="inline-flex items-center gap-1">
                          <Gift size={12} />
                          {g.gift.status}
                        </span>
                      </Pill>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleCheckIn(g)}
                      disabled={!canEdit}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${g.checkedIn ? "border-[color:var(--sage)] bg-[color:var(--sage)]/10 text-[color:var(--sage)]" : "border-border text-muted-foreground hover:border-primary"} ${canEdit ? "" : "cursor-not-allowed opacity-50"}`}
                    >
                      {g.checkedIn && <Check size={13} weight="bold" />}
                      {g.checkedIn ? "Checked in" : "Not checked in"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No guests match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {viewing && (
        <ViewModal
          title="Guest details"
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
          <Detail label="Guest" value={viewing.name} />
          <DetailGrid>
            <Detail label="Side" value={viewing.side} />
          </DetailGrid>
          <Detail
            label="Invitation"
            value={viewing.invited ? "Invitation sent" : "Draft — not yet sent"}
          />
          <Detail label="Contact" value={viewing.phone ?? viewing.email ?? "Not set"} />
          <Detail label="Check-in" value={viewing.checkedIn ? "Checked in" : "Not checked in"} />
          {viewing.gift && (
            <div className="rounded-[16px] border border-border bg-surface-2/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className="text-[color:var(--sage)]" weight="duotone" />
                <div className="text-sm font-medium text-foreground capitalize">
                  {viewing.gift.status === "received"
                    ? "Received"
                    : viewing.gift.status === "thanked"
                      ? "Received & thanked"
                      : "Estimated / expected"}
                </div>
              </div>
              <div className="text-sm tabular-nums text-foreground">
                {formatIDR(viewing.gift.amount)}
              </div>
              {viewing.gift.note && (
                <div className="mt-1.5 text-xs text-muted-foreground">{viewing.gift.note}</div>
              )}
            </div>
          )}
          <div className="rounded-[16px] border border-border bg-surface-2/50 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-medium text-foreground">RSVP & check-in link</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Share this link with the guest so they can RSVP and check in online.
                </div>
              </div>
              <LinkSimple size={18} className="shrink-0 text-muted-foreground" />
            </div>
            {guestLinks ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => copyLink(guestLinks.url)}
                  className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition duration-150 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                >
                  <ClipboardText size={15} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">RSVP</span>
                    <span className="block truncate text-sm text-foreground">{guestLinks.url}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Copy
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => copyLink(guestLinks.checkInUrl)}
                  className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition duration-150 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                >
                  <ClipboardText size={15} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">Check-in</span>
                    <span className="block truncate text-sm text-foreground">
                      {guestLinks.checkInUrl}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Copy
                  </span>
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRevokeLink(viewing)}
                    disabled={generating[viewing.id]}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <LinkBreak size={13} />
                    {generating[viewing.id] ? "Revoking…" : "Revoke links"}
                  </button>
                )}
              </div>
            ) : canEdit ? (
              <button
                type="button"
                onClick={() => handleGenerateLink(viewing)}
                disabled={generating[viewing.id]}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating[viewing.id] ? "Creating…" : "Create RSVP link"}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                No RSVP link has been created for this guest yet.
              </p>
            )}
          </div>
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
