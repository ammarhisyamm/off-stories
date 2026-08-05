import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { ModalShell } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { CommandContact, RundownItem, Vendor } from "@/lib/types";
import { DownloadSimple, Phone, Plus, Printer, ShieldWarning } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/command-center")({
  head: () => ({
    meta: [
      { title: "Command Center — Wedding Preparation" },
      {
        name: "description",
        content: "Wedding day rundown, contacts, PICs, and printable call sheet.",
      },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const { data, setKind } = useWorkspaceData();
  const rundown = (data.rundown ?? []) as RundownItem[];
  const vendors = (data.vendors ?? []) as Vendor[];
  const contacts = (data.command?.contacts ?? []) as CommandContact[];
  const [contactModal, setContactModal] = useState(false);
  const [editing, setEditing] = useState<CommandContact | null>(null);
  const sortedRundown = [...rundown].sort((a, b) => a.time.localeCompare(b.time));

  function saveContact(contact: CommandContact) {
    const next = contacts.some((item) => item.id === contact.id)
      ? contacts.map((item) => (item.id === contact.id ? contact : item))
      : [...contacts, contact];
    setKind("command", { contacts: next });
    setEditing(null);
    setContactModal(false);
  }

  function deleteContact(id: string) {
    setKind("command", { contacts: contacts.filter((item) => item.id !== id) }, { success: null });
  }

  function openNewContact() {
    setEditing(null);
    setContactModal(true);
  }

  return (
    <AppLayout
      eyebrow="Wedding day"
      title="Command center"
      actions={
        <div className="flex flex-wrap gap-2 print:hidden">
          <QuietButton onClick={() => window.print()}>
            <Printer size={15} /> Print / export PDF
          </QuietButton>
          <QuietButton variant="primary" onClick={openNewContact}>
            <Plus size={15} /> Add contact
          </QuietButton>
        </div>
      }
    >
      <div className="mb-8 rounded-[24px] border border-border bg-surface p-6 sm:p-8">
        <div className="eyebrow">Call sheet</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display text-2xl text-foreground">
              {data.event.name || "Your wedding day"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.event.date || "Set the wedding date in Settings"} ·{" "}
              {data.event.location || "Location not set"}
            </p>
          </div>
          <Pill tone="neutral">{sortedRundown.length} agenda items</Pill>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A focused day-of view for the couple, family, and vendors. Use Print / export PDF to
          create a clean call sheet for offline use.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="eyebrow">Timeline</div>
              <h2 className="serif mt-1 text-xl">Today's rundown</h2>
            </div>
            <Pill tone="neutral">
              {sortedRundown.filter((item) => item.status === "done").length}/{sortedRundown.length}{" "}
              ready
            </Pill>
          </div>
          {sortedRundown.length === 0 ? (
            <EmptyState
              title="No rundown items yet"
              description="Add agenda items in Rundown to build the call sheet."
            />
          ) : (
            <div className="divide-y divide-border">
              {sortedRundown.map((item) => (
                <div key={item.id} className="flex gap-4 px-5 py-4">
                  <div className="w-14 shrink-0 text-sm font-medium tabular-nums text-foreground">
                    {item.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {[item.location, item.pic ? `PIC: ${item.pic}` : undefined, item.notes]
                        .filter(Boolean)
                        .join(" · ") || "No PIC or notes"}
                    </div>
                  </div>
                  <Pill tone={item.status === "done" ? "sage" : "neutral"}>
                    {item.status === "done" ? "Ready" : "Planned"}
                  </Pill>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="eyebrow">People</div>
              <h2 className="serif mt-1 text-xl">Contacts on call</h2>
            </div>
            <button
              type="button"
              onClick={openNewContact}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground print:hidden"
              aria-label="Add contact"
            >
              <Plus size={18} />
            </button>
          </div>
          {contacts.length === 0 && vendors.length === 0 ? (
            <EmptyState
              icon={<Phone size={20} />}
              title="No contacts yet"
              description="Add emergency contacts or vendor contacts for the day-of team."
            />
          ) : (
            <div className="divide-y divide-border">
              {[
                ...vendors.map((vendor) => ({
                  id: `vendor-${vendor.id}`,
                  name: vendor.name,
                  role: vendor.category,
                  phone: vendor.phone,
                  type: "vendor" as const,
                  notes: vendor.contact,
                })),
                ...contacts,
              ].map((contact) => (
                <div key={contact.id} className="group flex items-center gap-3 px-5 py-3.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted-foreground">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {contact.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {contact.role} · {contact.phone || "Phone not set"}
                    </div>
                  </div>
                  <a
                    href={contact.phone ? `tel:${contact.phone}` : undefined}
                    aria-label={`Call ${contact.name}`}
                    className={`rounded-md p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground print:hidden ${contact.phone ? "" : "pointer-events-none opacity-40"}`}
                  >
                    <Phone size={16} />
                  </a>
                  {contact.id.startsWith("vendor-") ? null : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(contact);
                        setContactModal(true);
                      }}
                      className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground print:hidden"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <ShieldWarning size={18} className="text-destructive" />
          <div>
            <div className="eyebrow">Safety net</div>
            <h2 className="serif mt-1 text-xl">Emergency contacts</h2>
          </div>
        </div>
        {contacts.filter((contact) => contact.type === "emergency").length === 0 ? (
          <div className="px-5 py-5 text-sm text-muted-foreground">
            No emergency contacts added. Add venue security, medical support, or a trusted family
            lead.
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {contacts
              .filter((contact) => contact.type === "emergency")
              .map((contact) => (
                <div key={contact.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {contact.role} · {contact.phone}
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground print:hidden"
                  >
                    <Phone size={13} /> Call
                  </a>
                </div>
              ))}
          </div>
        )}
      </section>

      {contactModal && (
        <ContactModal
          initial={editing ?? undefined}
          onClose={() => {
            setContactModal(false);
            setEditing(null);
          }}
          onSave={saveContact}
          onDelete={
            editing
              ? () => {
                  deleteContact(editing.id);
                  setContactModal(false);
                  setEditing(null);
                }
              : undefined
          }
        />
      )}
    </AppLayout>
  );
}

function ContactModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: CommandContact;
  onClose: () => void;
  onSave: (contact: CommandContact) => void;
  onDelete?: () => void;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const role = String(form.get("role") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name || !role || !phone) return;
    onSave({
      id: initial?.id ?? `contact-${Date.now()}`,
      name,
      role,
      phone,
      type: form.get("type") as CommandContact["type"],
      notes: String(form.get("notes") ?? "").trim() || undefined,
    });
  }
  return (
    <ModalShell title={initial ? "Edit contact" : "Add day-of contact"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={initial?.name}
            className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Role
            <input
              name="role"
              required
              defaultValue={initial?.role}
              placeholder="e.g. Family coordinator"
              className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Phone
            <input
              name="phone"
              required
              type="tel"
              defaultValue={initial?.phone}
              placeholder="e.g. 0812 3456 7890"
              className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Type
          <select
            name="type"
            defaultValue={initial?.type ?? "family"}
            className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          >
            <option value="family">Family / PIC</option>
            <option value="vendor">Vendor</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
          <textarea
            name="notes"
            rows={2}
            maxLength={240}
            defaultValue={initial?.notes}
            className="mt-1.5 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
          />
        </label>
        <div className="flex items-center justify-between pt-2">
          {onDelete ? (
            <button type="button" onClick={onDelete} className="text-sm text-destructive">
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <QuietButton type="button" onClick={onClose}>
              Cancel
            </QuietButton>
            <QuietButton variant="primary" type="submit">
              Save contact
            </QuietButton>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
