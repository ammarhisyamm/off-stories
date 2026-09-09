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
    try {
      const nl = await db
        .prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers")
        .first<{ n: number }>();
      newsletterCount = nl?.n ?? 0;
    } catch {
      newsletterCount = 0;
    }
    return {
      totalUsers: total?.n ?? 0,
      todayUTC: todayUTC?.n ?? 0,
      todayWIB: todayWIB?.n ?? 0,
      series: (seriesRows.results ?? []).reverse(),
      recentUsers: (recentRows.results ?? []).map((u) => ({ ...u, isAdmin: u.isAdmin === 1 })),
      newsletterCount,
    };
  },
);
