import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { event, milestones } from "@/lib/mock-data";
import { eventStore } from "@/lib/stores";
import { listInvites, createInvite, revokeInvite } from "@/lib/invites.functions";
import {
  getCalendarSyncStatus,
  syncMilestonesToCalendar,
  clearCalendarSync,
} from "@/lib/calendar.functions";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, GoogleLogo, ArrowsClockwise, LinkSimple } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Wedding Preparation" },
      { name: "description", content: "Event details, collaborators, and calendar sync." },
    ],
  }),
  component: Settings,
});

type Section = "Event" | "Collaborators" | "Calendar";

function Settings() {
  const [section, setSection] = useState<Section>("Event");
  return (
    <AppLayout eyebrow="Workspace" title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <aside>
          <nav className="panel p-2 text-sm">
            {(["Event", "Collaborators", "Calendar"] as Section[]).map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`w-full text-left px-3 py-2 rounded-md ${
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
        <section>
          {section === "Event" && <EventDetailsPanel />}
          {section === "Collaborators" && <CollaboratorsPanel />}
          {section === "Calendar" && <CalendarPanel />}
        </section>
      </div>
    </AppLayout>
  );
}

function EventDetailsPanel() {
  const [eventData, setEventData] = useState<typeof event>(() => eventStore.load());
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
    setEventData(newEvent);
    eventStore.save(newEvent);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="panel p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="eyebrow mb-1">Event details</div>
          <h2 className="serif text-2xl">{eventData.name}</h2>
        </div>
      </div>
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Event name" name="name" type="text" defaultValue={eventData.name} placeholder="e.g. Andra & Kirana" />
          <Field label="Event type" name="type" type="text" defaultValue={eventData.type} placeholder="e.g. Akad + Resepsi" />
          <Field label="Date" name="date" type="date" defaultValue={eventData.date} />
          <Field label="Location" name="location" type="text" defaultValue={eventData.location} placeholder="e.g. Bandung, ID" />
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
      <span className="eyebrow block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
        <h2 className="serif text-2xl mb-2">Share access</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Generate a shareable invite link. Anyone with the link can join your workspace with the
          role you choose.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="eyebrow block mb-1.5">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
              className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm"
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

function CalendarPanel() {
  const getStatus = useServerFn(getCalendarSyncStatus);
  const sync = useServerFn(syncMilestonesToCalendar);
  const clear = useServerFn(clearCalendarSync);
  const [synced, setSynced] = useState<
    Array<{
      milestone_key: string;
      title: string | null;
      synced_at: string;
      event_date: string | null;
    }>
  >([]);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [busy, setBusy] = useState<null | "sync" | "clear">(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setHasToken(Boolean(data.session?.provider_token));
    const res = await getStatus();
    setSynced(res.synced as typeof synced);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSync() {
    setBusy("sync");
    setMessage(null);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.provider_token;
      if (!token) {
        setError(
          "No Google access token. Sign out and sign in again to grant calendar permission.",
        );
        return;
      }
      const res = await sync({ data: { providerToken: token } });
      setMessage(
        `Synced ${res.results.length} of ${res.total} milestones${
          res.errors.length ? ` (${res.errors.length} failed)` : ""
        }.`,
      );
      if (res.errors[0]) setError(res.errors[0].error);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleClear() {
    setBusy("clear");
    await clear();
    setMessage("Local sync log cleared. Existing events remain in Google Calendar.");
    await refresh();
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <div className="panel p-7">
        <div className="eyebrow mb-1">Google Calendar</div>
        <h2 className="serif text-2xl mb-2">Sync your wedding timeline</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Push all {milestones.length} milestones into your primary Google Calendar as all-day
          events. Re-syncing updates existing events instead of duplicating them.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <QuietButton variant="primary" onClick={handleSync} disabled={busy === "sync"}>
            <GoogleLogo size={16} weight="bold" />
            {busy === "sync" ? "Syncing…" : "Sync timeline to Google Calendar"}
          </QuietButton>
          {synced.length > 0 && (
            <QuietButton onClick={handleClear} disabled={busy === "clear"}>
              <ArrowsClockwise size={14} />
              Reset sync log
            </QuietButton>
          )}
          {!hasToken && (
            <span className="text-xs text-muted-foreground">
              No calendar token in session — sign out & in again to grant calendar permission.
            </span>
          )}
        </div>

        {message && <p className="mt-4 text-xs text-[color:var(--sage)]">{message}</p>}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      <div className="panel p-7">
        <h3 className="serif text-lg mb-4">Synced milestones</h3>
        {synced.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing synced yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {synced.map((s) => (
              <li key={s.milestone_key} className="py-2 flex items-center gap-3">
                <Check size={14} className="text-[color:var(--sage)]" />
                <span className="flex-1 text-foreground truncate">{s.title}</span>
                <span className="text-xs text-muted-foreground">
                  {s.event_date &&
                    new Date(s.event_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
