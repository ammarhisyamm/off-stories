import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { getCurrentUser, randomId } from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";
import { resolveWorkspace } from "@/lib/data.functions";
import { sendPartnerInviteEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenSchema = z.string().uuid();

function appOrigin() {
  const request = getRequest();
  const host = request?.headers?.get("x-forwarded-host") ?? request?.headers?.get("host");
  return host ? (host.startsWith("http") ? host : `https://${host}`) : "https://offstories.fun";
}

async function ownerWorkspace(userId: string) {
  const workspaceId = await resolveWorkspace(userId);
  if (!workspaceId) throw new Error("No workspace found");
  return workspaceId;
}

async function activeInvite(workspaceId: string) {
  return getDatabase()
    .prepare(
      `SELECT id, token, email, role, expires_at, created_at
       FROM workspace_invites
       WHERE workspace_id = ? AND accepted_at IS NULL AND revoked_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(workspaceId)
    .first<Record<string, string | null>>();
}

async function createInvite(userId: string, email: string | null) {
  const workspaceId = await ownerWorkspace(userId);
  const partner = await getDatabase()
    .prepare(
      "SELECT user_id FROM workspace_members WHERE workspace_id = ? AND user_id <> ? LIMIT 1",
    )
    .bind(workspaceId, userId)
    .first();
  if (partner) throw new Error("Your partner already joined this workspace.");
  const existing = await activeInvite(workspaceId);
  if (existing) throw new Error("An invitation is still pending. Cancel it first.");

  const workspace = await getDatabase()
    .prepare("SELECT name FROM workspaces WHERE id = ?")
    .bind(workspaceId)
    .first<{ name: string }>();

  const invite = {
    id: randomId(),
    token: randomId(),
    expiresAt: new Date(Date.now() + 14 * 86400_000).toISOString(),
  };
  await getDatabase()
    .prepare(
      `INSERT INTO workspace_invites
       (id, workspace_id, token, email, role, created_by, expires_at)
       VALUES (?, ?, ?, ?, 'editor', ?, ?)`,
    )
    .bind(invite.id, workspaceId, invite.token, email, userId, invite.expiresAt)
    .run();
  return {
    id: invite.id,
    token: invite.token,
    email,
    role: "editor",
    expires_at: invite.expiresAt,
    created_at: new Date().toISOString(),
    url: `${appOrigin()}/invite/${invite.token}`,
    workspaceName: workspace?.name ?? null,
  };
}

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const workspaceId = await ownerWorkspace(context.userId);
    const rows = await getDatabase()
      .prepare(
        "SELECT id, token, email, role, created_at, expires_at, accepted_at, revoked_at FROM workspace_invites WHERE workspace_id = ? ORDER BY created_at DESC",
      )
      .bind(workspaceId)
      .all();
    return { invites: rows.results ?? [], workspaceId };
  });

export const invitePartner = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((data) => z.object({ email: z.string().trim().email() }).parse(data))
  .handler(async ({ data, context }) => {
    const email = data.email.toLowerCase();
    if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address.");
    const invite = await createInvite(context.userId, email);
    await sendPartnerInviteEmail({
      to: email,
      inviteUrl: invite.url,
      workspaceName: invite.workspaceName ?? "your wedding",
    });
    return invite;
  });

export const createLinkInvite = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .handler(({ context }) => createInvite(context.userId, null));

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((data) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["viewer", "editor"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await ownerWorkspace(context.userId);
    await getDatabase()
      .prepare(
        "UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ? AND user_id <> ?",
      )
      .bind(data.role, workspaceId, data.userId, context.userId)
      .run();
    return { ok: true };
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const workspaceId = await ownerWorkspace(context.userId);
    await getDatabase()
      .prepare(
        "UPDATE workspace_invites SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND workspace_id = ?",
      )
      .bind(data.id, workspaceId)
      .run();
    return { ok: true };
  });

export const getInvite = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ token: tokenSchema }).parse(data))
  .handler(async ({ data }) => {
    const invite = await getDatabase()
      .prepare(
        `SELECT workspace_invites.id, workspace_invites.email, workspace_invites.role,
              workspace_invites.expires_at, workspace_invites.accepted_at,
              workspace_invites.revoked_at, workspace_invites.workspace_id,
              workspaces.name AS workspace_name
       FROM workspace_invites JOIN workspaces ON workspaces.id = workspace_invites.workspace_id
       WHERE workspace_invites.token = ?`,
      )
      .bind(data.token)
      .first<Record<string, string | null>>();
    if (!invite) throw new Error("Invite not found");
    const user = await getCurrentUser();
    const member = user
      ? await getDatabase()
          .prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
          .bind(invite.workspace_id, user.id)
          .first<{ role: string }>()
      : null;
    return {
      ...invite,
      workspaceName: invite.workspace_name ?? "their wedding",
      isMember: Boolean(member),
      memberRole: member?.role ?? null,
    };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((data) => z.object({ token: tokenSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const database = getDatabase();
    const invite = await database
      .prepare(
        "SELECT id, workspace_id, role, email, expires_at, accepted_at, revoked_at FROM workspace_invites WHERE token = ?",
      )
      .bind(data.token)
      .first<{
        id: string;
        workspace_id: string;
        role: string;
        email: string | null;
        expires_at: string | null;
        accepted_at: string | null;
        revoked_at: string | null;
      }>();
    if (
      !invite ||
      invite.revoked_at ||
      invite.accepted_at ||
      (invite.expires_at && new Date(invite.expires_at) <= new Date())
    )
      throw new Error("This invitation is no longer active.");
    if (invite.email && invite.email.toLowerCase() !== context.user.email.toLowerCase())
      throw new Error("This invitation was sent to a different email address.");
    const owner = await database
      .prepare("SELECT owner_id FROM workspaces WHERE id = ?")
      .bind(invite.workspace_id)
      .first<{ owner_id: string }>();
    if (owner?.owner_id === context.userId) throw new Error("You already own this workspace.");
    await database.batch([
      database
        .prepare(
          "INSERT OR REPLACE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)",
        )
        .bind(invite.workspace_id, context.userId, invite.role),
      database
        .prepare(
          "UPDATE workspace_invites SET accepted_at = CURRENT_TIMESTAMP, accepted_by = ? WHERE id = ?",
        )
        .bind(context.userId, invite.id),
    ]);
    return { ok: true, workspaceId: invite.workspace_id };
  });

export const leaveWorkspace = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((data) => z.object({ workspaceId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const owner = await getDatabase()
      .prepare("SELECT owner_id FROM workspaces WHERE id = ?")
      .bind(data.workspaceId)
      .first<{ owner_id: string }>();
    if (owner?.owner_id === context.userId)
      throw new Error("You own this workspace, so you can't leave it.");
    await getDatabase()
      .prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
      .bind(data.workspaceId, context.userId)
      .run();
    return { ok: true };
  });

export const removePartner = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const workspaceId = await ownerWorkspace(context.userId);
    await getDatabase()
      .prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
      .bind(workspaceId, data.userId)
      .run();
    return { ok: true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    let workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId)
      workspaceId =
        (
          await getDatabase()
            .prepare("SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1")
            .bind(context.userId)
            .first<{ workspace_id: string }>()
        )?.workspace_id ?? null;
    if (!workspaceId)
      return {
        members: [],
        role: null,
        workspaceId: null,
        workspaceName: null,
        myId: context.userId,
      };
    const rows = await getDatabase()
      .prepare(
        `SELECT workspace_members.user_id, workspace_members.role, workspace_members.joined_at,
              users.display_name, users.email, users.avatar_url
       FROM workspace_members JOIN users ON users.id = workspace_members.user_id
       WHERE workspace_members.workspace_id = ? ORDER BY workspace_members.joined_at`,
      )
      .bind(workspaceId)
      .all();
    const members = (rows.results ?? []).map((row) => ({
      ...row,
      profiles: { display_name: row.display_name, email: row.email, avatar_url: row.avatar_url },
    }));
    const mine = members.find((member) => member.user_id === context.userId) as
      | { role?: string }
      | undefined;
    const workspace = await getDatabase()
      .prepare("SELECT name FROM workspaces WHERE id = ?")
      .bind(workspaceId)
      .first<{ name: string }>();
    return {
      members,
      role: mine?.role ?? null,
      workspaceId,
      workspaceName: workspace?.name ?? null,
      myId: context.userId,
    };
  });
