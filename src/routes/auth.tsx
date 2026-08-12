import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Eye, EyeSlash, GoogleLogo, WarningCircle } from "@phosphor-icons/react";
import { useServerFn } from "@tanstack/react-start";
import { BrandLogo } from "@/components/brand-logo";
import { getSessionUser, signIn, signUp, startGoogleSignIn } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in, offstories" },
      { name: "description", content: "Sign in to your wedding preparation workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const sessionUser = useServerFn(getSessionUser);
  const signInFn = useServerFn(signIn);
  const signUpFn = useServerFn(signUp);
  const startGoogleFn = useServerFn(startGoogleSignIn);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordLengthOk = password.length >= 8;
  const passwordLowercaseOk = /[a-z]/.test(password);
  const passwordUppercaseOk = /[A-Z]/.test(password);
  const passwordNumberOk = /\d/.test(password);
  const passwordOk =
    passwordLengthOk && passwordLowercaseOk && passwordUppercaseOk && passwordNumberOk;

  function PasswordRequirment({ ok, label }: { ok: boolean; label: string }) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${ok ? "text-foreground" : "text-muted-foreground"}`}
      >
        <Check size={12} weight="bold" className={ok ? "text-primary" : "opacity-30"} />
        {label}
      </span>
    );
  }

  useEffect(() => {
    sessionUser()
      .then((user) => {
        if (user) navigate({ to: "/dashboard", replace: true });
      })
      .catch(() => {});
  }, [navigate, sessionUser]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const action = mode === "signup" ? signUpFn : signInFn;
      if (mode === "signup" && !passwordOk) {
        setError("Password does not meet all requirements.");
        return;
      }
      await action({ data: { email, password } });
      navigate({ to: "/dashboard", replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const { url } = await startGoogleFn();
      window.location.assign(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Google sign-in is unavailable.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md panel p-8 sm:p-10">
        <div className="text-center mb-8">
          <BrandLogo className="mx-auto mb-6 justify-center scale-[0.9]" />
          <h1 className="serif text-3xl text-foreground text-balance">
            {mode === "signin" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            {mode === "signin"
              ? "Sign in to plan your wedding with your partner."
              : "Set up a free account to start planning your wedding."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={8}
                required
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 pr-10 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5 text-xs">
              <PasswordRequirment ok={passwordLengthOk} label="8+ characters" />
              <PasswordRequirment ok={passwordLowercaseOk} label="lowercase" />
              <PasswordRequirment ok={passwordUppercaseOk} label="uppercase" />
              <PasswordRequirment ok={passwordNumberOk} label="a number" />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          or
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleLogo size={18} weight="bold" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === "signin" ? "signup" : "signin"));
              setError(null);
            }}
            className="underline underline-offset-2 hover:text-foreground"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
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
