export const GROWTH_EVENT_NAMES = [
  "seo_page_view",
  "seo_cta_click",
  "signup_started",
  "signup_completed",
  "workspace_created",
  "wedding_date_added",
  "first_checklist_action",
  "budget_created",
  "guest_added",
  "vendor_added",
  "partner_invited",
] as const;

export type GrowthEventName = (typeof GROWTH_EVENT_NAMES)[number];

export const GROWTH_SOURCES = ["organic", "referral", "direct", "paid", "unknown"] as const;
export type GrowthSource = (typeof GROWTH_SOURCES)[number];
