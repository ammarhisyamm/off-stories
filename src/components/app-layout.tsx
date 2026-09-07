import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CaretDown, List as ListIcon, SignOut, X, SidebarSimple } from "@phosphor-icons/react";
import {
  SidebarBudget,
  SidebarCalendar,
  SidebarChecklist,
  SidebarDocuments,
  SidebarGuests,
  SidebarHouse,
  SidebarNotes,
  SidebarSettings,
  SidebarVendors,
} from "@/components/sidebar-icons";
import { BrandLogo } from "@/components/brand-logo";
import { daysUntil } from "@/lib/types";
import { getBrowserStorage } from "@/lib/browser-storage";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import { ToastViewport } from "@/components/toast";
import { getSessionUser, signOut as signOutFn } from "@/lib/auth.functions";
import { clearSessionCache } from "@/lib/session-cache";
import { useServerFn } from "@tanstack/react-start";
import { LanguageSwitch } from "@/components/language-switch";
import { useI18n } from "@/lib/i18n";

const primaryNavKeys = [
  { to: "/dashboard", key: "nav.dashboard", Icon: SidebarHouse },
  { to: "/checklist", key: "nav.checklist", Icon: SidebarChecklist },
  { to: "/budget", key: "nav.budget", Icon: SidebarBudget },
  { to: "/seserahan", key: "nav.seserahan", Icon: SidebarChecklist },
  { to: "/vendors", key: "nav.vendors", Icon: SidebarVendors },
  { to: "/guests", key: "nav.guests", Icon: SidebarGuests },
  { to: "/notes", key: "nav.notes", Icon: SidebarNotes },
  { to: "/documents", key: "nav.documents", Icon: SidebarDocuments },
  { to: "/settings", key: "nav.settings", Icon: SidebarSettings },
] as const;

const weddingDayNavKeys = [
  { to: "/timeline", key: "nav.timeline" },
  { to: "/rundown", key: "nav.rundown" },
  { to: "/command-center", key: "nav.commandCenter" },
] as const;

function useCurrentUser() {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  useEffect(() => {
    getSessionUser()
      .then((currentUser) => {
        if (currentUser) {
          setUser({
            name: currentUser.displayName,
            email: currentUser.email,
            avatar: currentUser.avatarUrl ?? undefined,
          });
        }
      })
      .catch(() => {});
  }, []);
  return user;
}

