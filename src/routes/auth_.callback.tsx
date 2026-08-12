import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSessionUser } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { Sparkle } from "@phosphor-icons/react";

export const Route = createFileRoute("/auth_/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const getSession = useServerFn(getSessionUser);

  useEffect(() => {
    getSession().then((user) => {
      navigate({ to: user ? "/dashboard" : "/auth", replace: true });
    });
  }, [getSession, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="mx-auto mb-6 grid h-12 w-12 animate-pulse place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
        <Sparkle size={22} weight="duotone" className="animate-spin-slow" />
      </div>
      <h1 className="serif text-2xl text-foreground mb-2">Signing you in...</h1>
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
