import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/id/tools")({
  component: () => <Outlet />,
});