function NavList({
  pathname,
  onNavigate,
  collapsed = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const { t } = useI18n();
  const weddingDayActive = weddingDayNavKeys.some(({ to }) => pathname.startsWith(to));
  const [weddingDayOpen, setWeddingDayOpen] = useState(weddingDayActive);

  useEffect(() => {
    if (weddingDayActive) setWeddingDayOpen(true);
  }, [weddingDayActive]);

  const itemClass = (active: boolean, nested = false) =>
    [
      "sidebar-nav-link flex items-center gap-3 rounded-[14px] py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      collapsed ? "justify-center px-2" : nested ? "ml-7 px-3" : "px-3",
      active
        ? "is-active bg-sidebar-accent font-medium text-sidebar-foreground"
        : "text-sidebar-foreground hover:bg-surface/75 hover:text-foreground",
    ].join(" ");

  return (
    <nav className="flex-1 px-3 py-5 space-y-1">
      {primaryNavKeys.map(({ to, key, Icon }) => {
        const active = pathname.startsWith(to);
        const label = t(key);
        return (
          <Link
            key={to}
            to={to}
            preload="intent"
            preloadDelay={0}
            onClick={onNavigate}
            className={itemClass(active)}
          >
            <Icon className={active ? "h-[18px] w-[18px] is-drawing" : "h-[18px] w-[18px]"} />
            <span
              className={`sidebar-nav-label min-w-0 flex-1 truncate ${collapsed ? "w-0 -translate-x-2 overflow-hidden opacity-0" : "w-auto opacity-100"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
      {collapsed ? (
        <Link
          to="/timeline"
          preload="intent"
          onClick={onNavigate}
          title="Wedding day"
          aria-label="Wedding day"
          className={itemClass(weddingDayActive)}
        >
          <SidebarCalendar
            className={weddingDayActive ? "h-[18px] w-[18px] is-drawing" : "h-[18px] w-[18px]"}
          />
        </Link>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setWeddingDayOpen((open) => !open)}
            aria-expanded={weddingDayOpen}
            className={`${itemClass(weddingDayActive)} w-full`}
          >
            <SidebarCalendar
              className={weddingDayActive ? "h-[18px] w-[18px] is-drawing" : "h-[18px] w-[18px]"}
            />
            <span className="min-w-0 flex-1 truncate text-left">{t("nav.weddingDay")}</span>
            <CaretDown
              size={15}
              className={`shrink-0 transition-transform duration-200 ${weddingDayOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${weddingDayOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="min-h-0 overflow-hidden pt-1">
              {weddingDayNavKeys.map(({ to, key }) => {
                const active = pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    preload="intent"
                    preloadDelay={0}
                    onClick={onNavigate}
                    className={itemClass(active, true)}
                  >
                    {t(key)}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function UserFooter({
  compact = false,
  collapsed = false,
}: {
  compact?: boolean;
  collapsed?: boolean;
}) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const signOutRequest = useServerFn(signOutFn);
  const { t } = useI18n();
  async function signOut() {
    await signOutRequest();
    clearSessionCache();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className={`${collapsed ? "px-3 py-4" : compact ? "px-4 py-4" : "px-6 py-5"}`}>
      <div className={`flex items-center gap-3 mb-3 ${collapsed ? "justify-center" : ""}`}>
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[color:var(--sage)]/20 grid place-items-center text-xs text-[color:var(--sage)] font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sm text-foreground truncate">
              {user?.name ?? t("common.loading")}
            </div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="mb-3 flex justify-start">
          <LanguageSwitch compact />
        </div>
      )}
      <button
        onClick={signOut}
        aria-label="Sign out"
        className={`${collapsed ? "w-10 px-0" : "w-full px-3"} inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm text-muted-foreground shadow-[0_1px_2px_rgb(17_24_39_/_0.04)] transition duration-150 hover:text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]`}
      >
        <SignOut size={14} />
        {!collapsed && t("common.signOut")}
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
  const { data, canEdit } = useWorkspaceData();
  const { t } = useI18n();
  const event = data.event;
  const hasEvent = Boolean(event.date && event.name);
  const days = daysUntil(event.date);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(
        getBrowserStorage("local").getItem("offstories-sidebar-collapsed") === "true",
      );
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        getBrowserStorage("local").setItem("offstories-sidebar-collapsed", String(next));
      } catch {
        return next;
      }
      return next;
    });
  }

  // Close drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="app-shell min-h-screen bg-background flex">
      {/* Desktop sidebar — no border per design */}
      <aside
        className={`hidden md:flex shrink-0 flex-col bg-sidebar transition-[width] duration-300 ease-out ${sidebarCollapsed ? "w-[76px]" : "w-64"}`}
      >
        <div className={`py-6 ${sidebarCollapsed ? "px-3" : "px-6"}`}>
          <div
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
          >
            <BrandLogo
              compact={sidebarCollapsed}
              className={sidebarCollapsed ? "" : "scale-[0.78] origin-left"}
            />
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SidebarSimple size={18} />
              </button>
            )}
          </div>
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="mx-auto mt-4 block rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SidebarSimple size={18} />
            </button>
          )}
          {!sidebarCollapsed && (
            <>
              <div className="eyebrow mb-2 mt-7">{t("common.workspace")}</div>
              <div className="serif text-lg leading-tight text-foreground">
                {event.name || t("common.yourWedding")}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {hasEvent
                  ? `${days} ${t("common.daysUntil")} ${event.type.toLowerCase()}`
                  : t("common.setupEvent")}
              </div>
            </>
          )}
        </div>
        <NavList pathname={pathname} collapsed={sidebarCollapsed} />
        <UserFooter compact={sidebarCollapsed} collapsed={sidebarCollapsed} />
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
          className={`absolute left-0 top-0 h-full w-72 bg-sidebar flex flex-col transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-5 py-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <BrandLogo className="mb-5 scale-[0.78] origin-left" />
              <div className="eyebrow mb-1">{t("common.workspace")}</div>
              <div className="serif text-base leading-tight text-foreground truncate">
                {event.name || t("common.yourWedding")}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                {hasEvent ? `${days} ${t("common.daysToGo")}` : t("common.setupEventShort")}
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
        <div className="md:hidden border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-20">
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
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground truncate">
                {event.name || t("common.yourWedding")}
              </div>
              <div className="text-sm text-foreground truncate">
                {hasEvent
                  ? `${days} ${t("common.daysUntil")} ${event.type.toLowerCase()}`
                  : t("common.setupEventShort")}
              </div>
            </div>
            <div className="hidden sm:block">
              <LanguageSwitch compact />
            </div>
          </div>
        </div>

        <header className="border-b border-border bg-white/85 backdrop-blur-md md:sticky md:top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              {eyebrow && <div className="eyebrow mb-2 truncate">{eyebrow}</div>}
              <h1 className="display text-3xl md:text-5xl text-foreground whitespace-normal break-words">
                {title}
              </h1>
            </div>
            {canEdit && actions && (
              <div className="flex items-center gap-2 shrink-0">{actions}</div>
            )}
          </div>
        </header>
        <div className="editorial-page max-w-7xl mx-auto px-4 md:px-10 py-10 md:py-14">
          <div>{children}</div>
        </div>
      </main>

      <ToastViewport />
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

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && (
        <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function QuietButton({
  children,
  variant = "ghost",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:-translate-y-px active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(91_14_32_/_0.12),0_6px_16px_rgb(91_14_32_/_0.08)] hover:bg-primary/90 active:bg-primary/85"
      : "border border-border bg-surface text-foreground hover:border-primary/30 hover:bg-surface-2 active:bg-surface-2";
  return (
    <button {...props} className={`${base} ${styles} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}
