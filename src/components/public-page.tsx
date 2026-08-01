import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--sage)]" />
          </span>
          <span className="serif text-base">offstories</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            to="/privacy"
            className="rounded-md px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="rounded-md px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Terms
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>offstories, one calm place for planning your wedding.</div>
        <nav className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">{children}</main>
      <PublicFooter />
    </div>
  );
}
