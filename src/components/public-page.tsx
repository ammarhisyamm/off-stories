import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function PublicHeader({ wide = false }: { wide?: boolean }) {
  const width = wide ? "max-w-[1400px] px-6 lg:px-10" : "max-w-4xl px-6";
  return (
    <header className="border-b border-border bg-white/85 backdrop-blur-md">
      <div className={`${width} mx-auto py-5 flex items-center justify-between gap-4`}>
        <Link to="/" className="text-foreground">
          <BrandLogo />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            to="/blog"
            className="rounded-md px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Blog
          </Link>
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

export function PublicFooter({ wide = false }: { wide?: boolean }) {
  const width = wide ? "max-w-[1400px] px-6 lg:px-10" : "max-w-4xl px-6";
  return (
    <footer className="border-t border-border mt-16">
      <div
        className={`${width} mx-auto py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground`}
      >
        <div>offstories, one calm place for planning your wedding.</div>
        <nav className="flex items-center gap-4">
          <Link to="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
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

export function PublicPage({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const width = wide ? "max-w-[1400px] px-5 sm:px-8 lg:px-10" : "max-w-4xl px-6";
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader wide={wide} />
      <main className={`flex-1 w-full ${width} mx-auto py-12`}>{children}</main>
      <PublicFooter wide={wide} />
    </div>
  );
}
