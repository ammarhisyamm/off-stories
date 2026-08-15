import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  BudgetDemo,
  ChecklistDemo,
  GuestsDemo,
  TimelineDemo,
} from "@/components/landing/bento-demos";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";
import { BrandLogo } from "@/components/brand-logo";
import { useReveal } from "@/hooks/use-reveal";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import {
  blogCategories,
  blogCategoryUrl,
  getCategoryLabel,
  getPublishedPosts,
  formatBlogDate,
} from "@/lib/blog";

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

function ProductPreview({
  children,
  className = "",
  reveal = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  reveal?: boolean;
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
            Four core modules that fit together like a well-run wedding: each simple alone,
            effortless together.
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
                Start planning for free
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
                  Start planning for free
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
  return (
    <section className="border-b border-border">
      <div className="container-landing section-landing">
        <Reveal>
          <h2 className="display text-3xl text-foreground text-balance sm:text-4xl lg:text-5xl">
            Told better with one list.
          </h2>
        </Reveal>
        <div className="mt-14">
          <TestimonialsCarousel />
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
      <div className="mx-auto w-full max-w-[900px] section-landing">
        <Reveal>
          <div className="text-center">
            <h2 className="display text-3xl text-foreground text-balance sm:text-4xl">
              Frequently asked questions.
            </h2>
            <p className="mx-auto mt-6 max-w-[600px] text-base leading-relaxed text-muted-foreground">
              The short version of how offstories works — and what we do with what you put in it.
            </p>
          </div>
        </Reveal>
        <div className="mt-6 space-y-2">
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
                    id={`faq-trigger-${i}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
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
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    aria-hidden={!isOpen}
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

function BlogSpotlight() {
  const published = getPublishedPosts();
  const featuredPost = published[0];
  const secondaryPosts = published.slice(1, 3);

  return (
    <section className="border-b border-border bg-surface/40">
      <div className="container-landing section-landing">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="max-w-xl">
            <Reveal>
              <div className="eyebrow text-xs">From the blog</div>
              <h2 className="display mt-3 text-3xl text-foreground text-balance sm:text-4xl lg:text-5xl">
                Guides for couples planning in Indonesia.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                We keep the advice local and practical: KUA, akad, resepsi, seserahan, RSVP via
                WhatsApp, and the budget realities couples actually face in Jakarta, Bandung,
                Surabaya, Bali, and beyond.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 flex flex-wrap gap-2">
                {blogCategories.map((category) => (
                  <Link
                    key={category.slug}
                    to={blogCategoryUrl(category.slug)}
                    className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition duration-150 hover:bg-surface-2"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8">
                <CTAButton to="/blog" primary>
                  Explore the blog
                </CTAButton>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-4">
            <Reveal delay={60}>
              <Link
                to="/blog/$slug"
                params={{ slug: featuredPost.slug }}
                className="group rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground">
                    {getCategoryLabel(featuredPost)}
                  </span>
                  <span>{formatBlogDate(featuredPost.updatedAt)}</span>
                </div>
                <h3 className="serif mt-4 text-2xl text-balance text-foreground">
                  {featuredPost.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {featuredPost.excerpt}
                </p>
              </Link>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {secondaryPosts.map((post, index) => (
                <Reveal key={post.slug} delay={140 + index * 80}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex h-full flex-col rounded-[22px] border border-border bg-background p-5 transition duration-150 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {getCategoryLabel(post)}
                    </div>
                    <h3 className="serif mt-3 text-xl text-balance text-foreground group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                      Read more
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
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
              <CTAButton to="/auth" primary>
                Start planning for free
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

function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container-landing flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="text-foreground">
            <BrandLogo className="scale-[0.78] origin-left" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          A quiet place for planning your wedding, one calm shared workspace.
        </p>
        <nav className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link to="/blog" className="transition-colors hover:text-foreground">
            Blog
          </Link>
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

export function LandingSections() {
  return (
    <>
      <Storytelling />
      <Showcase />
      <Workflow />
      <Testimonials />
      <FAQ />
      <BlogSpotlight />
      <FinalCTA />
      <LandingFooter />
    </>
  );
}
