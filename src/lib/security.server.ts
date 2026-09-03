import { getRequest } from "@tanstack/react-start/server";

const ALLOWED_HOSTS = new Set([
  "offstories.fun",
  "www.offstories.fun",
  "off-stories.pages.dev",
  "localhost:5173",
  "localhost:3000",
  "localhost:8799",
  "127.0.0.1:5173",
  "127.0.0.1:8799",
]);

const FALLBACK_ORIGIN = "https://offstories.fun";

/**
 * Returns a trusted app origin. Rejects spoofed Host / x-forwarded-host.
 * Only hosts in ALLOWED_HOSTS are trusted; everything else falls back.
 */
export function getSafeAppOrigin(): string {
  const request = getRequest();
  const raw = request?.headers.get("x-forwarded-host") ?? request?.headers.get("host") ?? "";
  const host = raw.trim().split(",")[0]?.trim().replace(/\/+$/, "") ?? "";
  if (!host) return FALLBACK_ORIGIN;
  // strip port for localhost check handled via set; otherwise require exact match
  // also allow host with port for localhost only via set membership
  if (ALLOWED_HOSTS.has(host)) {
    // localhost entries should keep http, prod should be https
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    return `${isLocal ? "http" : "https"}://${host}`;
  }
  // host may be "offstories.fun:443" style — strip port and check
  const hostNoPort = host.split(":")[0]!;
  if (hostNoPort === "offstories.fun" || hostNoPort === "www.offstories.fun") {
    return `https://${hostNoPort}`;
  }
  return FALLBACK_ORIGIN;
}

/** Only https: (and http for localhost) URLs are considered safe for DocRef.url / links */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    if (url.protocol === "http:") {
      // allow http only for localhost dev
      return url.hostname === "localhost" || url.hostname === "127.0.0.1";
    }
    return false;
  } catch {
    return false;
  }
}

export function assertSafeHttpUrl(value: string, field = "url"): void {
  if (!isSafeHttpUrl(value)) {
    throw new Error(`Invalid ${field}: only https:// URLs are allowed.`);
  }
}

const ALLOWED_ORIGINS = new Set([
  "https://offstories.fun",
  "https://www.offstories.fun",
  "https://off-stories.pages.dev",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8799",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8799",
]);

/**
 * CSRF mitigation for state-changing POSTs.
 * If Origin header is present, it must be in the allowlist.
 * SameSite:lax already blocks most cross-site POSTs, this is defence-in-depth.
 */
export function assertSameOrigin(): void {
  const req = getRequest();
  if (!req) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin navigations often omit Origin
  // normalize origin (strip trailing slash)
  const normalized = origin.replace(/\/+$/, "");
  if (ALLOWED_ORIGINS.has(normalized)) return;
  // also allow origins whose host is allowed (e.g. preview deploys on pages.dev subdomains)
  try {
    const u = new URL(normalized);
    if (
      u.hostname.endsWith(".pages.dev") ||
      u.hostname.endsWith("offstories.fun") ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1"
    ) {
      return;
    }
  } catch {
    // fall through to throw
  }
  throw new Error("Forbidden: invalid origin.");
}

/**
 * Verify Cloudflare Turnstile token if TURNSTILE_SECRET_KEY is configured.
 * Returns true if valid or if not configured (fail-open for dev).
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { env } = await import("cloudflare:workers");
    const secret = (env as unknown as Record<string, string | undefined>)["TURNSTILE_SECRET_KEY"];
    if (!secret) return true; // not configured -> skip verification (honeypot+rateLimit still protect)
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

// ── Simple in-memory sliding-window rate limiter (per Worker isolate) ──
// For Cloudflare Workers this is per-isolate, which is good enough as a
// first line of defence before enabling a Rate Limit binding / KV.
const buckets = new Map<string, number[]>();

function getClientIp(): string {
  const req = getRequest();
  if (!req) return "unknown";
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function checkRateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
  /** optional extra scope, e.g. email; combined with IP */
  scope?: string;
}): void {
  const ip = getClientIp();
  const bucketKey = opts.scope ? `${opts.key}:${ip}:${opts.scope}` : `${opts.key}:${ip}`;
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const arr = buckets.get(bucketKey) ?? [];
  // prune
  const recent = arr.filter((t) => t > windowStart);
  if (recent.length >= opts.limit) {
    // lightweight 429 — caller maps to Response 429
    const err = new Error("Too many requests. Please try again later.");
    (err as unknown as Record<string, unknown>).status = 429;
    (err as unknown as Record<string, unknown>).statusCode = 429;
    throw err;
  }
  recent.push(now);
  buckets.set(bucketKey, recent);
  // opportunistic cleanup to prevent unbounded growth
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || v[0]! < windowStart) buckets.delete(k);
      if (buckets.size <= 3000) break;
    }
  }
}
