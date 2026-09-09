import { getBrowserStorage } from "@/lib/browser-storage";

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
  savedAt: string;
};

type SeoEvent =
  | "seo_page_view"
  | "seo_cta_click"
  | "signup_started"
  | "signup_completed"
  | "workspace_created"
  | "wedding_date_added"
  | "first_checklist_action"
  | "budget_created"
  | "guest_added"
  | "vendor_added"
  | "partner_invited";

const SEO_DRAFT_KEY = "offstories-seo-planning-draft";
const SEO_SOURCE_KEY = "offstories-seo-source";

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
  const source = {
    landing_page: window.location.pathname,
    user_source: params.utm_source ?? (document.referrer ? "referral" : "direct"),
    ...params,
  };
  storage.setItem(SEO_SOURCE_KEY, JSON.stringify(source));
}

function getSeoSource() {
  try {
    const value = getBrowserStorage("local").getItem(SEO_SOURCE_KEY);
    return value ? (JSON.parse(value) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function trackSeoEvent(event: SeoEvent, meta: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = { ...getSeoSource(), ...meta, page_path: window.location.pathname };
  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (name: string, event: string, data: Record<string, unknown>) => void;
  };
  analyticsWindow.dataLayer?.push({ event, ...payload });
  analyticsWindow.gtag?.("event", event, payload);
  window.dispatchEvent(new CustomEvent("offstories:analytics", { detail: { event, payload } }));
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
