import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardPreview } from "@/components/landing/previews";
import {
  BudgetDemo,
  ChecklistDemo,
  GuestsDemo,
  TimelineDemo,
} from "@/components/landing/bento-demos";
import { useReveal } from "@/hooks/use-reveal";
import { useParallax } from "@/hooks/use-parallax";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "offstories" },
      {
        name: "description",
        content:
          "offstories is a wedding planning dashboard for couples: checklist, budget, vendors, guests, timeline, and notes in one shared workspace.",
      },
      { property: "og:title", content: "offstories" },
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
        primary
          ? "bg-primary text-primary-foreground shadow-soft hover:opacity-90"
          : "border border-border bg-surface text-foreground hover:bg-surface-2"
      }`}
    >
      {children}
    </Link>
  );
}

function ProductPreview({
  children,
  reveal = false,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  reveal?: boolean;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal();
  return (
    <div
      ref={reveal ? ref : undefined}
      style={reveal && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${reveal ? "reveal " : ""}${className} [perspective:1200px]`.trim()}
    >
      {children}
    </div>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale" | "left" | "right";
}) {
  const ref = useReveal();
  const variantClass = variant === "up" ? "" : `reveal-${variant}`;
  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${variantClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function ParallaxBackdrop({
  speed = 0.15,
  className = "",
  children,
}: {
  speed?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useParallax(speed);
  return (
    <div
      ref={ref}
      aria-hidden
      className={`parallax pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function LandingHeader({ hasSession }: { hasSession: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
      <div className="container-landing flex h-16 items-center justify-between gap-4">
        <Link to="/" className="text-foreground">
          <BrandLogo />
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
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <CTAButton to={hasSession ? "/dashboard" : "/auth"}>
            {hasSession ? "Open dashboard" : "Get started"}
          </CTAButton>
        </div>
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container-landing flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="scale-[0.78] origin-left" />
        </div>
        <p className="text-xs text-muted-foreground">
          A quiet place for planning your wedding, one calm shared workspace.
        </p>
        <nav className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function Hero({ hasSession }: { hasSession: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <ParallaxBackdrop speed={0.12}>
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[44rem] -translate-x-1/2 rounded-full bg-slate-200/45 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-white/80 blur-3xl" />
      </ParallaxBackdrop>
      <div className="container-landing relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out mb-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Wedding preparation for two
          </p>
          <h1 className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out [animation-delay:90ms] display text-[2.5rem] text-foreground text-balance sm:text-5xl lg:text-6xl">
            Plan your wedding in one calm place.
          </h1>
          <p className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out [animation-delay:180ms] mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A shared workspace for you and your partner: checklist, budget, vendors, guests,
            timeline, and notes, together instead of scattered.
          </p>
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out [animation-delay:270ms] mt-9 flex flex-wrap items-center justify-start gap-3">
            <CTAButton to={hasSession ? "/dashboard" : "/auth"} primary>
              {hasSession ? "Open your dashboard" : "Get started"}
            </CTAButton>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              See the workspace
            </a>
          </div>
        </div>
        <div className="mt-12 w-full max-w-4xl sm:mt-16">
          <ProductPreview className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out [animation-delay:420ms]">
            <DashboardPreview />
          </ProductPreview>
        </div>
      </div>
    </section>
  );
}

function Storytelling() {
  return (
    <section className="border-b border-border">
      <div className="container-landing section-landing">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="display text-3xl text-foreground text-balance sm:text-4xl lg:text-[2.75rem]">
              Planning a wedding is a story told in a thousand small decisions.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Spreadsheets drift. Group chats bury the good parts. Reminders get forgotten the
              moment they are sent. The things that matter most end up living in five different
              places.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              offstories gathers it all into one workspace that breathes: calm by default,
              structured by design, and shared between the two of you from the very first list.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  id,
  tag,
  title,
  body,
  demo,
  index = 0,
}: {
  id: string;
  tag: string;
  title: string;
  body: string;
  demo: ReactNode;
  index?: number;
}) {
  return (
    <article
      id={id}
      className="group flex scroll-mt-16 flex-col overflow-hidden rounded-[6px] border border-border bg-surface p-6 sm:p-8"
    >
      <ProductPreview reveal delay={index * 90} className="flex flex-1 flex-col">
        <p className="eyebrow text-xs">{tag}</p>
        <h3 className="display mt-3 text-2xl text-foreground text-balance sm:text-3xl">{title}</h3>
        <div className="mt-6 flex flex-1 items-center justify-center">{demo}</div>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
      </ProductPreview>
    </article>
  );
}

function Showcase() {
  const cards = [
    {
      id: "checklist",
      tag: "01 · Checklist",
      title: "The checklist",
      body: "Every task has its place. Tick one off and watch the day get a little closer.",
      demo: <ChecklistDemo />,
    },
    {
      id: "budget",
      tag: "02 · Budget",
      title: "The budget",
      body: "See your headroom at a glance as each commitment lands and the bar settles.",
      demo: <BudgetDemo />,
    },
    {
      id: "guests",
      tag: "03 · Guests",
      title: "The guests",
      body: "Replies roll in and the list stays honest — one status at a time.",
      demo: <GuestsDemo />,
    },
    {
      id: "timeline",
      tag: "04 · Timeline",
      title: "The timeline",
      body: "Milestones draw themselves out, from the first venue tour to the big day.",
      demo: <TimelineDemo />,
    },
  ];
  return (
    <section id="features" className="scroll-mt-16 border-b border-border">
      <div className="container-landing pt-20 sm:pt-24">
        <Reveal>
          <h2 className="display text-3xl text-foreground text-balance sm:text-4xl lg:text-5xl">
            Everything, quietly in its place.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Five modules that fit together like a well-run wedding: each simple alone, effortless
            together.
          </p>
        </Reveal>
      </div>
      <div className="container-landing pb-20 pt-10 sm:pt-14 sm:pb-24">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {cards.map((c, i) => (
            <ShowcaseCard key={c.id} {...c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    {
      title: "Set up your event",
      body: "Name the day, the venue, the date, and a starting budget. Offstories builds the rest around it.",
    },
    {
      title: "Invite your partner",
      body: "Send an email invitation to your partner. They join with their own account as an editor, no shared logins.",
    },
    {
      title: "Plan together",
      body: "Tasks, budgets, and RSVPs update in one shared view, so you both work from the same page.",
    },
  ];
  const { ref: sectionRef, progress } = useScrollProgress<HTMLElement>();
  const active = Math.min(steps.length - 1, Math.floor(progress * steps.length));

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="relative scroll-mt-16 border-b border-border lg:h-[340vh]"
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:overflow-hidden">
        <div className="container-landing grid grid-cols-12 items-center gap-y-12 py-16 lg:gap-12 lg:py-8">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-xs">How it works</p>
              <h2 className="display mt-3 text-3xl text-foreground text-balance sm:text-4xl lg:text-5xl">
                From first idea to the final toast.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Three quiet steps, and the two of you are planning from the same page.
              </p>
            </Reveal>
            <div className="mt-10 hidden space-y-3 lg:block">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`flex items-center gap-3 text-sm transition-colors duration-500 ease-gentle ${
                    i === active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500 ease-gentle ${
                      i <= active ? "bg-sage" : "bg-border"
                    }`}
                  />
                  {s.title}
                </div>
              ))}
            </div>
            <div className="mt-10 hidden lg:block">
              <CTAButton to="/auth" primary>
                Get started
              </CTAButton>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="relative hidden aspect-[4/3] lg:block">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`absolute inset-0 flex flex-col justify-center rounded-[6px] border border-border bg-surface p-8 shadow-soft transition-all duration-500 ease-gentle ${
                    i === active
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-8 scale-[0.97] opacity-0"
                  }`}
                  style={{ transitionDelay: i === active ? "40ms" : "0ms" }}
                >
                  <span className="serif text-7xl text-sage/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display mt-6 text-2xl text-foreground sm:text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 lg:hidden">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 90}>
                  <div className="flex items-start gap-4 rounded-[6px] border border-border bg-surface p-6">
                    <span className="serif text-3xl text-sage/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="display text-xl text-foreground">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
              <div className="pt-2">
                <CTAButton to="/auth" primary>
                  Get started
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: "We stopped asking 'did you handle it?'. It is all in one place. The guest list alone saved us.",
      who: "Andra & Kirana",
      when: "Planning for October 2026",
    },
    {
      q: "Budget committed versus what is actually paid was the thing we kept losing. Now it is one glance.",
      who: "Rani & Dimas",
      when: "Two months out",
    },
    {
      q: "Our parents and the planner all work from the same list. Nobody is the messenger anymore.",
      who: "Sinta & Bagas",
      when: "Wedding season 2025",
    },
  ];
  return (
    <section className="border-b border-border">
      <div className="container-landing section-landing">
        <Reveal>
          <h2 className="display text-3xl text-foreground text-balance sm:text-4xl lg:text-5xl">
            Told better with one list.
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[6px] border border-border bg-border lg:grid-cols-3">
          {quotes.map((t, i) => (
            <Reveal key={t.who} variant="scale" delay={i * 100} className="bg-background">
              <figure className="flex h-full flex-col justify-between p-8">
                <blockquote className="text-base leading-relaxed text-foreground">
                  “{t.q}”
                </blockquote>
                <figcaption className="mt-8">
                  <div className="text-sm font-medium text-foreground">{t.who}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.when}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [active, setActive] = useState<number | null>(null);
  const faqs = [
    {
      q: "Is it free to start planning?",
      a: "Yes. Creating your workspace is free, and your partner can join as an editor without paying anything. You can plan your checklist, budget, vendors, guests, timeline, and notes together from day one.",
    },
    {
      q: "Can my partner and I use the same workspace?",
      a: "Yes. Invite your partner by email and they join with their own account as an editor — no shared logins, and either of you can leave the workspace whenever you need to.",
    },
    {
      q: "What data does offstories collect?",
      a: "Only what is needed to run the app: your name, email, and profile picture for sign-in, plus the wedding data you add yourself. We use them to show you and your partner your shared workspace, and we never sell or share them.",
    },
    {
      q: "Can we get a copy of our data or delete it?",
      a: "Anytime. You can request a copy or deletion of your data, or you can delete it yourself from your account. See our Privacy policy for the details.",
    },
    {
      q: "What if we change the date or the venue?",
      a: "Update the event details in Settings and the workspace adjusts with you — the countdown, the budget, and the timeline all recalculate from the new date.",
    },
    {
      q: "What can we actually plan in one workspace?",
      a: "A checklist, a budget with per-item breakdowns, a vendor directory, a guest list with RSVP tracking, a timeline of milestones, and shared notes — everything in one calm place.",
    },
  ];
  return (
    <section id="faq" className="scroll-mt-16 border-b border-border">
      <div className="container-landing section-landing">
        <div className="max-w-2xl">
          <Reveal variant="left">
            <h2 className="display text-3xl text-foreground text-balance sm:text-4xl">
              Frequently asked questions.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              The short version of how offstories works — and what we do with what you put in it.
            </p>
          </Reveal>
        </div>
        <div className="mt-14 max-w-3xl space-y-2">
          {faqs.map((f, i) => {
            const isOpen = active === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div
                  className={`panel overflow-hidden transition-colors duration-200 ${
                    isOpen ? "bg-surface ring-1 ring-sage/30" : "bg-surface"
                  }`}
                >
                  <button
                    onClick={() => setActive(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">{f.q}</span>
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-200 ${
                        isOpen ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isOpen ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        >
                          <path d="M2 2l8 8M10 2l-8 8" />
                        </svg>
                      ) : (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        >
                          <path d="M6 2v8M2 6h8" />
                        </svg>
                      )}
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{ maxHeight: isOpen ? "200px" : "0px", opacity: isOpen ? 1 : 0 }}
                  >
                    <p className="px-6 pb-5 pl-[46px] text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ hasSession }: { hasSession: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <ParallaxBackdrop speed={0.18}>
        <div className="absolute -bottom-48 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-slate-200/45 blur-3xl" />
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-white/80 blur-3xl" />
      </ParallaxBackdrop>
      <div className="container-landing relative section-landing">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="display text-4xl text-foreground text-balance sm:text-5xl md:text-6xl">
              Your story deserves a quiet place to grow.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Start your workspace in under a minute. Free to begin, calm to live in, ready for the
              two of you.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <CTAButton to={hasSession ? "/dashboard" : "/auth"} primary>
                {hasSession ? "Open your dashboard" : "Get started"}
              </CTAButton>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-7 text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy policy
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <LandingHeader hasSession={hasSession} />
      <main>
        <Hero hasSession={hasSession} />
        <Storytelling />
        <Showcase />
        <Workflow />
        <Testimonials />
        <FAQ />
        <FinalCTA hasSession={hasSession} />
      </main>
      <LandingFooter />
    </div>
  );
}
