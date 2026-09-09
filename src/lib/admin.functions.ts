import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "@/lib/auth.server";
import { getDatabase } from "@/lib/cloudflare.server";

export type AdminStats = {
  totalUsers: number;
  todayUTC: number;
  todayWIB: number;
  series: { day: string; count: number }[];
  recentUsers: { email: string; displayName: string; createdAt: string; isAdmin: boolean }[];
  newsletterCount: number;
  organicFunnel: {
    sessions: number;
    ctaClicks: number;
    signups: number;
    workspaces: number;
    firstActions: number;
    partnerInvites: number;
    activatedCouples: number;
  };
};

export const getAdminStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminStats> => {
    await requireAdmin();
    const db = getDatabase();
    const total = await db.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    const todayUTC = await db
      .prepare("SELECT COUNT(*) AS n FROM users WHERE date(created_at) = date('now')")
      .first<{ n: number }>();
    const todayWIB = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM users WHERE date(created_at, '+7 hours') = date('now', '+7 hours')",
      )
      .first<{ n: number }>();
    const seriesRows = await db
      .prepare(
        "SELECT date(created_at, '+7 hours') AS day, COUNT(*) AS count FROM users GROUP BY day ORDER BY day DESC LIMIT 14",
      )
      .all<{ day: string; count: number }>();
    const recentRows = await db
      .prepare(
        "SELECT email, display_name AS displayName, created_at AS createdAt, is_admin AS isAdmin FROM users ORDER BY created_at DESC LIMIT 20",
      )
      .all<{ email: string; displayName: string; createdAt: string; isAdmin: number | null }>();
    let newsletterCount = 0;
    const organicFunnel: AdminStats["organicFunnel"] = {
      sessions: 0,
      ctaClicks: 0,
      signups: 0,
      workspaces: 0,
      firstActions: 0,
      partnerInvites: 0,
      activatedCouples: 0,
    };
    try {
      const nl = await db
        .prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers")
        .first<{ n: number }>();
      newsletterCount = nl?.n ?? 0;
    } catch {
      newsletterCount = 0;
    }
    try {
      const funnel = await db
        .prepare(
          `SELECT
             COUNT(DISTINCT CASE WHEN event_name = 'seo_page_view' THEN session_id END) AS sessions,
             SUM(CASE WHEN event_name = 'seo_cta_click' THEN 1 ELSE 0 END) AS ctaClicks,
             COUNT(DISTINCT CASE WHEN event_name = 'signup_completed' THEN user_id END) AS signups,
             COUNT(DISTINCT CASE WHEN event_name = 'workspace_created' THEN user_id END) AS workspaces,
             COUNT(DISTINCT CASE WHEN event_name IN ('first_checklist_action', 'budget_created', 'guest_added', 'vendor_added') THEN user_id END) AS firstActions,
             COUNT(DISTINCT CASE WHEN event_name = 'partner_invited' THEN user_id END) AS partnerInvites
           FROM growth_events
           WHERE user_source = 'organic'`,
        )
        .first<{
          sessions: number | null;
          ctaClicks: number | null;
          signups: number | null;
          workspaces: number | null;
          firstActions: number | null;
          partnerInvites: number | null;
        }>();
      const activated = await db
        .prepare(
          `SELECT COUNT(*) AS count FROM (
             SELECT user_id
             FROM growth_events
             WHERE user_source = 'organic' AND user_id IS NOT NULL
             GROUP BY user_id
             HAVING SUM(CASE WHEN event_name = 'workspace_created' THEN 1 ELSE 0 END) > 0
                AND SUM(CASE WHEN event_name IN ('first_checklist_action', 'budget_created', 'guest_added', 'vendor_added') THEN 1 ELSE 0 END) > 0
           )`,
        )
        .first<{ count: number }>();
      organicFunnel.sessions = funnel?.sessions ?? 0;
      organicFunnel.ctaClicks = funnel?.ctaClicks ?? 0;
      organicFunnel.signups = funnel?.signups ?? 0;
      organicFunnel.workspaces = funnel?.workspaces ?? 0;
      organicFunnel.firstActions = funnel?.firstActions ?? 0;
      organicFunnel.partnerInvites = funnel?.partnerInvites ?? 0;
      organicFunnel.activatedCouples = activated?.count ?? 0;
    } catch {
      // The migration may not have reached a preview deployment yet.
    }
    return {
      totalUsers: total?.n ?? 0,
      todayUTC: todayUTC?.n ?? 0,
      todayWIB: todayWIB?.n ?? 0,
      series: (seriesRows.results ?? []).reverse(),
      recentUsers: (recentRows.results ?? []).map((u) => ({ ...u, isAdmin: u.isAdmin === 1 })),
      newsletterCount,
      organicFunnel,
    };
  },
);
