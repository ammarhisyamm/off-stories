import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const reportSchema = z.object({
  source: z.string().max(120),
  route: z.string().max(240).optional(),
  kind: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
  stack: z.string().max(8000).optional(),
  meta: z.record(z.unknown()).optional(),
});

export const reportClientError = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => reportSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        userId,
        source: data.source,
        route: data.route,
        kind: data.kind,
        message: data.message,
        stack: data.stack,
        meta: data.meta,
      }),
    );
    return { ok: true };
  });
