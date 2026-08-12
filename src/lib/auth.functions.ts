import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  randomId,
  verifyPassword,
} from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const getSessionUser = createServerFn({ method: "GET" }).handler(() => getCurrentUser());

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((data) => credentialsSchema.parse(data))
  .handler(async ({ data }) => {
    const database = getDatabase();
    const existing = await database
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(data.email)
      .first<{ id: string }>();
    if (existing) throw new Error("An account already exists for this email. Please sign in instead.");

    const userId = randomId();
    const workspaceId = randomId();
    const displayName = data.email.split("@")[0] || "You";
    await database.batch([
      database
        .prepare("INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)")
        .bind(userId, data.email, displayName, await hashPassword(data.password)),
      database
        .prepare("INSERT INTO workspaces (id, name, owner_id) VALUES (?, ?, ?)")
        .bind(workspaceId, "My Wedding", userId),
      database
        .prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')")
        .bind(workspaceId, userId),
    ]);
    await createSession(userId);
    return { id: userId, email: data.email, displayName };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((data) => credentialsSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getDatabase()
      .prepare("SELECT id, email, display_name, password_hash FROM users WHERE email = ?")
      .bind(data.email)
      .first<{ id: string; email: string; display_name: string; password_hash: string | null }>();
    if (!user || !(await verifyPassword(data.password, user.password_hash))) {
      throw new Error("Incorrect email or password.");
    }
    await createSession(user.id);
    return { id: user.id, email: user.email, displayName: user.display_name };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();
  return { ok: true };
});
