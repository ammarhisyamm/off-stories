import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoogleLogo, Sparkle, WarningCircle } from "@phosphor-icons/react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Wedding Preparation" },
      { name: "description", content: "Sign in to your wedding preparation workspace." },
    ],
  }),
  component: AuthPage,
});

const OAUTH_TIMEOUT_MS = 30_000;

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  function clearOAuthTimer() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  // Surface OAuth errors that land in the URL (e.g. cancelled consent).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error") || params.get("error_description");
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, []);

  // If sign-in completes (via popup message), reset the button state.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        clearOAuthTimer();
        setLoading(false);
        setError(null);
        navigate({ to: "/dashboard" });
      }
    });
    return () => {
      data.subscription.unsubscribe();
      clearOAuthTimer();
    };
  }, [navigate]);

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          scopes: "openid email profile https://www.googleapis.com/auth/calendar.events",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(
        e instanceof Error && e.message !== "The operation was aborted."
          ? e.message
          : "Google sign-in couldn't start. Allow pop-ups for this site and try again.",
      );
      setLoading(false);
      return;
    }
    // Watchdog: if the popup is blocked, cancelled, or closed before finishing,
    // reset the button so the user can retry instead of staying stuck.
    timeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      setError("Sign-in is taking too long. Make sure the Google window opened, then try again.");
    }, OAUTH_TIMEOUT_MS);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-10 text-center">
        <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
          <Sparkle size={22} weight="duotone" />
        </div>
        <div className="eyebrow mb-2">offstories</div>
        <h1 className="serif text-3xl mb-3 text-foreground text-balance">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to plan your wedding, invite collaborators, and sync your timeline to Google
          Calendar.
        </p>
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleLogo size={18} weight="bold" className={loading ? "animate-pulse" : undefined} />
          {loading ? "Opening Google…" : "Continue with Google"}
        </button>
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-left text-xs text-destructive"
          >
            <WarningCircle size={15} className="mt-0.5 shrink-0" weight="fill" />
            <span>{error}</span>
          </div>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          We request calendar access so you can sync milestones to Google Calendar later. You can
          revoke it any time.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
