import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoogleLogo, Sparkle, WarningCircle } from "@phosphor-icons/react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — offstories" },
      { name: "description", content: "Sign in to your wedding preparation workspace." },
    ],
  }),
  component: AuthPage,
});

const OAUTH_TIMEOUT_MS = 30_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          scopes: "openid email profile",
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

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice(
            "Check your email for a confirmation link, then sign in. If you don't see it, check spam.",
          );
        } else {
          navigate({ to: "/dashboard" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message === "Invalid login credentials" ? "Incorrect email or password." : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
            <Sparkle size={22} weight="duotone" />
          </div>
          <div className="eyebrow mb-2">offstories</div>
          <h1 className="serif text-3xl text-foreground text-balance">
            {mode === "signin" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            {mode === "signin"
              ? "Sign in to plan your wedding and invite collaborators."
              : "Set up a free account to start planning your wedding."}
          </p>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px bg-border" aria-hidden />
          or
          <span className="flex-1 h-px bg-border" aria-hidden />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleLogo size={18} weight="bold" className={loading ? "animate-pulse" : undefined} />
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setNotice(null);
                }}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Create an account
              </button>
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
