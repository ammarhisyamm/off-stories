import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { randomId } from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";
import { resolveWorkspace, type EventData } from "@/lib/data.functions";

const tokenSchema = z.string().uuid();

function appOrigin() {
  const request = getRequest();
  const host = request?.headers?.get("x-forwarded-host") ?? request?.headers?.get("host");
  return host ? (host.startsWith("http") ? host : `https://${host}`) : "https://offstories.fun";
}

function parseEvent(payload: string | null): EventData {
  try {
    return payload ? JSON.parse(payload) as EventData : { name: "", type: "", date: "", location: "", guestEstimate: 0, budget: 0 };
  } catch {
    return { name: "", type: "", date: "", location: "", guestEstimate: 0, budget: 0 };
  }
}

export const getOrCreateInvitationLink = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    const database = getDatabase();
    const existing = await database.prepare("SELECT token FROM invitation_pages WHERE workspace_id = ?").bind(workspaceId).first<{ token: string; revoked_at: string | null }>();
    if (existing?.token) {
      await database.prepare("UPDATE invitation_pages SET revoked_at = NULL WHERE workspace_id = ?").bind(workspaceId).run();
      return { token: existing.token, url: `${appOrigin()}/undangan/${existing.token}` };
    }
    const token = randomId();
    await database.prepare("INSERT INTO invitation_pages (id, workspace_id, token) VALUES (?, ?, ?)").bind(randomId(), workspaceId, token).run();
    return { token, url: `${appOrigin()}/undangan/${token}` };
  });

export const revokeInvitationLink = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    await getDatabase().prepare("UPDATE invitation_pages SET revoked_at = CURRENT_TIMESTAMP WHERE workspace_id = ?").bind(workspaceId).run();
    return { ok: true };
  });

export const getInvitationPageStatus = createServerFn({ method: "GET" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) return { exists: false as const };
    const page = await getDatabase().prepare("SELECT token, revoked_at FROM invitation_pages WHERE workspace_id = ?").bind(workspaceId).first<{ token: string; revoked_at: string | null }>();
    if (!page || page.revoked_at) return { exists: false as const };
    return { exists: true as const, token: page.token, url: `${appOrigin()}/undangan/${page.token}` };
  });

export const getPublicInvitation = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const page = await getDatabase().prepare(
      `SELECT invitation_pages.revoked_at, workspaces.name AS workspace_name, event.payload AS event_payload
       FROM invitation_pages JOIN workspaces ON workspaces.id = invitation_pages.workspace_id
       LEFT JOIN workspace_data AS event ON event.workspace_id = invitation_pages.workspace_id AND event.kind = 'event'
       WHERE invitation_pages.token = ?`,
    ).bind(data.token).first<{ revoked_at: string | null; workspace_name: string; event_payload: string | null }>();
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
