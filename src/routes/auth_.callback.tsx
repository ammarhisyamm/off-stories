import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeGoogleSignIn } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { Sparkle } from "@phosphor-icons/react";

export const Route = createFileRoute("/auth_/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const completeGoogle = useServerFn(completeGoogleSignIn);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
      setError("Google sign-in was cancelled or the callback was incomplete.");
      return;
    }
    completeGoogle({ data: { code, state } })
      .then(() => navigate({ to: "/dashboard", replace: true }))
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Google sign-in failed."),
      );
  }, [completeGoogle, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="mx-auto mb-6 grid h-12 w-12 animate-pulse place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
        <Sparkle size={22} weight="duotone" className="animate-spin-slow" />
      </div>
      <h1 className="serif text-2xl text-foreground mb-2">Signing you in...</h1>
      <p className="text-sm text-muted-foreground">{error ?? "Please wait a moment."}</p>
      {error && (
        <a href="/auth" className="mt-4 text-sm text-primary underline underline-offset-2">
          Back to sign in
        </a>
      )}
    </div>
  );
}
