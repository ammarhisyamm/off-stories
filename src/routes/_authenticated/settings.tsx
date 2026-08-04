import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { useWorkspaceData, resetWorkspaceDataCache } from "@/lib/use-workspace-data";
import {
  listInvites,
  invitePartner,
  revokeInvite,
  listMembers,
  removePartner,
  leaveWorkspace,
} from "@/lib/invites.functions";
import { getBrowserStorage } from "@/lib/browser-storage";
import { showToast } from "@/components/toast";
import { ArrowRight, Check, MagicWand, WarningCircle } from "@phosphor-icons/react";

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
      <div className="mx-auto max-w-3xl">
        <nav
          className="panel p-1 flex gap-1 text-sm"
          role="tablist"
          aria-label="Settings sections"
        >
          {(["Event", "Collaborators"] as Section[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={section === s}
              onClick={() => setSection(s)}
              className={`flex-1 px-3 py-2 rounded-md text-center transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
                section === s
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "Event" ? "Event details" : s}
            </button>
          ))}
        </nav>
        <section key={section} className="mt-6 animate-in fade-in duration-200 ease-out">
          {section === "Event" && <EventDetailsPanel />}
          {section === "Collaborators" && <CollaboratorsPanel />}
        </section>
      </div>
    </AppLayout>
  );
}

function EventDetailsPanel() {
  const navigate = useNavigate();
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

  function previewOnboarding() {
    getBrowserStorage("session").setItem("offstories-onboarding-preview", "true");
    navigate({ to: "/dashboard" });
  }

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
      <div className="mt-8 flex flex-col gap-4 rounded-[20px] border border-[#e8e8e8] bg-[#fafafa] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#444444] shadow-[0_1px_2px_rgb(15_23_42_/_0.04)]">
            <MagicWand size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">Try the onboarding flow</div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Preview the template selection and smart wedding setup without deleting your current
              workspace.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={previewOnboarding}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[14px] border border-[#e2e2e2] bg-white px-4 py-2.5 text-sm font-medium text-[#333333] transition duration-200 hover:bg-[#f6f6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          Choose a template <ArrowRight size={16} />
        </button>
      </div>
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

function MemberAvatar({ member, fallback }: { member: Member; fallback: string }) {
  if (member.profiles?.avatar_url) {
    return <img src={member.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full" />;
  }
  return (
    <div className="h-10 w-10 rounded-full bg-[color:var(--sage)]/20 grid place-items-center text-sm text-[color:var(--sage)] font-semibold">
      {(member.profiles?.display_name ?? member.profiles?.email ?? fallback)?.[0]?.toUpperCase()}
    </div>
  );
}

function CollaboratorsPanel() {
  const navigate = useNavigate();
  const list = useServerFn(listInvites);
  const create = useServerFn(invitePartner);
  const revoke = useServerFn(revokeInvite);
  const members = useServerFn(listMembers);
  const remove = useServerFn(removePartner);
  const leave = useServerFn(leaveWorkspace);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [role, setRole] = useState<"owner" | "editor" | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  async function fetchState() {
    const [inv, mem] = await Promise.all([list(), members()]);
    setInvites(inv.invites as Invite[]);
    setMemberList((mem.members ?? []) as Member[]);
    setRole((mem.role as "owner" | "editor" | null) ?? null);
    setWorkspaceId(mem.workspaceId ?? null);
    setWorkspaceName(mem.workspaceName ?? null);
    setMyId(mem.myId ?? null);
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

  async function handleLeave() {
    if (!workspaceId) return;
    setLeaving(true);
    setError(null);
    try {
      await leave({ data: { workspaceId } });
      resetWorkspaceDataCache();
      setConfirmLeave(false);
      showToast("You left the workspace");
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLeaving(false);
    }
  }

  const active = invites.filter((i) => !i.revoked_at && !i.accepted_at);
  const partner = memberList.find((m) => m.role !== "owner");

  const memberRow = (m: Member) => {
    const name = m.profiles?.display_name ?? m.profiles?.email ?? "Member";
    return (
      <li key={m.user_id} className="py-3 flex items-center gap-3">
        <MemberAvatar member={m} fallback="M" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">
            {name}
            {m.user_id === myId && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {m.profiles?.email} · joined{" "}
            {new Date(m.joined_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
        <Pill tone={m.role === "owner" ? "neutral" : "sage"}>
          {m.role === "owner" ? "Owner" : "Editor"}
        </Pill>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {role === "editor" ? (
        <div className="panel p-7">
          <div className="eyebrow mb-1">Collaborators</div>
          <h2 className="serif text-xl mb-2">{workspaceName ?? "Your workspace"}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You're an editor in this workspace. You can leave at any time, or the owner can remove
            you.
          </p>
          <ul className="divide-y divide-border">{memberList.map(memberRow)}</ul>
          <div className="mt-6 border-t border-border pt-5">
            {confirmLeave ? (
              <div className="flex flex-wrap items-center gap-2">
                <QuietButton onClick={() => setConfirmLeave(false)}>Cancel</QuietButton>
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={leaving}
                  className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition duration-150 hover:bg-destructive/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:pointer-events-none"
                >
                  {leaving ? "Leaving…" : "Leave workspace"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition duration-150 hover:bg-destructive/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Leave workspace
              </button>
            )}
          </div>
        </div>
      ) : role === "owner" ? (
        <>
          <div className="panel p-7">
            <div className="eyebrow mb-1">Collaborators</div>
            <h2 className="serif text-xl mb-2">Your partner</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Invite your partner by email so you can plan together. They'll join as an editor —
              only one partner per workspace.
            </p>

            {partner ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 p-4">
                {partner.profiles?.avatar_url ? (
                  <img
                    src={partner.profiles.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                    placeholder="e.g. partner@example.com"
                    required
                    autoComplete="off"
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </label>
                <QuietButton variant="primary" type="submit" disabled={creating || !email.trim()}>
                  {creating ? "Sending…" : "Invite your partner"}
                </QuietButton>
              </form>
            )}
          </div>

          {!partner && active.length === 0 && (
            <div className="panel p-7">
              <h3 className="serif text-lg mb-2">How it works</h3>
              <p className="text-sm text-muted-foreground">
                You'll get a shareable link for your partner's email. They create an account with
                that same email, confirm it, and open the link — then you're planning together.
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
        </>
      ) : (
        <>
          {loading && role === null && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && role === null && (
            <div className="panel p-7">
              <p className="text-sm text-muted-foreground">You're not part of any workspace yet.</p>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          <WarningCircle size={15} className="mt-0.5 shrink-0" weight="fill" />
          <span>{error}</span>
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
