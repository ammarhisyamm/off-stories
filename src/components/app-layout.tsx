import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { event, daysUntil } from "@/lib/mock-data";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/timeline", label: "Timeline" },
  { to: "/checklist", label: "Checklist" },
  { to: "/budget", label: "Budget" },
  { to: "/vendors", label: "Vendors" },
  { to: "/guests", label: "Guests" },
  { to: "/notes", label: "Notes" },
  { to: "/documents", label: "Documents" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppLayout({ children, title, eyebrow, actions }: { children: ReactNode; title: string; eyebrow?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const days = daysUntil(event.date);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-6 py-7 border-b border-border">
          <div className="eyebrow mb-2">Workspace</div>
          <div className="serif text-lg leading-tight text-foreground">{event.name}</div>
          <div className="mt-3 text-xs text-muted-foreground">
            {days} days until {event.type.toLowerCase()}
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                ].join(" ")}
              >
                <span className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {active && <span className="h-1 w-1 rounded-full bg-sage" />}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-border">
          <div className="eyebrow mb-1">Planner</div>
          <div className="text-sm text-foreground">Kirana R.</div>
          <div className="text-xs text-muted-foreground">+ Andra W.</div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex items-end justify-between gap-6 flex-wrap">
            <div>
              {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
              <h1 className="serif text-3xl md:text-4xl text-foreground">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">{children}</div>
      </main>
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "sage" | "rose" | "taupe" | "warn" }) {
  const map: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    sage: "bg-[color:var(--sage)]/15 text-[color:var(--sage)] border-[color:var(--sage)]/30",
    rose: "bg-[color:var(--rose)]/15 text-[color:var(--rose)] border-[color:var(--rose)]/30",
    taupe: "bg-[color:var(--taupe)]/15 text-[color:var(--taupe)] border-[color:var(--taupe)]/30",
    warn: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export function QuietButton({ children, variant = "ghost", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base = "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-surface text-foreground hover:bg-surface-2";
  return <button {...props} className={`${base} ${styles} ${props.className ?? ""}`}>{children}</button>;
}
