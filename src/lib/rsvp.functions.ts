import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveWorkspace } from "@/lib/data.functions";
import type { Guest } from "@/lib/types";

const tokenSchema = z.string().uuid();
const guestIdSchema = z.string().trim().min(1).max(120);
const responseSchema = z.object({
  token: tokenSchema,
  rsvp: z.enum(["yes", "no", "maybe"]),
  pax: z.number().int().min(1).max(50),
  note: z.string().trim().max(500).optional(),
});

function appOrigin() {
  const request = getRequest();
  const host = request?.headers?.get("x-forwarded-host") ?? request?.headers?.get("host");
  return host ? (host.startsWith("http") ? host : `https://${host}`) : "https://offstories.fun";
}

function asGuests(value: unknown): Guest[] {
  return Array.isArray(value) ? (value as Guest[]) : [];
}

export const createRsvpLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ guestId: guestIdSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await resolveWorkspace(supabase, userId);
    if (!workspaceId) throw new Error("No workspace found");
    const { data: guestsRow, error: guestsError } = await supabase
      .from("workspace_data")
      .select("payload")
      .eq("workspace_id", workspaceId)
      .eq("kind", "guests")
      .maybeSingle();
    if (guestsError) throw new Error(guestsError.message);
    if (!asGuests(guestsRow?.payload).some((guest) => guest.id === data.guestId)) {
      throw new Error("Guest group not found");
    }
    const { data: link, error } = await supabase
      .from("rsvp_links")
      .upsert(
        { workspace_id: workspaceId, guest_id: data.guestId, revoked_at: null },
        { onConflict: "workspace_id,guest_id" },
      )
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    return {
      url: `${appOrigin()}/rsvp/${link.token}`,
      checkInUrl: `${appOrigin()}/check-in/${link.token}`,
      token: link.token,
    };
  });

export const revokeRsvpLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ guestId: guestIdSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const workspaceId = await resolveWorkspace(context.supabase, context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    const { error } = await context.supabase
      .from("rsvp_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("guest_id", data.guestId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

function asRpcRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 1;
}

export const getPublicRsvp = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(
    async ({
      data,
    }): Promise<{
      event: { name: string; date: string; location: string };
      guest: { name: string; pax: number; rsvp: string };
    }> => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: payload, error } = await supabase.rpc("get_public_rsvp", {
        p_token: data.token,
      });
      if (error) throw new Error(error.message);
      if (!payload) throw new Error("This RSVP link is no longer active.");

      const record = asRpcRecord(payload);
      const event = asRpcRecord(record.event);
      const guest = asRpcRecord(record.guest);
      if (!guest.name) throw new Error("This RSVP guest could not be found.");

      return {
        event: {
          name: asString(event.name),
          date: asString(event.date),
          location: asString(event.location),
        },
        guest: {
          name: asString(guest.name),
          pax: asNumber(guest.pax),
          rsvp: typeof guest.rsvp === "string" ? guest.rsvp : "yes",
        },
      };
    },
  );

export const submitPublicRsvp = createServerFn({ method: "POST" })
  .inputValidator((input) => responseSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: result, error } = await supabase.rpc("submit_public_rsvp", {
      p_token: data.token,
      p_rsvp: data.rsvp,
      p_pax: data.pax,
      p_note: data.note ?? null,
    });
    if (error) throw new Error(error.message);
    if (!asRpcRecord(result).ok) throw new Error("This RSVP link is no longer active.");
    return { ok: true };
  });

export const submitPublicCheckIn = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }): Promise<{ guestName: string }> => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: result, error } = await supabase.rpc("submit_public_check_in", {
      p_token: data.token,
    });
    if (error) throw new Error(error.message);
    const record = asRpcRecord(result);
    if (!record.ok) throw new Error("This check-in link is no longer active.");
    return { guestName: asString(record.guestName) };
  });
