import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import {
  listInvites,
  invitePartner,
  revokeInvite,
  listMembers,
  removePartner,
} from "@/lib/invites.functions";
import { showToast } from "@/components/toast";
import { Check, WarningCircle } from "@phosphor-icons/react";

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
  email: string | null;
  role: string;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
};

type Member = {
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

function CollaboratorsPanel() {
  const list = useServerFn(listInvites);
  const create = useServerFn(invitePartner);
  const revoke = useServerFn(revokeInvite);
  const members = useServerFn(listMembers);
  const remove = useServerFn(removePartner);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);

  async function fetchState() {
    const [inv, mem] = await Promise.all([list(), members()]);
    setInvites(inv.invites as Invite[]);
    setMemberList((mem.members ?? []) as Member[]);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await fetchState();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    setCreating(true);
    setError(null);
    try {
      const created = await create({ data: { email: target } });
      const optimistic: Invite = {
        id: created.id,
        token: created.token,
        email: created.email ?? target,
        role: created.role ?? "editor",
        created_at: created.created_at ?? new Date().toISOString(),
        expires_at: created.expires_at ?? null,
        accepted_at: null,
        revoked_at: null,
      };
      setInvites((prev) => [optimistic, ...prev]);
      setEmail("");
      showToast("Invitation sent to your partner");
      fetchState().catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setError(null);
    try {
      await revoke({ data: { id } });
      setInvites((prev) =>
        prev.map((i) => (i.id === id ? { ...i, revoked_at: new Date().toISOString() } : i)),
      );
      showToast("Invitation cancelled");
      fetchState().catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleRemove(member: Member) {
    setRemoving(true);
    setError(null);
    try {
      await remove({ data: { userId: member.user_id } });
      setMemberList((prev) => prev.filter((m) => m.user_id !== member.user_id));
      setConfirmRemove(null);
      showToast("Partner removed");
      fetchState().catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRemoving(false);
    }
  }

  const active = invites.filter((i) => !i.revoked_at && !i.accepted_at);
  const partner = memberList.find((m) => m.role !== "owner");

  return (
    <div className="space-y-6">
      <div className="panel p-7">
        <div className="eyebrow mb-1">Collaborators</div>
        <h2 className="serif text-xl mb-2">Your partner</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Invite your partner by email so you can plan together. They'll join as an editor — only
          one partner per workspace.
        </p>

        {partner ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 p-4">
            {partner.profiles?.avatar_url ? (
              <img src={partner.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[color:var(--sage)]/20 grid place-items-center text-sm text-[color:var(--sage)] font-semibold">
                {(partner.profiles?.display_name ??
                  partner.profiles?.email ??
                  "P")?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground truncate">
                {partner.profiles?.display_name ?? partner.profiles?.email ?? "Your partner"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {partner.profiles?.email} · joined{" "}
                {new Date(partner.joined_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
            <Pill tone="sage">Editor</Pill>
            {confirmRemove?.user_id === partner.user_id ? (
              <div className="flex items-center gap-2">
                <QuietButton onClick={() => setConfirmRemove(null)}>Cancel</QuietButton>
                <QuietButton variant="primary" onClick={() => handleRemove(partner)}>
                  Remove
                </QuietButton>
              </div>
            ) : (
              <QuietButton onClick={() => setConfirmRemove(partner)}>Remove</QuietButton>
            )}
          </div>
        ) : active.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-2/50 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--taupe)]/15 text-[color:var(--taupe)]">
              <WarningCircle size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">
                Invitation sent to {active[0].email}
              </div>
              <div className="text-xs text-muted-foreground">
                Waiting for them to accept by signing in with that email.
              </div>
            </div>
            <QuietButton onClick={() => handleRevoke(active[0].id)}>Cancel</QuietButton>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
            <label className="block min-w-0 flex-1">
              <span className="block text-sm font-medium mb-1.5">Partner's email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. partner@example.com"
                required
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </label>
            <QuietButton variant="primary" type="submit" disabled={creating}>
              {creating ? "Sending…" : "Invite your partner"}
            </QuietButton>
          </form>
        )}
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
            <WarningCircle size={15} className="mt-0.5 shrink-0" weight="fill" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {!partner && active.length === 0 && (
        <div className="panel p-7">
          <h3 className="serif text-lg mb-2">How it works</h3>
          <p className="text-sm text-muted-foreground">
            You'll get a shareable link for your partner's email. They create an account with that
            same email, confirm it, and open the link — then you're planning together.
          </p>
        </div>
      )}

      {invites.filter((i) => i.accepted_at || i.revoked_at).length > 0 && (
        <div className="panel p-7">
          <h3 className="serif text-lg mb-3">History</h3>
          <ul className="divide-y divide-border text-sm text-muted-foreground">
            {invites
              .filter((i) => i.accepted_at || i.revoked_at)
              .map((inv) => (
                <li key={inv.id} className="py-2 flex items-center gap-3">
                  <Pill tone={inv.accepted_at ? "sage" : "warn"}>
                    {inv.accepted_at ? "Accepted" : "Revoked"}
                  </Pill>
                  <span>{inv.email}</span>
                  <span className="ml-auto text-xs">
                    {new Date(
                      inv.accepted_at ?? inv.revoked_at ?? inv.created_at,
                    ).toLocaleDateString()}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {partner && confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="serif text-xl mb-2">Remove partner?</h3>
            <p className="text-sm text-muted-foreground">
              {confirmRemove.profiles?.email ?? "Your partner"} will lose access to this workspace.
              They can still sign in with their own account.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <QuietButton onClick={() => setConfirmRemove(null)}>Cancel</QuietButton>
              <button
                type="button"
                onClick={() => handleRemove(confirmRemove)}
                disabled={removing}
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition duration-150 hover:bg-destructive/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:pointer-events-none"
              >
                <Check size={15} /> {removing ? "Removing…" : "Remove partner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
