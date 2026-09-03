import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { randomId } from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";
import { resolveWorkspace } from "@/lib/data.functions";
import { assertSameOrigin, checkRateLimit, getSafeAppOrigin } from "@/lib/security.server";
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
  return getSafeAppOrigin();
}

function parsePayload<T>(payload: unknown, fallback: T): T {
  if (typeof payload !== "string") return fallback;
  try {
    return JSON.parse(payload) as T;
  } catch {
    return fallback;
  }
}

function asGuests(value: unknown): Guest[] {
  return Array.isArray(value) ? (value as Guest[]) : [];
}

async function getLink(token: string) {
  return getDatabase()
    .prepare(
      `SELECT rsvp_links.workspace_id, rsvp_links.guest_id, rsvp_links.revoked_at,
              guests.payload AS guests_payload, event.payload AS event_payload
       FROM rsvp_links
       LEFT JOIN workspace_data AS guests
         ON guests.workspace_id = rsvp_links.workspace_id AND guests.kind = 'guests'
       LEFT JOIN workspace_data AS event
         ON event.workspace_id = rsvp_links.workspace_id AND event.kind = 'event'
       WHERE rsvp_links.token = ?`,
    )
    .bind(token)
    .first<{
      workspace_id: string;
      guest_id: string;
      revoked_at: string | null;
      guests_payload: string | null;
      event_payload: string | null;
    }>();
}

export const createRsvpLink = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((input) => z.object({ guestId: guestIdSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    const guestsRow = await getDatabase()
      .prepare("SELECT payload FROM workspace_data WHERE workspace_id = ? AND kind = 'guests'")
      .bind(workspaceId)
      .first<{ payload: string }>();
    if (
      !asGuests(parsePayload(guestsRow?.payload, [])).some((guest) => guest.id === data.guestId)
    ) {
      throw new Error("Guest group not found");
    }

    const token = randomId();
    await getDatabase()
      .prepare(
        `INSERT INTO rsvp_links (id, workspace_id, guest_id, token, revoked_at)
         VALUES (?, ?, ?, ?, NULL)
         ON CONFLICT(workspace_id, guest_id) DO UPDATE SET token = excluded.token, revoked_at = NULL`,
      )
      .bind(randomId(), workspaceId, data.guestId, token)
      .run();
    return {
      url: `${appOrigin()}/rsvp/${token}`,
      checkInUrl: `${appOrigin()}/check-in/${token}`,
      token,
    };
  });

export const revokeRsvpLink = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((input) => z.object({ guestId: guestIdSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    await getDatabase()
      .prepare(
        "UPDATE rsvp_links SET revoked_at = CURRENT_TIMESTAMP WHERE workspace_id = ? AND guest_id = ?",
      )
      .bind(workspaceId, data.guestId)
      .run();
    return { ok: true };
  });

export const getPublicRsvp = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    checkRateLimit({ key: "get-public-rsvp", limit: 30, windowMs: 60_000 });
    const link = await getLink(data.token);
    if (!link || link.revoked_at) throw new Error("This RSVP link is no longer active.");
    const event = parsePayload<EventData>(link.event_payload, {
      name: "",
      type: "",
      date: "",
      location: "",
      guestEstimate: 0,
      budget: 0,
    });
    const guest = asGuests(parsePayload(link.guests_payload, [])).find(
      (item) => item.id === link.guest_id,
    );
    if (!guest?.name) throw new Error("This RSVP guest could not be found.");
    return {
      event: { name: event.name, date: event.date, location: event.location },
      guest: { name: guest.name, pax: guest.pax, rsvp: guest.rsvp ?? "pending" },
    };
  });

export const submitPublicRsvp = createServerFn({ method: "POST" })
  .inputValidator((input) => responseSchema.parse(input))
  .handler(async ({ data }) => {
    assertSameOrigin();
    checkRateLimit({ key: "submit-public-rsvp", limit: 10, windowMs: 60_000 });
    const link = await getLink(data.token);
    if (!link || link.revoked_at) throw new Error("This RSVP link is no longer active.");
    const guests = asGuests(parsePayload(link.guests_payload, []));
    const index = guests.findIndex((guest) => guest.id === link.guest_id);
    if (index < 0) throw new Error("This RSVP guest could not be found.");
    guests[index] = { ...guests[index], rsvp: data.rsvp, pax: data.pax };
    await getDatabase()
      .prepare(
        `INSERT INTO workspace_data (workspace_id, kind, payload, updated_at)
         VALUES (?, 'guests', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(workspace_id, kind) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(link.workspace_id, JSON.stringify(guests))
      .run();
    return { ok: true };
  });

export const submitPublicCheckIn = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    assertSameOrigin();
    checkRateLimit({ key: "submit-checkin", limit: 20, windowMs: 60_000 });
    const link = await getLink(data.token);
    if (!link || link.revoked_at) throw new Error("This check-in link is no longer active.");
    const guests = asGuests(parsePayload(link.guests_payload, []));
    const index = guests.findIndex((guest) => guest.id === link.guest_id);
    if (index < 0) throw new Error("This guest could not be found.");
    guests[index] = { ...guests[index], checkedIn: true };
    await getDatabase()
      .prepare(
        `INSERT INTO workspace_data (workspace_id, kind, payload, updated_at)
         VALUES (?, 'guests', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(workspace_id, kind) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(link.workspace_id, JSON.stringify(guests))
      .run();
    return { guestName: guests[index].name };
  });
