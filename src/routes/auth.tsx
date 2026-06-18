import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { GoogleLogo, Sparkle } from "@phosphor-icons/react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Wedding Preparation" },
      { name: "description", content: "Sign in to your wedding preparation workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function signIn() {
    setLoading(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        scope:
          "openid email profile https://www.googleapis.com/auth/calendar.events",
        access_type: "offline",
        prompt: "consent",
      },
    });
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-10 text-center">
        <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
          <Sparkle size={22} weight="duotone" />
        </div>
        <div className="eyebrow mb-2">Wedding Preparation</div>
        <h1 className="serif text-3xl mb-3 text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to plan your wedding, invite collaborators, and sync your timeline to Google Calendar.
        </p>
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 disabled:opacity-60"
        >
          <GoogleLogo size={18} weight="bold" />
          {loading ? "Opening Google…" : "Continue with Google"}
        </button>
        {error && (
          <p className="mt-4 text-xs text-destructive">{error}</p>
        )}
        <p className="mt-6 text-[11px] text-muted-foreground">
          We request calendar access so you can sync milestones to Google Calendar later. You can revoke it any time.
        </p>
      </div>
    </div>
  );
}
