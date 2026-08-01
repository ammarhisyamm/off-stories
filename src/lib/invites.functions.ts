import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendPartnerInviteEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function appOrigin(): string {
  const req = getRequest();
  const host = req?.headers?.get("host");
  const forwarded = req?.headers?.get("x-forwarded-host");
  if (host) return host.startsWith("http") ? host : `https://${host}`;
  if (forwarded) return forwarded.startsWith("http") ? forwarded : `https://${forwarded}`;
  return "https://offstories.fun";
}

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
      .select("id, token, email, role, created_at, expires_at, accepted_at, revoked_at")
      .eq("workspace_id", ws.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { invites: data ?? [], workspaceId: ws.id };
  });

export const invitePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address.");

    const { data: ws } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    if (!ws) throw new Error("No workspace found");

    // Reject if a partner already joined.
    const { data: partners } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", ws.id)
      .neq("user_id", userId);
    if ((partners ?? []).length > 0) {
      throw new Error("Your partner already joined this workspace.");
    }

    // Reject if there's still an active invite.
    const { data: active } = await supabase
      .from("workspace_invites")
      .select("id, email")
      .eq("workspace_id", ws.id)
      .is("accepted_at", null)
      .is("revoked_at", null);
    if ((active ?? []).length > 0) {
      const existing = active?.[0];
      throw new Error(
        existing?.email
          ? `An invitation is still pending for ${existing.email}. Cancel it first.`
          : "An invitation is still pending. Cancel it first.",
      );
    }

    const expires = new Date(Date.now() + 14 * 86400_000).toISOString();
    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: ws.id,
        email,
        role: "editor",
        created_by: userId,
        expires_at: expires,
      })
      .select("id, token, email, role, expires_at, created_at")
      .single();
    if (error) throw new Error(error.message);

    await sendPartnerInviteEmail({
      to: email,
      workspaceName: ws.name,
      inviteUrl: `${appOrigin()}/invite/${invite.token}`,
    });

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

export const getInvite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ token: z.string().uuid() }).parse(d))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { data: inv, error } = await supabase
      .from("workspace_invites")
      .select("id, email, role, expires_at, accepted_at, revoked_at, workspace_id")
      .eq("token", input.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!inv) throw new Error("Invite not found");
    const { data: ws } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", inv.workspace_id)
      .maybeSingle();
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", inv.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    return {
      ...inv,
      workspaceName: ws?.name ?? "their wedding",
      isMember: Boolean(membership),
      memberRole: membership?.role ?? null,
    };
  });

// The signed-in user (an invited editor, never the owner) drops their own
// membership and points their active workspace back to their own account.
export const leaveWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", data.workspaceId)
      .eq("owner_id", userId)
      .maybeSingle();
    if (ws) throw new Error("You own this workspace, so you can't leave it.");
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", data.workspaceId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    await supabase.from("profiles").update({ active_workspace_id: null }).eq("id", userId);
    return { ok: true };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ token: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: workspaceId, error } = await supabase.rpc("accept_workspace_invite", {
      p_token: data.token,
    });
    if (error) throw new Error(error.message);
    return { ok: true, workspaceId: workspaceId as string };
  });

export const removePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    if (!ws) throw new Error("No workspace found");
    const { error } = await supabase.rpc("remove_workspace_partner", {
      p_workspace: ws.id,
      p_partner: data.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: owned } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();
    let workspaceId = owned?.id ?? null;
    if (!workspaceId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_workspace_id")
        .eq("id", userId)
        .maybeSingle();
      workspaceId = profile?.active_workspace_id ?? null;
    }
    if (!workspaceId) {
      return {
        members: [],
        role: null as string | null,
        workspaceId: null as string | null,
        workspaceName: null as string | null,
        myId: userId,
      };
    }
    const { data, error } = await supabase
      .from("workspace_members")
      .select(
        "user_id, role, joined_at, profiles:profiles!workspace_members_user_id_fkey(display_name, email, avatar_url)",
      )
      .eq("workspace_id", workspaceId);
    type MemberRow = {
      user_id: string;
      role: string;
      joined_at: string;
      profiles?: {
        display_name: string | null;
        email: string | null;
        avatar_url: string | null;
      } | null;
    };
    let members: MemberRow[] = (data ?? []) as unknown as MemberRow[];
    if (error) {
      // fallback: join manually
      const { data: simple } = await supabase
        .from("workspace_members")
        .select("user_id, role, joined_at")
        .eq("workspace_id", workspaceId);
      members = (simple ?? []) as unknown as MemberRow[];
    }
    const my = (members as Array<{ user_id: string; role: string }>).find(
      (m) => m.user_id === userId,
    );
    const { data: wsInfo } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .maybeSingle();
    return {
      members,
      role: my?.role ?? null,
      workspaceId,
      workspaceName: wsInfo?.name ?? null,
      myId: userId,
    };
  });
