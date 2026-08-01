import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { listInvites, createInvite, revokeInvite } from "@/lib/invites.functions";
import { Copy, Check, LinkSimple } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Wedding Preparation" },
      { name: "description", content: "Event details and collaborators." },
    ],
  }),
  component: Settings,
});

type Section = "Event" | "Collaborators";

function Settings() {
  const [section, setSection] = useState<Section>("Event");
  return (
    <AppLayout eyebrow="Workspace" title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <aside>
          <nav
            className="panel p-1 flex gap-1 text-sm lg:flex-col lg:p-2"
            role="tablist"
            aria-label="Settings sections"
          >
            {(["Event", "Collaborators"] as Section[]).map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={section === s}
                onClick={() => setSection(s)}
                className={`flex-1 lg:w-full text-left px-3 py-2 rounded-md transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
                  section === s
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "Event" ? "Event details" : s}
              </button>
            ))}
          </nav>
        </aside>
        <section key={section} className="animate-in fade-in duration-200 ease-out">
          {section === "Event" && <EventDetailsPanel />}
          {section === "Collaborators" && <CollaboratorsPanel />}
        </section>
      </div>
    </AppLayout>
  );
}

function EventDetailsPanel() {
  const { data, setKind } = useWorkspaceData();
  const eventData = data.event;
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const guestEstimate = parseInt(formData.get("guestEstimate") as string, 10);
    const budget = parseInt(formData.get("budget") as string, 10);
    const newEvent = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      guestEstimate: Number.isNaN(guestEstimate) ? eventData.guestEstimate : guestEstimate,
      budget: Number.isNaN(budget) ? eventData.budget : budget,
    };
    setKind("event", newEvent);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="panel p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="eyebrow mb-1">Event details</div>
          <h2 className="serif text-2xl text-balance">{eventData.name}</h2>
        </div>
      </div>
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Event name"
            name="name"
            type="text"
            defaultValue={eventData.name}
            placeholder="e.g. Andra & Kirana"
          />
          <Field
            label="Event type"
            name="type"
            type="text"
            defaultValue={eventData.type}
            placeholder="e.g. Akad + Resepsi"
          />
          <Field label="Date" name="date" type="date" defaultValue={eventData.date} />
          <Field
            label="Location"
            name="location"
            type="text"
            defaultValue={eventData.location}
            placeholder="e.g. Bandung, ID"
          />
          <Field
            label="Estimated guests"
            name="guestEstimate"
            type="number"
            defaultValue={String(eventData.guestEstimate)}
            placeholder="e.g. 320"
          />
          <Field
            label="Estimated budget (Rp)"
            name="budget"
            type="number"
            defaultValue={String(eventData.budget)}
            placeholder="e.g. 425000000"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <QuietButton variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </QuietButton>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </label>
  );
}

type Invite = {
  id: string;
  token: string;
  role: string;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
};

function CollaboratorsPanel() {
  const list = useServerFn(listInvites);
  const create = useServerFn(createInvite);
  const revoke = useServerFn(revokeInvite);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await list();
      setInvites(res.invites as Invite[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      await create({ data: { role, expiresInDays: 14 } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    await revoke({ data: { id } });
    refresh();
  }

  function inviteUrl(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function copy(token: string, id: string) {
    await navigator.clipboard.writeText(inviteUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const active = invites.filter((i) => !i.revoked_at && !i.accepted_at);
  const used = invites.filter((i) => i.accepted_at || i.revoked_at);

  return (
    <div className="space-y-6">
      <div className="panel p-7">
        <div className="eyebrow mb-1">Collaborators</div>
        <h2 className="serif text-xl mb-2">Share access</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Generate a shareable invite link. Anyone with the link can join your workspace with the
          role you choose.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
              className="rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm"
            >
              <option value="editor">Editor — can edit anything</option>
              <option value="viewer">Viewer — read only</option>
            </select>
          </label>
          <QuietButton variant="primary" onClick={handleCreate} disabled={creating}>
            <LinkSimple size={16} />
            {creating ? "Creating…" : "Create invite link"}
          </QuietButton>
        </div>
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      </div>

      <div className="panel p-7">
        <h3 className="serif text-lg mb-4">Active invites</h3>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && active.length === 0 && (
          <p className="text-sm text-muted-foreground">No active invites yet.</p>
        )}
        <ul className="divide-y divide-border">
          {active.map((inv) => (
            <li key={inv.id} className="py-3 flex items-center gap-3 flex-wrap">
              <Pill tone="sage">{inv.role}</Pill>
              <code className="text-xs text-muted-foreground bg-surface-2 px-2 py-1 rounded truncate max-w-[260px]">
                {inviteUrl(inv.token)}
              </code>
              <span className="text-xs text-muted-foreground">
                expires{" "}
                {inv.expires_at
                  ? new Date(inv.expires_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })
                  : "never"}
              </span>
              <div className="ml-auto flex gap-2">
                <QuietButton onClick={() => copy(inv.token, inv.id)}>
                  {copiedId === inv.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === inv.id ? "Copied" : "Copy"}
                </QuietButton>
                <QuietButton onClick={() => handleRevoke(inv.id)}>Revoke</QuietButton>
              </div>
            </li>
          ))}
        </ul>

        {used.length > 0 && (
          <>
            <h3 className="serif text-lg mt-8 mb-3">History</h3>
            <ul className="divide-y divide-border text-sm text-muted-foreground">
              {used.map((inv) => (
                <li key={inv.id} className="py-2 flex items-center gap-3">
                  <Pill tone={inv.accepted_at ? "sage" : "warn"}>
                    {inv.accepted_at ? "Accepted" : "Revoked"}
                  </Pill>
                  <span>{inv.role}</span>
                  <span className="ml-auto text-xs">
                    {new Date(
                      inv.accepted_at ?? inv.revoked_at ?? inv.created_at,
                    ).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
