import { getBrowserStorage } from "@/lib/browser-storage";
import type { GrowthEventName, GrowthSource } from "@/lib/growth-events";

export type SeoPlanningDraft = {
  sourcePage: string;
  contentCluster: "checklist" | "budget" | "timeline" | "guests" | "planner";
  ctaVariant: string;
  weddingDate?: string;
  city?: string;
  guests?: number;
  budget?: number;
  weddingType?: string;
  checkedTasks?: string[];
  templateType?: "checklist" | "budget" | "guests";
  savedAt: string;
};

const SEO_DRAFT_KEY = "offstories-seo-planning-draft";
const SEO_SOURCE_KEY = "offstories-seo-source";
const SEO_SESSION_KEY = "offstories-seo-session-id";

function readParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
  };
}

export function rememberSeoSource() {
  if (typeof window === "undefined") return;
  const storage = getBrowserStorage("local");
  const current = storage.getItem(SEO_SOURCE_KEY);
  if (current) return;
  const params = readParams();
  const referrer = document.referrer.toLowerCase();
  const isOrganicSearch = ["google.", "bing.", "duckduckgo.", "yahoo.", "baidu.", "yandex."].some(
    (domain) => referrer.includes(domain),
  );
  const medium = params.utm_medium?.toLowerCase();
  const userSource: GrowthSource = medium?.match(/cpc|paid|display|affiliate/)
    ? "paid"
    : isOrganicSearch
      ? "organic"
      : params.utm_source
        ? "referral"
        : document.referrer
          ? "referral"
          : "direct";
  const source = {
    landing_page: window.location.pathname,
    user_source: userSource,
    ...params,
  };
  storage.setItem(SEO_SOURCE_KEY, JSON.stringify(source));
}

function getSeoSource(): {
  landing_page?: string;
  user_source?: GrowthSource;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  content_cluster?: string;
  cta_variant?: string;
} {
  try {
    const value = getBrowserStorage("local").getItem(SEO_SOURCE_KEY);
    return value ? (JSON.parse(value) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function getSessionId() {
  const storage = getBrowserStorage("local");
  const current = storage.getItem(SEO_SESSION_KEY);
  if (current) return current;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const id = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  storage.setItem(SEO_SESSION_KEY, id);
  return id;
}

function toAnalyticsMeta(meta: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(meta)
      .filter(([, value]) => typeof value === "string" || typeof value === "number")
      .map(([key, value]) => [key, String(value).slice(0, 160)]),
  );
}

export function trackSeoEvent(event: GrowthEventName, meta: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  rememberSeoSource();
  const source = getSeoSource();
  const payload = { ...source, ...meta, page_path: window.location.pathname };
  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (name: string, event: string, data: Record<string, unknown>) => void;
  };
  analyticsWindow.dataLayer?.push({ event, ...payload });
  analyticsWindow.gtag?.("event", event, payload);
  window.dispatchEvent(new CustomEvent("offstories:analytics", { detail: { event, payload } }));
  void fetch("/api/analytics", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event,
      sessionId: getSessionId(),
      userSource: source.user_source ?? "unknown",
      landingPage: source.landing_page ?? window.location.pathname,
      contentCluster:
        typeof payload.content_cluster === "string" ? payload.content_cluster : undefined,
      ctaVariant: typeof payload.cta_variant === "string" ? payload.cta_variant : undefined,
      meta: toAnalyticsMeta(payload),
    }),
  }).catch(() => undefined);
}

export function saveSeoPlanningDraft(draft: Omit<SeoPlanningDraft, "savedAt">) {
  const next = { ...draft, savedAt: new Date().toISOString() } satisfies SeoPlanningDraft;
  getBrowserStorage("local").setItem(SEO_DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function getSeoPlanningDraft(): SeoPlanningDraft | null {
  try {
    const value = getBrowserStorage("local").getItem(SEO_DRAFT_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as SeoPlanningDraft;
    if (!parsed.sourcePage || !parsed.contentCluster || !parsed.ctaVariant) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSeoPlanningDraft() {
  getBrowserStorage("local").removeItem(SEO_DRAFT_KEY);
}
