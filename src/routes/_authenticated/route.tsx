import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { clearSessionCache, getCachedSessionUser } from "@/lib/session-cache";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
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
