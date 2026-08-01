import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicPage } from "@/components/public-page";
import { supabase } from "@/integrations/supabase/client";
import { GoogleLogo } from "@phosphor-icons/react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "offstories — wedding planning dashboard" },
      {
        name: "description",
        content:
          "offstories is a wedding planning dashboard for couples and their helpers — checklist, budget, vendors, guests, timeline, notes, and Google Calendar sync in one shared workspace.",
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

const features = [
  {
    title: "Master checklist",
    body: "Auto-grouped tasks with priorities and a simple list-to-kanban view, so nothing slips.",
  },
  {
    title: "Budget & vendors",
    body: "Track committed spend, payments, and remaining headroom. Compare vendors side by side.",
  },
  {
    title: "Guests & RSVP",
    body: "Group guest lists with invitation status and running RSVP totals.",
  },
  {
    title: "Timeline & notes",
    body: "Milestones month by month, plus a decision log to keep every conversation in one place.",
  },
  {
    title: "Invite collaborators",
    body: "Share one link so your partner, family, or planner can help — everyone sees the same data.",
  },
  {
    title: "Calendar sync",
    body: "Push your milestones into your Google Calendar as all-day events, without duplicates.",
  },
];

const dataUses = [
  {
    title: "Sign in with Google",
    body: "We use Google sign-in only to identify you. We receive your name, email address, and profile picture, and we use them to create your account and show them to people you invite to your workspace.",
  },
  {
    title: "Google Calendar sync",
    body: "If you choose to connect your calendar, we request access so we can add your wedding milestones as all-day events and update them as you plan. We never read, share, or export events outside your own calendars.",
  },
  {
    title: "Your wedding data",
    body: "Your checklist, budget, vendors, guest list, and notes are stored securely in your own workspace. We do not sell or share this data with anyone — only you and the people you invite can see it.",
  },
];

function Landing() {
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  return (
    <PublicPage>
      <section className="text-center py-10 sm:py-16">
        <div className="eyebrow mb-4">Plan · Track · Share</div>
        <h1 className="serif text-4xl sm:text-5xl text-foreground text-balance leading-tight">
          offstories
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          offstories is a wedding planning dashboard for couples and the people helping them. Keep
          your checklist, budget, vendors, guest list, timeline, and notes in one calm shared
          workspace, and sync your milestones to Google Calendar.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={hasSession ? "/dashboard" : "/auth"}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GoogleLogo size={18} weight="bold" />
            {hasSession ? "Open your dashboard" : "Continue with Google"}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-5">
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
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div key={f.title} className="panel p-6">
            <h2 className="serif text-lg text-foreground mb-2">{f.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <div className="eyebrow mb-4 text-center">Your data, plainly explained</div>
        <h2 className="serif text-2xl sm:text-3xl text-foreground text-center text-balance mb-8">
          Why we ask for what we ask for
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dataUses.map((d) => (
            <div key={d.title} className="panel-muted p-6">
              <h3 className="serif text-lg text-foreground mb-2">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          You can request a copy or deletion of your data at any time. See our{" "}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy policy
          </Link>{" "}
          for details.
        </p>
      </section>
    </PublicPage>
  );
}
