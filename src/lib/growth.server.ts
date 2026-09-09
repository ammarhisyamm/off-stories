import { z } from "zod";
import { getCurrentUser, randomId } from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";
import { GROWTH_EVENT_NAMES, GROWTH_SOURCES } from "@/lib/growth-events";
import { assertSameOrigin, checkRateLimit } from "@/lib/security.server";

const payloadSchema = z.object({
  event: z.enum(GROWTH_EVENT_NAMES),
  sessionId: z.string().uuid(),
  userSource: z.enum(GROWTH_SOURCES).default("unknown"),
  landingPage: z.string().startsWith("/").max(240).optional(),
  contentCluster: z.string().trim().max(80).optional(),
  ctaVariant: z.string().trim().max(120).optional(),
  meta: z.record(z.string(), z.string().max(160)).optional(),
});

const ALLOWED_META_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "page_path",
  "invite_method",
]);

function safeMeta(meta: Record<string, string> | undefined) {
  if (!meta) return null;
  const entries = Object.entries(meta).filter(([key]) => ALLOWED_META_KEYS.has(key));
  return entries.length ? JSON.stringify(Object.fromEntries(entries)) : null;
}

export async function recordGrowthEvent(request: Request) {
  assertSameOrigin();
  checkRateLimit({ key: "growth-events", limit: 60, windowMs: 60_000 });

  const payload = payloadSchema.parse(await request.json());
  const user = await getCurrentUser();
  await getDatabase()
    .prepare(
      `INSERT INTO growth_events
       (id, session_id, user_id, event_name, user_source, landing_page, content_cluster, cta_variant, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      randomId(),
      payload.sessionId,
      user?.id ?? null,
      payload.event,
      payload.userSource,
      payload.landingPage ?? null,
      payload.contentCluster ?? null,
      payload.ctaVariant ?? null,
      safeMeta(payload.meta),
    )
    .run();
  return new Response(null, { status: 204 });
}
