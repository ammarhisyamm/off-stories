import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { clearSessionCache, getCachedSessionUser } from "@/lib/session-cache";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  errorComponent: ({ reset }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          We couldn&apos;t load this workspace page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your saved plans are safe. Try the page again or return to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  ),
  beforeLoad: async () => {
    let user;
    try {
      user = await getCachedSessionUser();
    } catch {
      clearSessionCache();
      throw redirect({ to: "/auth" });
    }
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
