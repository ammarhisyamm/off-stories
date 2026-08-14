import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBrowserStorage } from "@/lib/browser-storage";
import { acceptInvite, getInvite, leaveWorkspace } from "@/lib/invites.functions";
import { getSessionUser, signIn, signOut, signUp } from "@/lib/auth.functions";
import { clearSessionCache } from "@/lib/session-cache";
import { resetWorkspaceDataCache } from "@/lib/use-workspace-data";
import { useServerFn } from "@tanstack/react-start";
import { Envelope, WarningCircle, SignOut } from "@phosphor-icons/react";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "You're invited — offstories" },
      { name: "description", content: "Accept your invitation to plan a wedding together." },
    ],
  }),
  component: InvitePage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const accept = useServerFn(acceptInvite);
  const get = useServerFn(getInvite);
  const leave = useServerFn(leaveWorkspace);
  const sessionRequest = useServerFn(getSessionUser);
  const signInRequest = useServerFn(signIn);
  const signUpRequest = useServerFn(signUp);
  const signOutRequest = useServerFn(signOut);
  const [status, setStatus] = useState<"idle" | "signing" | "accepting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionAvatar, setSessionAvatar] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [inviteLoaded, setInviteLoaded] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  function applySession(user: { email: string; displayName: string; avatarUrl: string | null } | null) {
    setSessionEmail(user?.email ?? null);
    setSessionName(user?.displayName ?? null);
    setSessionAvatar(user?.avatarUrl ?? null);
  }

  useEffect(() => {
    sessionRequest().then((user) => {
      setSignedIn(Boolean(user));
      applySession(user);
    });
  }, [sessionRequest]);

  // Invite metadata is public; account details are only used for membership actions.
  useEffect(() => {
    let cancelled = false;
    get({ data: { token } })
      .then((inv) => {
        if (cancelled) return;
        setInviteEmail((inv as { email?: string | null }).email ?? null);
        setWorkspaceName(inv.workspaceName);
        setIsMember((inv as { isMember?: boolean }).isMember ?? false);
        setMemberRole((inv as { memberRole?: string | null }).memberRole ?? null);
        setWorkspaceId((inv as { workspace_id?: string | null }).workspace_id ?? null);
        setInviteLoaded(true);
      })
      .catch((e) => {
        if (cancelled) return;
        setInviteLoaded(true);
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [get, token]);

  async function handleAccept() {
    setStatus("accepting");
    setError(null);
    try {
      await accept({ data: { token } });
      resetWorkspaceDataCache();
      setStatus("done");
      setTimeout(() => navigate({ to: "/dashboard" }), 1000);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to accept invite");
    }
  }

  async function handleSignOut() {
    setError(null);
    setNotice(null);
    try {
      await signOutRequest();
      clearSessionCache();
      setStatus("idle");
      setSignedIn(false);
      applySession(null);
      setIsMember(null);
      setMemberRole(null);
      setWorkspaceId(null);
      setInviteLoaded(false);
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }

  async function handleLeave() {
    if (!workspaceId) return;
    setLeaving(true);
    setError(null);
    try {
      await leave({ data: { workspaceId } });
      resetWorkspaceDataCache();
      setIsMember(false);
      setMemberRole(null);
      setConfirmLeave(false);
      setNotice("You've left this workspace. Redirecting to your own dashboard…");
      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLeaving(false);
    }
  }

  function storePendingToken() {
    getBrowserStorage("session").setItem("pending_invite_token", token);
  }

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("signing");
    setError(null);
    setNotice(null);

    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setError("Password must be at least 8 characters.");
      return;
    }

    storePendingToken();
    try {
      if (mode === "signup") {
        const user = await signUpRequest({ data: { email, password } });
        clearSessionCache();
        setSignedIn(true);
        applySession({ ...user, avatarUrl: null });
      } else {
        const user = await signInRequest({ data: { email, password } });
        clearSessionCache();
        setSignedIn(true);
        applySession({ ...user, avatarUrl: null });
      }
    } catch (err) {
      getBrowserStorage("session").removeItem("pending_invite_token");
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    if (signedIn && getBrowserStorage("session").getItem("pending_invite_token") === token) {
      getBrowserStorage("session").removeItem("pending_invite_token");
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, token]);

  const emailMismatch = Boolean(
    signedIn &&
    inviteEmail &&
    sessionEmail &&
    sessionEmail.toLowerCase() !== inviteEmail.toLowerCase(),
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-8 sm:p-10 text-center animate-in fade-in zoom-in-97 duration-300 ease-out">
        <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--rose)]/15 text-[color:var(--rose)]">
          <Envelope size={22} weight="duotone" />
        </div>
        <div className="eyebrow mb-2">Invitation</div>
        <h1 className="serif text-3xl mb-3 text-foreground text-balance">You're invited</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {workspaceName
            ? `You've been invited to plan "${workspaceName}" together in offstories.`
            : "You've been invited to plan a wedding preparation workspace together."}
          {inviteEmail ? (
            <>
              {" "}
              <span className="text-foreground">Sent to {inviteEmail}</span>
            </>
          ) : null}
        </p>

        {signedIn === null && <p className="text-sm text-muted-foreground">Loading…</p>}

        {signedIn === false && (
          <div className="text-left">
            <form onSubmit={handleEmail} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">
                  {mode === "signup" ? "Create with your email" : "Email"}
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Password</span>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={8}
                  required
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </label>
              <button
                type="submit"
                disabled={status === "signing"}
                className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "signing"
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account & accept"
                    : "Sign in to accept"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setNotice(null);
                    }}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Create one
                  </button>{" "}
                  (use the same email you were invited with).
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                      setNotice(null);
                    }}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

          </div>
        )}

        {signedIn === true && status !== "done" && (
          <div className="space-y-3">
            {/* Which account is signed in right now */}
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface-2/50 p-3 text-left">
              {sessionAvatar ? (
                <img src={sessionAvatar} alt="" className="h-9 w-9 shrink-0 rounded-full" />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-full bg-[color:var(--sage)]/20 grid place-items-center text-sm text-[color:var(--sage)] font-semibold">
                  {sessionName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium text-foreground">
                  {sessionName ?? sessionEmail}
                </div>
                <div className="truncate text-xs text-muted-foreground">{sessionEmail}</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={status === "accepting" || leaving}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition duration-150 hover:bg-surface-2 hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SignOut size={13} />
                Switch
              </button>
            </div>

            {inviteEmail && (
              <div
                className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-left text-xs ${
                  emailMismatch
                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                    : "border-[color:var(--sage)]/30 bg-[color:var(--sage)]/10 text-[color:var(--sage)]"
                }`}
              >
                <WarningCircle size={15} className="mt-0.5 shrink-0" weight="fill" />
                <span>
                  {emailMismatch
                    ? `This invitation is for ${inviteEmail}, but you're signed in as ${sessionEmail ?? "this account"}. Use Switch above to sign in with the invited email.`
                    : `This invitation was sent to ${inviteEmail}. You're signed in as ${sessionEmail ?? "your account"}.`}
                </span>
              </div>
            )}

            {isMember ? (
              memberRole === "owner" ? (
                <p className="text-sm text-muted-foreground">
                  You're the owner of this workspace, so there's nothing to join.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You're already part of this workspace.
                  </p>
                  {confirmLeave ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmLeave(false)}
                        disabled={leaving}
                        className="flex-1 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 active:scale-[0.99] disabled:opacity-60"
                      >
                        Keep me in
                      </button>
                      <button
                        type="button"
                        onClick={handleLeave}
                        disabled={leaving}
                        className="flex-1 rounded-md bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground transition duration-150 hover:bg-destructive/90 active:scale-[0.99] disabled:opacity-60"
                      >
                        {leaving ? "Leaving…" : "Leave workspace"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmLeave(true)}
                      disabled={leaving}
                      className="w-full rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition duration-150 hover:bg-destructive/10 active:scale-[0.99]"
                    >
                      Leave this workspace
                    </button>
                  )}
                </div>
              )
            ) : inviteLoaded ? (
              <button
                onClick={handleAccept}
                disabled={status === "accepting" || emailMismatch}
                className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "accepting" ? "Joining…" : "Accept invitation"}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">Checking your invitation…</p>
            )}
          </div>
        )}

        {status === "done" && (
          <p className="text-sm text-[color:var(--sage)]">Welcome aboard. Redirecting…</p>
        )}

        {notice && (
          <p className="mt-4 rounded-md border border-[color:var(--sage)]/30 bg-[color:var(--sage)]/10 px-3 py-2.5 text-xs text-[color:var(--sage)]">
            {notice}
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-left text-xs text-destructive"
          >
            <WarningCircle size={15} className="mt-0.5 shrink-0" weight="fill" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
