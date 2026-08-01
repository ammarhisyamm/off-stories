import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkle } from "@phosphor-icons/react";

export const Route = createFileRoute("/auth_/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for Supabase to process the OAuth callback hash
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: "/dashboard", replace: true });
      }
    });

    // Also check if we already have a session just in case the event fired before we mounted
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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
