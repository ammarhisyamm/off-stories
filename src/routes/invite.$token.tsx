import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { acceptInvite } from "@/lib/invites.functions";
import { useServerFn } from "@tanstack/react-start";
import { GoogleLogo, Envelope } from "@phosphor-icons/react";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "You're invited — Wedding Preparation" },
      { name: "description", content: "Accept your invitation to a wedding workspace." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const accept = useServerFn(acceptInvite);
  const [status, setStatus] = useState<"idle" | "signing" | "accepting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
    });
  }, []);

  async function handleAccept() {
    setStatus("accepting");
    setError(null);
    try {
      await accept({ data: { token } });
      setStatus("done");
      setTimeout(() => navigate({ to: "/" }), 1000);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to accept invite");
    }
  }

  async function handleSignIn() {
    setStatus("signing");
    sessionStorage.setItem("pending_invite_token", token);
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
    if (error) {
      setStatus("error");
      setError(error.message ?? "Sign-in failed");
    }
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
      <div className="w-full max-w-md panel p-10 text-center">
        <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--rose)]/15 text-[color:var(--rose)]">
          <Envelope size={22} weight="duotone" />
        </div>
        <div className="eyebrow mb-2">Invitation</div>
        <h1 className="serif text-3xl mb-3 text-foreground">You're invited</h1>
        <p className="text-sm text-muted-foreground mb-8">
          You've been invited to collaborate on a wedding preparation workspace.
        </p>

        {signedIn === null && <p className="text-sm text-muted-foreground">Loading…</p>}

        {signedIn === false && (
          <button
            onClick={handleSignIn}
            disabled={status === "signing"}
            className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 disabled:opacity-60"
          >
            <GoogleLogo size={18} weight="bold" />
            Sign in with Google to accept
          </button>
        )}

        {signedIn === true && status !== "done" && (
          <button
            onClick={handleAccept}
            disabled={status === "accepting"}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {status === "accepting" ? "Joining…" : "Accept invitation"}
          </button>
        )}

        {status === "done" && (
          <p className="text-sm text-[color:var(--sage)]">Welcome aboard. Redirecting…</p>
        )}

        {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
