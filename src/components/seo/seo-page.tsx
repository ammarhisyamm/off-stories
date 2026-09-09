import { Link } from "@tanstack/react-router";
import { ArrowRight, CaretRight, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { useEffect, type ReactNode } from "react";

import { PublicPage } from "@/components/public-page";
import {
  rememberSeoSource,
  saveSeoPlanningDraft,
  trackSeoEvent,
  type SeoPlanningDraft,
} from "@/lib/seo-growth";

export function SeoPage({
  children,
  cluster,
  crumb,
}: {
  children: ReactNode;
  cluster: SeoPlanningDraft["contentCluster"];
  crumb: string;
}) {
  useEffect(() => {
    rememberSeoSource();
    trackSeoEvent("seo_page_view", { content_cluster: cluster });
  }, [cluster]);

  return (
    <PublicPage wide>
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link to="/" className="transition-colors hover:text-foreground">
          OffStories
        </Link>
        <CaretRight size={12} aria-hidden />
        <span>Indonesia</span>
        <CaretRight size={12} aria-hidden />
        <span className="text-foreground">{crumb}</span>
      </nav>
      {children}
    </PublicPage>
  );
}

export function SeoCta({
  label,
  draft,
  secondary = false,
  className = "",
}: {
  label: string;
  draft: Omit<SeoPlanningDraft, "savedAt">;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/auth"
      onClick={() => {
        saveSeoPlanningDraft(draft);
        trackSeoEvent("seo_cta_click", {
          content_cluster: draft.contentCluster,
          cta_variant: draft.ctaVariant,
          landing_page: draft.sourcePage,
        });
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
        secondary
          ? "border border-border bg-surface text-foreground hover:bg-surface-2"
          : "bg-primary text-primary-foreground shadow-soft hover:opacity-90"
      } ${className}`}
    >
      {label}
      <ArrowRight size={16} weight="bold" />
    </Link>
  );
}

export function SeoHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border pb-12 sm:pb-16">
      <div className="max-w-3xl">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="display mt-4 text-4xl text-balance text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 text-sm text-foreground sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SeoCallout({ title, body }: { title: string; body: string }) {
  return (
    <aside className="rounded-[20px] border border-primary/15 bg-primary/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkle size={17} weight="fill" className="text-primary" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </aside>
  );
}
