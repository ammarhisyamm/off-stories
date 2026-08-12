import { createMiddleware } from "@tanstack/react-start";
import { requireCurrentUser } from "@/lib/auth.server";

export const requireCloudflareAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = await requireCurrentUser();
  return next({ context: { userId: user.id, user } });
});
