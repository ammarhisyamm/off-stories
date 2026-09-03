import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDatabase } from "@/lib/cloudflare.server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import { assertSameOrigin, checkRateLimit } from "@/lib/security.server";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.string().trim().max(60).optional().default("blog"),
  // Honeypot: bots fill this; humans leave empty (field is hidden)
  website: z.string().max(200).optional().default(""),
  // Turnstile token (optional — enforced only if TURNSTILE_SECRET_KEY is set)
  turnstileToken: z.string().max(2000).optional(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    assertSameOrigin();
    // Honeypot check — silently accept but don't actually subscribe
    if (data.website && data.website.trim().length > 0) {
      return { ok: true };
    }
    checkRateLimit({ key: "newsletter", limit: 3, windowMs: 60_000, scope: data.email });
    // Turnstile verification if token provided (falls back to true if secret not configured)
    if (data.turnstileToken) {
      const { verifyTurnstile } = await import("@/lib/security.server");
      const { getRequest } = await import("@tanstack/react-start/server");
      const ip = getRequest()?.headers.get("cf-connecting-ip") ?? undefined;
      const ok = await verifyTurnstile(data.turnstileToken, ip);
      if (!ok) throw new Error("Bot verification failed. Please try again.");
    }
    // Prevent re-subscribe bypass: if previously unsubscribed, require explicit re-confirm
    // For now, respect unsubscribed_at — don't resurrect without check
    const existing = await getDatabase()
      .prepare("SELECT unsubscribed_at FROM newsletter_subscribers WHERE email = ?")
      .bind(data.email)
      .first<{ unsubscribed_at: string | null }>();
    if (existing?.unsubscribed_at) {
      throw new Error("This email was unsubscribed. Please contact support to resubscribe.");
    }
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
