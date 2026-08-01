import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { acceptInvite, getInvite } from "@/lib/invites.functions";
import { resetWorkspaceDataCache } from "@/lib/use-workspace-data";
import { useServerFn } from "@tanstack/react-start";
import { GoogleLogo, Envelope, WarningCircle } from "@phosphor-icons/react";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "You're invited — offstories" },
      { name: "description", content: "Accept your invitation to plan a wedding together." },
    ],
  }),
  component: InvitePage,
});

const OAUTH_TIMEOUT_MS = 30_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const accept = useServerFn(acceptInvite);
  const get = useServerFn(getInvite);
  const [status, setStatus] = useState<"idle" | "signing" | "accepting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [pendingSignupEmail, setPendingSignupEmail] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  function clearOAuthTimer() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setSessionEmail(data.session?.user.email ?? null);
    });
  }, []);

  // Fetch invite metadata (addressed email + workspace name) when signed in.
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    get({ data: { token } })
      .then((inv) => {
        if (cancelled) return;
        setInviteEmail((inv as { email?: string | null }).email ?? null);
        setWorkspaceName(inv.workspaceName);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, token]);

  // Surface OAuth errors that land in the URL (e.g. cancelled consent).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error") || params.get("error_description");
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, []);

  // When sign-in completes, this fires on the opener tab and lets the
  // accept flow below run automatically.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        clearOAuthTimer();
        setStatus("idle");
        setError(null);
        setSignedIn(true);
        setSessionEmail(session.user.email ?? null);
      }
    });
    return () => {
      data.subscription.unsubscribe();
      clearOAuthTimer();
    };
  }, []);

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

  function storePendingToken() {
    sessionStorage.setItem("pending_invite_token", token);
  }

  async function handleGoogle() {
    setStatus("signing");
    setError(null);
    setNotice(null);
    storePendingToken();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
          scopes: "openid email profile",
        },
      });
      if (error) throw error;
    } catch (e) {
      sessionStorage.removeItem("pending_invite_token");
      setStatus("error");
      setError(
        e instanceof Error && e.message !== "The operation was aborted."
          ? e.message
          : "Google sign-in couldn't start. Allow pop-ups for this site and try again.",
      );
      return;
    }
    // Watchdog: reset the button if the popup is blocked, cancelled, or closed.
    timeoutRef.current = window.setTimeout(() => {
      sessionStorage.removeItem("pending_invite_token");
      setStatus("error");
      setError("Sign-in is taking too long. Make sure the Google window opened, then try again.");
    }, OAUTH_TIMEOUT_MS);
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) throw error;
        if (!data.session) {
          // Email confirmation is required; keep the message neutral.
          setPendingSignupEmail(email);
          setNotice(
            "We've sent a confirmation link to your email. Confirm it, then open this invitation again — you'll be added automatically.",
          );
          setStatus("idle");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error(
              "No account found for this email. Create one with the same email you were invited with, confirm it, then open this invite link again.",
            );
          }
          throw error;
        }
      }
    } catch (err) {
      sessionStorage.removeItem("pending_invite_token");
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    if (signedIn && sessionStorage.getItem("pending_invite_token") === token) {
      sessionStorage.removeItem("pending_invite_token");
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

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" aria-hidden />
              or
              <span className="flex-1 h-px bg-border" aria-hidden />
            </div>

            <button
              onClick={handleGoogle}
              disabled={status === "signing"}
              className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleLogo
                size={18}
                weight="bold"
                className={status === "signing" ? "animate-pulse" : undefined}
              />
              Continue with Google
            </button>
          </div>
        )}

        {signedIn === true && status !== "done" && (
          <div className="space-y-3">
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
                    ? `This invitation is for ${inviteEmail}. Sign in with that account to join.`
                    : `Welcome! You're signed in as ${sessionEmail ?? "your account"}.`}
                </span>
              </div>
            )}
            <button
              onClick={handleAccept}
              disabled={status === "accepting" || emailMismatch}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "accepting" ? "Joining…" : "Accept invitation"}
            </button>
          </div>
        )}

        {status === "done" && (
          <p className="text-sm text-[color:var(--sage)]">Welcome aboard. Redirecting…</p>
        )}

        {pendingSignupEmail && notice && (
          <p className="mt-4 rounded-md border border-[color:var(--sage)]/30 bg-[color:var(--sage)]/10 px-3 py-2.5 text-xs text-[color:var(--sage)]">
            {notice}
          </p>
        )}
        {notice && !pendingSignupEmail && (
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
