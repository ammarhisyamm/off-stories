import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicPage } from "@/components/public-page";
import { supabase } from "@/integrations/supabase/client";
import { GoogleLogo } from "@phosphor-icons/react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "off frames stories — wedding planning dashboard" },
      {
        name: "description",
        content:
          "off frames stories is a wedding planning dashboard for couples and their helpers — checklist, budget, vendors, guests, timeline, notes, and Google Calendar sync in one shared workspace.",
      },
      { property: "og:title", content: "off frames stories" },
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
          off frames stories
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          off frames stories is a wedding planning dashboard for couples and the people helping
          them. Keep your checklist, budget, vendors, guest list, timeline, and notes in one calm
          shared workspace, and sync your milestones to Google Calendar.
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
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div key={f.title} className="panel p-6">
            <h2 className="serif text-lg text-foreground mb-2">{f.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </PublicPage>
  );
}
