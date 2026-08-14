import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCachedSessionUser } from "@/lib/session-cache";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await getCachedSessionUser();
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
