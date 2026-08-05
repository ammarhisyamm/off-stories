import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveWorkspace } from "@/lib/data.functions";
import type { EventData } from "@/lib/data.functions";
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("rsvp_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("guest_id", data.guestId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPublicRsvp = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error: linkError } = await supabaseAdmin
      .from("rsvp_links")
      .select("workspace_id, guest_id, revoked_at")
      .eq("token", data.token)
      .maybeSingle();
    if (linkError) throw new Error(linkError.message);
    if (!link || link.revoked_at) throw new Error("This RSVP link is no longer active.");
    const { data: rows, error } = await supabaseAdmin
      .from("workspace_data")
      .select("kind,payload")
      .eq("workspace_id", link.workspace_id)
      .in("kind", ["event", "guests"]);
    if (error) throw new Error(error.message);
    const event = ((rows ?? []).find((row) => row.kind === "event")?.payload ?? {}) as EventData;
    const guest = asGuests((rows ?? []).find((row) => row.kind === "guests")?.payload).find(
      (item) => item.id === link.guest_id,
    );
    if (!guest) throw new Error("This RSVP guest could not be found.");
    return {
      event: { name: event.name, date: event.date, location: event.location },
      guest: { name: guest.name, pax: guest.pax, rsvp: guest.rsvp },
    };
  });

export const submitPublicRsvp = createServerFn({ method: "POST" })
  .inputValidator((input) => responseSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error: linkError } = await supabaseAdmin
      .from("rsvp_links")
      .select("workspace_id, guest_id, revoked_at")
      .eq("token", data.token)
      .maybeSingle();
    if (linkError) throw new Error(linkError.message);
    if (!link || link.revoked_at) throw new Error("This RSVP link is no longer active.");
    const { data: guestRow, error: guestError } = await supabaseAdmin
      .from("workspace_data")
      .select("payload")
      .eq("workspace_id", link.workspace_id)
      .eq("kind", "guests")
      .maybeSingle();
    if (guestError) throw new Error(guestError.message);
    const guests = asGuests(guestRow?.payload);
    if (!guests.some((guest) => guest.id === link.guest_id)) {
      throw new Error("This RSVP guest could not be found.");
    }
    const next = guests.map((guest) =>
      guest.id === link.guest_id
        ? {
            ...guest,
            rsvp: data.rsvp,
            pax: data.pax,
            dietaryNotes: data.note || guest.dietaryNotes,
          }
        : guest,
    );
    const { error } = await supabaseAdmin
      .from("workspace_data")
      .upsert(
        { workspace_id: link.workspace_id, kind: "guests", payload: next },
        { onConflict: "workspace_id,kind" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitPublicCheckIn = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error: linkError } = await supabaseAdmin
      .from("rsvp_links")
      .select("workspace_id, guest_id, revoked_at")
      .eq("token", data.token)
      .maybeSingle();
    if (linkError) throw new Error(linkError.message);
    if (!link || link.revoked_at) throw new Error("This check-in link is no longer active.");
    const { data: guestRow, error: guestError } = await supabaseAdmin
      .from("workspace_data")
      .select("payload")
      .eq("workspace_id", link.workspace_id)
      .eq("kind", "guests")
      .maybeSingle();
    if (guestError) throw new Error(guestError.message);
    const guests = asGuests(guestRow?.payload);
    const guest = guests.find((item) => item.id === link.guest_id);
    if (!guest) throw new Error("This guest could not be found.");
    const next = guests.map((item) =>
      item.id === link.guest_id ? { ...item, checkedIn: true } : item,
    );
    const { error } = await supabaseAdmin
      .from("workspace_data")
      .upsert(
        { workspace_id: link.workspace_id, kind: "guests", payload: next },
        { onConflict: "workspace_id,kind" },
      );
    if (error) throw new Error(error.message);
    return { guestName: guest.name };
  });
