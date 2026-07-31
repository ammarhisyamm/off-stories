import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveWorkspace, emptyEvent } from "@/lib/data.functions";

type Milestone = { id: string; title: string; date: string; kind: string };

export const getCalendarSyncStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("calendar_sync_log")
      .select("milestone_key, gcal_event_id, title, event_date, synced_at")
      .eq("user_id", context.userId)
      .order("synced_at", { ascending: false });
    return { synced: data ?? [] };
  });

type GCalEvent = { id: string };

async function upsertGCalEvent(
  accessToken: string,
  existingId: string | null,
  body: Record<string, unknown>,
): Promise<GCalEvent> {
  const base = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
  const url = existingId ? `${base}/${existingId}` : base;
  const res = await fetch(url, {
    method: existingId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar error (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as GCalEvent;
}

export const syncMilestonesToCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ providerToken: z.string().min(10) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await resolveWorkspace(supabase, userId);
    if (!workspaceId) throw new Error("No workspace found");

    const { data: rows } = await supabase
      .from("workspace_data")
      .select("kind,payload")
      .eq("workspace_id", workspaceId)
      .in("kind", ["milestones", "event"]);
    const map = new Map<string, unknown>((rows ?? []).map((r) => [r.kind, r.payload]));
    const milestones = (map.get("milestones") as Milestone[] | undefined) ?? [];
    const weddingEvent = { ...emptyEvent, ...((map.get("event") as object) ?? {}) } as {
      name?: string;
    };

    const { data: existing } = await supabase
      .from("calendar_sync_log")
      .select("milestone_key, gcal_event_id")
      .eq("user_id", userId);
    const idMap = new Map<string, string>(
      (existing ?? []).map((r) => [r.milestone_key, r.gcal_event_id]),
    );
    const results: Array<{ id: string; status: "created" | "updated" }> = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const m of milestones) {
      try {
        const existingId = idMap.get(m.id) ?? null;
        const summary = `${weddingEvent.name ?? "Wedding"} — ${m.title}`;
        const body = {
          summary,
          description: `Wedding milestone (${m.kind}).`,
          start: { date: m.date },
          end: { date: m.date },
        };
        const ev = await upsertGCalEvent(data.providerToken, existingId, body);
        await supabase.from("calendar_sync_log").upsert(
          {
            user_id: userId,
            milestone_key: m.id,
            gcal_event_id: ev.id,
            title: m.title,
            event_date: m.date,
            synced_at: new Date().toISOString(),
          },
          { onConflict: "user_id,milestone_key" },
        );
        results.push({ id: m.id, status: existingId ? "updated" : "created" });
      } catch (e) {
        errors.push({ id: m.id, error: e instanceof Error ? e.message : String(e) });
      }
    }
    return { results, errors, total: milestones.length };
  });

export const clearCalendarSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("calendar_sync_log").delete().eq("user_id", context.userId);
    return { ok: true };
  });
