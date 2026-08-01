import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BudgetMockup,
  ChecklistMockup,
  DashboardMockup,
  GuestsMockup,
  TimelineMockup,
} from "@/components/landing/mockups";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "offstories" },
      {
        name: "description",
        content:
          "offstories is a wedding planning dashboard for couples — checklist, budget, vendors, guests, timeline, and notes in one shared workspace.",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
        primary
          ? "bg-primary text-primary-foreground shadow-soft hover:opacity-90"
          : "border border-border bg-surface text-foreground hover:bg-surface-2"
      }`}
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow mb-5 inline-flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-sage" />
      {children}
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-[15px] leading-relaxed text-muted-foreground"
        >
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LandingHeader({ hasSession }: { hasSession: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-landing flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sage/15">
            <span className="h-2 w-2 rounded-full bg-sage" />
          </span>
          <span className="serif text-base">offstories</span>
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
          <a
            href="#data"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Privacy
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
          <span className="grid h-7 w-7 place-items-center rounded-full bg-sage/15">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          </span>
          <span className="serif text-sm text-foreground">offstories</span>
        </div>
        <p className="text-xs text-muted-foreground">
          A quiet place for planning your wedding — one calm shared workspace.
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
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[54rem] -translate-x-1/2 rounded-full bg-sage/10 blur-3xl" />
      <div className="container-landing relative section-landing pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Plan · Track · Share</Eyebrow>
          <h1 className="display text-[2.75rem] leading-[1.05] text-foreground text-balance sm:text-6xl md:text-7xl">
            Every wedding is a story. Plan it in one quiet place.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            offstories is a calm, shared workspace for you and your partner — checklist, budget,
            vendors, guests, timeline, and notes, together instead of scattered.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <CTAButton to={hasSession ? "/dashboard" : "/auth"} primary>
              {hasSession ? "Open your dashboard" : "Get started free"}
            </CTAButton>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See the workspace
            </a>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Free to start · No card required ·{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function Storytelling() {
  return (
    <section className="border-b border-border">
      <div className="container-landing section-landing">
        <div className="grid grid-cols-12 gap-y-12 lg:gap-16">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>Why offstories</Eyebrow>
            <h2 className="display text-3xl leading-tight text-foreground text-balance sm:text-4xl lg:text-[2.75rem]">
              Planning a wedding is a story told in a thousand small decisions.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Spreadsheets drift. Group chats bury the good parts. Reminders get forgotten the
              moment they're sent. The things that actually matter — the venue deposit, the guest
              count, the fitting, the menu — end up living in five different places.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              offstories gathers it all into one workspace that breathes. Calm by default,
              structured by design, and shared between the two of you from the very first list.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { n: "5", l: "modules, one workspace" },
                { n: "2+", l: "people planning together" },
                { n: "365", l: "days of quiet headroom" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="serif text-3xl text-foreground">{s.n}</div>
                  <div className="mt-1 text-xs leading-snug text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const rows = [
    {
      id: "checklist",
      eyebrow: "The checklist",
      title: "One list, zero chaos.",
      body: "Tasks grouped by category and priority, with a simple list-to-kanban view. Nothing slips because nothing is written anywhere else.",
      bullets: [
        "Auto-grouped tasks for every part of the wedding",
        "High, medium, and low priorities at a glance",
        "Track what's done, due, and coming next week",
      ],
      mockup: <ChecklistMockup />,
      reverse: false,
    },
    {
      id: "budget",
      eyebrow: "The budget",
      title: "A budget that breathes.",
      body: "Know exactly what's committed, what's paid, and what headroom remains — before a deposit slips through.",
      bullets: [
        "Track committed, paid, and remaining in real time",
        "Compare vendors side by side before you book",
        "Watch every category against your total",
      ],
      mockup: <BudgetMockup />,
      reverse: true,
    },
    {
      id: "guests",
      eyebrow: "The guests",
      title: "Guests, grouped and greeted.",
      body: "Invitation status and running RSVP totals for every group — family, friends, colleagues — so the final count is always honest.",
      bullets: [
        "Group your list by side, circle, or table",
        "Live RSVP totals as replies come in",
        "Pax counts per group, no more guesswork",
      ],
      mockup: <GuestsMockup />,
      reverse: false,
    },
    {
      id: "timeline",
      eyebrow: "The timeline",
      title: "A timeline you can actually see.",
      body: "Milestones month by month, from the first venue tour to the morning of the day itself. Plus notes that keep every decision in its place.",
      bullets: [
        "Milestones mapped from engagement to day one",
        "A decision log so nothing gets re-litigated",
        "Notes tagged by family, vendor, or meeting",
      ],
      mockup: <TimelineMockup />,
      reverse: true,
    },
  ];

  return (
    <section id="features" className="scroll-mt-16 border-b border-border">
      <div className="container-landing section-landing pb-0">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Features</Eyebrow>
          <h2 className="display text-3xl leading-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
            Everything, quietly in its place.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Five modules that fit together like a well-run wedding — each simple alone, effortless
            together.
          </p>
        </div>
      </div>
      <div className="container-landing">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-12 items-center gap-y-10 py-20 sm:py-24 lg:gap-16"
          >
            <div
              className={`col-span-12 lg:col-span-5 ${row.reverse ? "lg:order-2 lg:col-start-8" : ""}`}
            >
              <Eyebrow>{row.eyebrow}</Eyebrow>
              <h3 className="serif text-2xl leading-snug text-foreground sm:text-3xl">
                {row.title}
              </h3>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {row.body}
              </p>
              <FeatureList items={row.bullets} />
            </div>
            <div
              className={`col-span-12 lg:col-span-6 ${row.reverse ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}
            >
              <div className="[perspective:1200px]">
                <div className="transition-transform duration-300 hover:-translate-y-1">
                  {row.mockup}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    {
      n: "01",
      title: "Set up your event",
      body: "Name the day, the venue, the date, and a starting budget. Offstories builds the rest around it.",
    },
    {
      n: "02",
      title: "Invite your partner",
      body: "Send an email invitation to your partner. They join with their own account as an editor — no sharing logins.",
    },
    {
      n: "03",
      title: "Plan together",
      body: "Tasks, budgets, and RSVPs update in one shared view, so you both work from the same page.",
    },
  ];
  return (
    <section id="workflow" className="scroll-mt-16 border-b border-border">
      <div className="container-landing section-landing">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="display text-3xl leading-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
            From first idea to the final toast.
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 ? (
                <div className="absolute left-1/2 top-7 hidden h-px w-full bg-border md:block" />
              ) : null}
              <div className="relative rounded-2xl border border-border bg-surface p-8 shadow-soft">
                <div className="serif text-sm text-sage">{s.n}</div>
                <h3 className="mt-3 serif text-xl text-foreground">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <CTAButton to="/auth" primary>
            Start planning today
          </CTAButton>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: "We stopped asking 'did you handle it?' — it's all in one place. The guest list alone saved us.",
      who: "Andra & Kirana",
      when: "Planning for October 2026",
    },
    {
      q: "Budget committed vs. what's actually paid was the thing we kept losing. Now it's one glance.",
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
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>From the couple's table</Eyebrow>
          <h2 className="display text-3xl leading-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
            Told better with one list.
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {quotes.map((t) => (
            <figure key={t.who} className="panel flex flex-col p-8">
              <blockquote className="serif text-lg leading-relaxed text-foreground">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-5">
                <div className="text-sm font-medium text-foreground">{t.who}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.when}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataSection() {
  const dataUses = [
    {
      title: "Sign in with Google",
      body: "We use Google sign-in only to identify you. We receive your name, email address, and profile picture, and we use them to create your account and show them to your partner.",
    },
    {
      title: "Email & password",
      body: "You can also create an account with your email and a password you choose. We store your email so you can sign back in and receive confirmation messages; your password is stored securely and never shared.",
    },
    {
      title: "Your wedding data",
      body: "Your checklist, budget, vendors, guest list, and notes are stored securely in your own workspace. We do not sell or share this data with anyone — only you and your partner can see it.",
    },
  ];
  return (
    <section id="data" className="scroll-mt-16 border-b border-border">
      <div className="container-landing section-landing">
        <div className="grid grid-cols-12 gap-y-12 lg:gap-16">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>Your data, plainly explained</Eyebrow>
            <h2 className="display text-3xl leading-tight text-foreground text-balance sm:text-4xl">
              Why we ask for what we ask for.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              We keep data requests to the minimum, and we keep them honest. Here is exactly what we
              use — and what we never do with it.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="space-y-4">
              {dataUses.map((d) => (
                <div key={d.title} className="panel p-6">
                  <h3 className="serif text-lg text-foreground">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              You can request a copy or deletion of your data at any time. See our{" "}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy policy
              </Link>{" "}
              for details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ hasSession }: { hasSession: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-lines-soft pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="container-landing relative section-landing">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display text-4xl leading-[1.08] text-foreground text-balance sm:text-5xl md:text-6xl">
            Your story deserves a quiet place to grow.
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start your workspace in under a minute. Free to begin, calm to live in, ready for the
            two of you.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <CTAButton to={hasSession ? "/dashboard" : "/auth"} primary>
              {hasSession ? "Open your dashboard" : "Get started free"}
            </CTAButton>
          </div>
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
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader hasSession={hasSession} />
      <main>
        <Hero hasSession={hasSession} />
        <Storytelling />
        <Showcase />
        <Workflow />
        <Testimonials />
        <DataSection />
        <FinalCTA hasSession={hasSession} />
      </main>
      <LandingFooter />
    </div>
  );
}
