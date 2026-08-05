import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddGuestModal } from "@/components/add-guest-modal";
import { ModalShell, ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { Guest } from "@/lib/types";
import { Check, LinkSimple, QrCode, Users } from "@phosphor-icons/react";
import { createRsvpLink } from "@/lib/rsvp.functions";
import { QRCodeSVG } from "qrcode.react";

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
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [qrGuestName, setQrGuestName] = useState<string | null>(null);
  const createLink = useServerFn(createRsvpLink);
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

  async function handleRsvpLink(guest: Guest) {
    setLinkError(null);
    setLinkCopied(false);
    try {
      const result = await createLink({ data: { guestId: guest.id } });
      if (!navigator.clipboard)
        throw new Error(
          "Clipboard access is unavailable. Copy the link from the browser address bar instead.",
        );
      await navigator.clipboard.writeText(result.url);
      setLinkCopied(true);
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : "Couldn't create RSVP link");
    }
  }

  async function handleQrCode(guest: Guest) {
    setLinkError(null);
    try {
      const result = await createLink({ data: { guestId: guest.id } });
      setQrLink(result.checkInUrl);
      setQrGuestName(guest.name);
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : "Couldn't create check-in QR");
    }
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
      {(linkError || linkCopied) && (
        <div className="mb-6 rounded-md border border-border bg-surface-2 px-4 py-3 text-sm">
          {linkError ? (
            <p role="alert" className="text-destructive">
              {linkError}
            </p>
          ) : (
            <p className="text-muted-foreground">
              RSVP link copied. Share it with the guest group via WhatsApp.
            </p>
          )}
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
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-surface-2">
                <th className="px-5 py-3 font-medium">Group</th>
                <th className="px-5 py-3 font-medium">Side</th>
                <th className="px-5 py-3 font-medium text-right">Pax</th>
                <th className="px-5 py-3 font-medium">Invitation</th>
                <th className="px-5 py-3 font-medium">RSVP</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guests.map((g) => (
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
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRsvpLink(g)}
                        aria-label={`Copy RSVP link for ${g.name}`}
                        className="rounded-md border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-foreground"
                      >
                        <LinkSimple size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQrCode(g)}
                        aria-label={`Create QR check-in link for ${g.name}`}
                        className="rounded-md border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-foreground"
                      >
                        <QrCode size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
      {qrLink && qrGuestName && (
        <ModalShell
          title="Guest check-in QR"
          onClose={() => {
            setQrLink(null);
            setQrGuestName(null);
          }}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Scan this code at the entrance to check in{" "}
              <span className="font-medium text-foreground">{qrGuestName}</span>.
            </p>
            <div className="mx-auto my-6 grid w-fit place-items-center rounded-xl border border-border bg-white p-4">
              <QRCodeSVG value={qrLink} size={220} includeMargin />
            </div>
            <p className="break-all text-xs text-muted-foreground">{qrLink}</p>
            <QuietButton type="button" className="mt-5" onClick={() => window.print()}>
              Print QR
            </QuietButton>
          </div>
        </ModalShell>
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
