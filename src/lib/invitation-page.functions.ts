import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { randomId } from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";
import { resolveWorkspace, type EventData } from "@/lib/data.functions";
import { assertSameOrigin, checkRateLimit, getSafeAppOrigin } from "@/lib/security.server";

const tokenSchema = z.string().min(1).max(80);

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function appOrigin() {
  return getSafeAppOrigin();
}

function parseEvent(payload: string | null): EventData {
  try {
    return payload
      ? (JSON.parse(payload) as EventData)
      : { name: "", type: "", date: "", location: "", guestEstimate: 0, budget: 0 };
  } catch {
    return { name: "", type: "", date: "", location: "", guestEstimate: 0, budget: 0 };
  }
}

export const getOrCreateInvitationLink = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    assertSameOrigin();
    checkRateLimit({ key: "create-invitation-link", limit: 10, windowMs: 60_000 });
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    const database = getDatabase();
    const existing = await database
      .prepare("SELECT token FROM invitation_pages WHERE workspace_id = ?")
      .bind(workspaceId)
      .first<{ token: string; revoked_at: string | null }>();
    if (existing?.token) {
      await database
        .prepare("UPDATE invitation_pages SET revoked_at = NULL WHERE workspace_id = ?")
        .bind(workspaceId)
        .run();
      return { token: existing.token, url: `${appOrigin()}/undangan/${existing.token}` };
    }

    const eventRow = await database
      .prepare("SELECT payload FROM workspace_data WHERE workspace_id = ? AND kind = 'event'")
      .bind(workspaceId)
      .first<{ payload: string }>();
    const event = eventRow ? parseEvent(eventRow.payload) : null;
    const base =
      [event?.brideName, event?.groomName].filter(Boolean).join("-") || event?.name || "undangan";
    const slug = slugify(base) || "undangan";
    // High-entropy token: slug + 12-char base36 suffix from 9 random bytes (~46 bits) + UUID fallback
    // Previous 4-char suffix (20 bits / 1.6M combos) was brute-forceable on public endpoint.
    const rand = crypto.getRandomValues(new Uint8Array(9));
    const suffix = Array.from(rand, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
    const token = `${slug}-${suffix}-${crypto.randomUUID().slice(0, 8)}`;

    await database
      .prepare("INSERT INTO invitation_pages (id, workspace_id, token) VALUES (?, ?, ?)")
      .bind(randomId(), workspaceId, token)
      .run();
    return { token, url: `${appOrigin()}/undangan/${token}` };
  });

export const revokeInvitationLink = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    await getDatabase()
      .prepare("UPDATE invitation_pages SET revoked_at = CURRENT_TIMESTAMP WHERE workspace_id = ?")
      .bind(workspaceId)
      .run();
    return { ok: true };
  });

export const getInvitationPageStatus = createServerFn({ method: "GET" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) return { exists: false as const };
    const page = await getDatabase()
      .prepare("SELECT token, revoked_at FROM invitation_pages WHERE workspace_id = ?")
      .bind(workspaceId)
      .first<{ token: string; revoked_at: string | null }>();
    if (!page || page.revoked_at) return { exists: false as const };
    return {
      exists: true as const,
      token: page.token,
      url: `${appOrigin()}/undangan/${page.token}`,
    };
  });

export const getPublicInvitation = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    checkRateLimit({ key: "public-invitation", limit: 30, windowMs: 60_000 });
    const page = await getDatabase()
      .prepare(
        `SELECT invitation_pages.revoked_at, workspaces.name AS workspace_name, event.payload AS event_payload
       FROM invitation_pages JOIN workspaces ON workspaces.id = invitation_pages.workspace_id
       LEFT JOIN workspace_data AS event ON event.workspace_id = invitation_pages.workspace_id AND event.kind = 'event'
       WHERE invitation_pages.token = ?`,
      )
      .bind(data.token)
      .first<{ revoked_at: string | null; workspace_name: string; event_payload: string | null }>();
    if (!page) throw new Error("This invitation link is not available.");
    if (page.revoked_at) throw new Error("This invitation page has been turned off.");
    const event = parseEvent(page.event_payload);
    return {
      workspaceName: page.workspace_name ?? null,
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
