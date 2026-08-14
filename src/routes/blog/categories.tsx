import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/categories")({
  component: () => <Outlet />,
});
