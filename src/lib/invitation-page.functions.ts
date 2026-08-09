import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveWorkspace } from "@/lib/data.functions";
import type { EventData } from "@/lib/data.functions";

const tokenSchema = z.string().uuid();

function appOrigin() {
  const request = getRequest();
  const host = request?.headers?.get("x-forwarded-host") ?? request?.headers?.get("host");
  return host ? (host.startsWith("http") ? host : `https://${host}`) : "https://offstories.fun";
}

export const getOrCreateInvitationLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await resolveWorkspace(supabase, userId);
    if (!workspaceId) throw new Error("No workspace found");

    const { data: existing, error: existingError } = await supabase
      .from("invitation_pages")
      .select("token")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (existing && existing.token) {
      return { token: existing.token, url: `${appOrigin()}/undangan/${existing.token}` };
    }

    const { data: created, error } = await supabase
      .from("invitation_pages")
      .insert({ workspace_id: workspaceId })
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    return { token: created.token, url: `${appOrigin()}/undangan/${created.token}` };
  });

export const revokeInvitationLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.supabase, context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    const { error } = await context.supabase
      .from("invitation_pages")
      .update({ revoked_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getInvitationPageStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.supabase, context.userId);
    if (!workspaceId) return { exists: false as const };
    const { data, error } = await context.supabase
      .from("invitation_pages")
      .select("token, revoked_at")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data || data.revoked_at) return { exists: false };
    return {
      exists: true as const,
      token: data.token,
      url: `${appOrigin()}/undangan/${data.token}`,
    };
  });

export const getPublicInvitation = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: page, error: pageError } = await supabaseAdmin
      .from("invitation_pages")
      .select("workspace_id, revoked_at")
      .eq("token", data.token)
      .maybeSingle();
    if (pageError) throw new Error(pageError.message);
    if (!page) throw new Error("This invitation link is not available.");
    if (page.revoked_at) throw new Error("This invitation page has been turned off.");

    const { data: rows, error } = await supabaseAdmin
      .from("workspace_data")
      .select("kind,payload")
      .eq("workspace_id", page.workspace_id);
    if (error) throw new Error(error.message);

    const { data: ws, error: wsError } = await supabaseAdmin
      .from("workspaces")
      .select("name")
      .eq("id", page.workspace_id)
      .maybeSingle();
    if (wsError) throw new Error(wsError.message);

    const event = ((rows ?? []).find((row) => (row as { kind: string }).kind === "event")
      ?.payload ?? {}) as EventData;

    return {
      workspaceName: ws?.name ?? null,
      event: {
        name: event.name,
        type: event.type,
        date: event.date,
        location: event.location,
        adat: event.adat ?? null,
        brideName: event.brideName ?? null,
        groomName: event.groomName ?? null,
        ceremonyTypes: event.ceremonyTypes ?? [],
        venueName: event.venueName ?? null,
        venueStatus: event.venueStatus ?? null,
      },
    };
  });
