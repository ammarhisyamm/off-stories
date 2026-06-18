import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    if (!ws) return { invites: [], workspaceId: null as string | null };
    const { data, error } = await supabase
      .from("workspace_invites")
      .select("id, token, role, created_at, expires_at, accepted_at, revoked_at")
      .eq("workspace_id", ws.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { invites: data ?? [], workspaceId: ws.id };
  });

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        role: z.enum(["editor", "viewer"]),
        expiresInDays: z.number().int().min(1).max(60).default(14),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    if (!ws) throw new Error("No workspace found");
    const expires = new Date(Date.now() + data.expiresInDays * 86400_000).toISOString();
    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: ws.id,
        role: data.role,
        created_by: userId,
        expires_at: expires,
      })
      .select("id, token, role, expires_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return invite;
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("workspace_invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ token: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .select("id, workspace_id, role, accepted_at, revoked_at, expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invite) throw new Error("Invite not found");
    if (invite.revoked_at) throw new Error("This invite was revoked");
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      throw new Error("This invite has expired");
    const { error: memErr } = await supabase
      .from("workspace_members")
      .upsert(
        { workspace_id: invite.workspace_id, user_id: userId, role: invite.role },
        { onConflict: "workspace_id,user_id" },
      );
    if (memErr) throw new Error(memErr.message);
    if (!invite.accepted_at) {
      await supabase
        .from("workspace_invites")
        .update({ accepted_at: new Date().toISOString(), accepted_by: userId })
        .eq("id", invite.id);
    }
    await supabase
      .from("profiles")
      .update({ active_workspace_id: invite.workspace_id })
      .eq("id", userId);
    return { ok: true, workspaceId: invite.workspace_id };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    if (!ws) return { members: [] };
    const { data, error } = await supabase
      .from("workspace_members")
      .select("user_id, role, joined_at, profiles:profiles!workspace_members_user_id_fkey(display_name, email, avatar_url)")
      .eq("workspace_id", ws.id);
    if (error) {
      // fallback: join manually
      const { data: simple } = await supabase
        .from("workspace_members")
        .select("user_id, role, joined_at")
        .eq("workspace_id", ws.id);
      return { members: simple ?? [] };
    }
    return { members: data ?? [] };
  });
