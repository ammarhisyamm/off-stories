import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

const DashboardPreview = lazy(() =>
  import("@/components/landing/previews").then((module) => ({ default: module.DashboardPreview })),
);

const LandingSections = lazy(() =>
  import("@/components/landing/landing-sections").then((module) => ({
    default: module.LandingSections,
  })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OffStories — Wedding planning workspace" },
      {
        name: "description",
        content:
          "OffStories is a calm wedding planning workspace for couples in Indonesia: checklist, budget, vendors, guests, timeline, and notes in one shared workspace.",
      },
      { property: "og:title", content: "OffStories — Wedding planning workspace" },
      {
        property: "og:description",
        content:
          "A calm, modular dashboard for managing every part of your wedding preparation in one place.",
      },
    ],
  }),
  component: Landing,
});

function CTAButton({
  to,
  primary = false,
  children,
}: {
  to: string;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
        primary
          ? "bg-primary text-primary-foreground shadow-soft hover:opacity-90"
          : "border border-border bg-surface text-foreground hover:bg-surface-2"
      }`}
    >
      {children}
    </Link>
  );
}

function ProductPreview({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${className} [perspective:1200px]`.trim()}>{children}</div>;
}

function DashboardPreviewFallback() {
  return (
    <div className="w-full overflow-hidden rounded-[6px] border border-border bg-white shadow-browser sm:rounded-[10px]">
      <div className="flex">
        <div className="hidden shrink-0 flex-col border-r border-border bg-sidebar sm:flex w-36 p-2 lg:w-44 lg:p-3">
          <div className="space-y-2 px-3 py-4">
            <div className="h-2 w-12 rounded-full bg-muted" />
            <div className="h-4 w-24 rounded-full bg-muted" />
            <div className="h-2 w-20 rounded-full bg-muted" />
          </div>
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 rounded-md bg-surface-2" />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-28 rounded-full bg-muted" />
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-52 rounded-full bg-muted" />
              <div className="h-7 w-20 rounded-md bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg border border-border bg-surface" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
              <div className="h-28 rounded-lg border border-border bg-surface lg:col-span-3" />
              <div className="h-28 rounded-lg border border-border bg-surface lg:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
      <div className="container-landing flex h-16 items-center justify-between gap-4">
        <Link to="/" className="text-foreground" aria-label="OffStories home">
          <BrandLogo compact />
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <a
            href="#features"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            How it works
          </a>
          <Link
            to="/blog"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Blog
          </Link>
          <Link
            to="/id/wedding-planner"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Planner
          </Link>
          <a
            href="#faq"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <CTAButton to="/auth">Start planning for free</CTAButton>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="container-landing relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.14em] text-foreground/85">
            Wedding preparation for two
          </p>
          <h1 className="display text-[2.5rem] text-foreground text-balance sm:text-5xl lg:text-6xl">
            Plan your wedding in one calm place.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-foreground/85">
            A shared workspace for you and your partner: checklist, budget, vendors, guests,
            timeline, and notes, together instead of scattered.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-start gap-3">
            <CTAButton to="/auth" primary>
              Start planning for free
            </CTAButton>
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-border bg-surface px-4 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              See the workspace
            </a>
          </div>
          <p className="mt-4 text-xs text-foreground/70">Free to start · No credit card required</p>
        </div>
        <div className="mt-12 w-full max-w-4xl sm:mt-16">
          <ProductPreview className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out [animation-delay:420ms]">
            <Suspense fallback={<DashboardPreviewFallback />}>
              <DashboardPreview />
            </Suspense>
          </ProductPreview>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <LandingHeader />
      <main>
        <Hero />
        <Suspense fallback={null}>
          <LandingSections />
        </Suspense>
      </main>
    </div>
  );
}
