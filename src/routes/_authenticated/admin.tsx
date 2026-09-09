import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { AppLayout, EmptyState, Pill } from "@/components/app-layout";
import { getAdminStats, type AdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Registrations" },
      { name: "description", content: "Admin overview of user registrations." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const fetchStats = useServerFn(getAdminStats);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await fetchStats());
      setForbidden(false);
    } catch (error) {
      setForbidden(error instanceof Error && /forbidden/i.test(error.message));
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <AppLayout eyebrow="Admin" title="Registrations">
        <p className="text-sm text-muted-foreground">Loading stats…</p>
      </AppLayout>
    );
  }

  if (forbidden || !stats) {
    return (
      <AppLayout eyebrow="Admin" title="Registrations">
        <EmptyState
          icon={<ShieldCheck size={20} />}
          title="No access"
          description="This page is only available for admin accounts."
        />
      </AppLayout>
    );
  }

  const maxDay = Math.max(1, ...stats.series.map((s) => s.count));

  return (
    <AppLayout eyebrow="Admin" title="Registrations">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={String(stats.totalUsers)} />
        <StatCard label="Today (WIB)" value={String(stats.todayWIB)} />
        <StatCard label="Today (UTC)" value={String(stats.todayUTC)} />
        <StatCard label="Newsletter" value={String(stats.newsletterCount)} />
      </div>

      <section className="panel mt-6 p-5">
        <div className="eyebrow">Signups per day (WIB, last 14 days)</div>
        <div className="mt-4 space-y-2">
          {stats.series.length === 0 && (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          )}
          {stats.series.map((s) => (
            <div key={s.day} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-muted-foreground tabular-nums">
                {s.day}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-sage"
                  style={{ width: `${(s.count / maxDay) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mt-6 p-5">
        <div className="eyebrow">Latest users</div>
        <div className="mt-4 divide-y divide-border">
          {stats.recentUsers.map((u) => (
            <div key={u.email} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">
                  {u.displayName} <span className="text-muted-foreground">· {u.email}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {u.createdAt}
                </div>
              </div>
              {u.isAdmin ? <Pill tone="taupe">admin</Pill> : <Pill>user</Pill>}
            </div>
          ))}
          {stats.recentUsers.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No users yet.</p>
          )}
        </div>
      </section>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <WarningCircle size={14} />
        Refresh the page to see the latest numbers.
      </p>
    </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <div className="eyebrow">{label}</div>
      <div className="serif mt-2 text-4xl tabular-nums">{value}</div>
    </div>
  );
}
