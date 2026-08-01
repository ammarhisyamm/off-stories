import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { acceptInvite } from "@/lib/invites.functions";
import { useServerFn } from "@tanstack/react-start";
import { GoogleLogo, Envelope, WarningCircle } from "@phosphor-icons/react";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "You're invited — Wedding Preparation" },
      { name: "description", content: "Accept your invitation to a wedding workspace." },
    ],
  }),
  component: InvitePage,
});

const OAUTH_TIMEOUT_MS = 30_000;

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const accept = useServerFn(acceptInvite);
  const [status, setStatus] = useState<"idle" | "signing" | "accepting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
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
    });
  }, []);

  // Surface OAuth errors that land in the URL (e.g. cancelled consent).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error") || params.get("error_description");
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, []);

  // When the popup sign-in completes, this fires on the opener tab and lets the
  // accept flow below run automatically.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        clearOAuthTimer();
        setStatus("idle");
        setError(null);
        setSignedIn(true);
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
      setStatus("done");
      setTimeout(() => navigate({ to: "/dashboard" }), 1000);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to accept invite");
    }
  }

  async function handleSignIn() {
    setStatus("signing");
    setError(null);
    sessionStorage.setItem("pending_invite_token", token);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
          scopes: "openid email profile https://www.googleapis.com/auth/calendar.events",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
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

  useEffect(() => {
    if (signedIn && sessionStorage.getItem("pending_invite_token") === token) {
      sessionStorage.removeItem("pending_invite_token");
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-10 text-center animate-in fade-in zoom-in-97 duration-300 ease-out">
        <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--rose)]/15 text-[color:var(--rose)]">
          <Envelope size={22} weight="duotone" />
        </div>
        <div className="eyebrow mb-2">Invitation</div>
        <h1 className="serif text-3xl mb-3 text-foreground text-balance">You're invited</h1>
        <p className="text-sm text-muted-foreground mb-8">
          You've been invited to collaborate on a wedding preparation workspace.
        </p>

        {signedIn === null && <p className="text-sm text-muted-foreground">Loading…</p>}

        {signedIn === false && (
          <button
            onClick={handleSignIn}
            disabled={status === "signing"}
            className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleLogo size={18} weight="bold" className={status === "signing" ? "animate-pulse" : undefined} />
            {status === "signing" ? "Opening Google…" : "Sign in with Google to accept"}
          </button>
        )}

        {signedIn === true && status !== "done" && (
          <button
            onClick={handleAccept}
            disabled={status === "accepting"}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "accepting" ? "Joining…" : "Accept invitation"}
          </button>
        )}

        {status === "done" && (
          <p className="text-sm text-[color:var(--sage)]">Welcome aboard. Redirecting…</p>
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
