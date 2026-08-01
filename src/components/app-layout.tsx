import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  House,
  CalendarDots,
  CheckSquare,
  CurrencyDollar,
  Storefront,
  Users,
  NoteBlank,
  FolderOpen,
  Gear,
  List as ListIcon,
  SignOut,
  X,
} from "@phosphor-icons/react";
import { daysUntil } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceData } from "@/lib/use-workspace-data";

const nav = [
  { to: "/dashboard", label: "Dashboard", Icon: House },
  { to: "/timeline", label: "Timeline", Icon: CalendarDots },
  { to: "/checklist", label: "Checklist", Icon: CheckSquare },
  { to: "/budget", label: "Budget", Icon: CurrencyDollar },
  { to: "/vendors", label: "Vendors", Icon: Storefront },
  { to: "/guests", label: "Guests", Icon: Users },
  { to: "/notes", label: "Notes", Icon: NoteBlank },
  { to: "/documents", label: "Documents", Icon: FolderOpen },
  { to: "/settings", label: "Settings", Icon: Gear },
] as const;

function useCurrentUser() {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata ?? {};
        setUser({
          name: meta.full_name || meta.name || data.user.email?.split("@")[0] || "You",
          email: data.user.email ?? "",
          avatar: meta.avatar_url,
        });
      }
    });
  }, []);
  return user;
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {nav.map(({ to, label, Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={[
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-[transform,background-color,color] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            ].join(" ")}
          >
            <Icon size={18} weight={active ? "duotone" : "regular"} />
            <span className="flex-1">{label}</span>
            {active && <span className="h-1 w-1 rounded-full bg-sage" />}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ compact = false }: { compact?: boolean }) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className={`border-t border-border ${compact ? "px-4 py-4" : "px-6 py-5"}`}>
      <div className="flex items-center gap-3 mb-3">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[color:var(--sage)]/20 grid place-items-center text-xs text-[color:var(--sage)] font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm text-foreground truncate">{user?.name ?? "Loading…"}</div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        </div>
      </div>
      <button
        onClick={signOut}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition duration-150 hover:text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
      >
        <SignOut size={14} />
        Sign out
      </button>
    </div>
  );
}

export function AppLayout({
  children,
  title,
  eyebrow,
  actions,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useWorkspaceData();
  const event = data.event;
  const hasEvent = Boolean(event.date && event.name);
  const days = daysUntil(event.date);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-6 py-7 border-b border-border">
          <div className="eyebrow mb-2">Workspace</div>
          <div className="serif text-lg leading-tight text-foreground">
            {event.name || "Your wedding"}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {hasEvent
              ? `${days} days until ${event.type.toLowerCase()}`
              : "Set up your event in Settings"}
          </div>
        </div>
        <NavList pathname={pathname} />
        <UserFooter />
      </aside>

      {/* Mobile drawer — slides in/out on the same path */}
      <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          id="mobile-nav"
          inert={!mobileOpen}
          aria-hidden={!mobileOpen}
          className={`absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-border flex flex-col transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-5 py-5 border-b border-border flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="eyebrow mb-1">Workspace</div>
              <div className="serif text-base leading-tight text-foreground truncate">
                {event.name || "Your wedding"}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                {hasEvent ? `${days} days to go` : "Set up your event"}
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-1.5 rounded-md text-muted-foreground transition duration-150 hover:text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
          <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <UserFooter compact />
        </aside>
      </div>

      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="p-2 -ml-2 rounded-md text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90"
            >
              <ListIcon size={22} />
            </button>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">
                {event.name || "Your wedding"}
              </div>
              <div className="text-sm text-foreground truncate">
                {hasEvent ? `${days} days to ${event.type.toLowerCase()}` : "Set up your event"}
              </div>
            </div>
          </div>
        </div>

        <header className="border-b border-border bg-background/80 backdrop-blur md:sticky md:top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-10 py-5 md:py-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              {eyebrow && <div className="eyebrow mb-2 truncate">{eyebrow}</div>}
              <h1 className="serif text-2xl md:text-4xl text-foreground truncate sm:whitespace-normal">
                {title}
              </h1>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-10">
          <div key={pathname} className="animate-in fade-in duration-150 ease-out">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "sage" | "rose" | "taupe" | "warn";
}) {
  const map: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    sage: "bg-[color:var(--sage)]/15 text-[color:var(--sage)] border-[color:var(--sage)]/30",
    rose: "bg-[color:var(--rose)]/15 text-[color:var(--rose)] border-[color:var(--rose)]/30",
    taupe: "bg-[color:var(--taupe)]/15 text-[color:var(--taupe)] border-[color:var(--taupe)]/30",
    warn: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function QuietButton({
  children,
  variant = "ghost",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85"
      : "border border-border bg-surface text-foreground hover:bg-surface-2 active:bg-surface-2";
  return (
    <button {...props} className={`${base} ${styles} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}
