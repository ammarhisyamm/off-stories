import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDatabase } from "@/lib/cloudflare.server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.string().trim().max(60).optional().default("blog"),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const database = getDatabase();
    await database
      .prepare(
        `INSERT INTO newsletter_subscribers (email, source, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(email) DO UPDATE SET source = excluded.source,
                                          unsubscribed_at = NULL,
                                          created_at = CURRENT_TIMESTAMP`,
      )
      .bind(data.email, data.source)
      .run();
    await sendNewsletterWelcomeEmail(data.email);
    return { ok: true };
  });
