import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CalendarBlank, EnvelopeSimple, MapPin, WarningCircle } from "@phosphor-icons/react";
import { getPublicInvitation } from "@/lib/invitation-page.functions";
import { BrandLogo } from "@/components/brand-logo";
import { Countdown } from "@/components/countdown";

export const Route = createFileRoute("/undangan/$token")({
  head: () => ({
    meta: [
      { title: "Wedding invitation — offstories" },
      {
        name: "description",
        content: "A wedding invitation with the couple's details and countdown.",
      },
    ],
  }),
  component: UndanganPage,
});

type InvitationEvent = {
  name: string;
  type: string;
  date: string;
  location: string;
  adat: string | null;
  brideName: string | null;
  groomName: string | null;
  ceremonyTypes: string[];
  venueName: string | null;
  venueStatus: string | null;
};

function UndanganPage() {
  const { token } = Route.useParams();
  const load = useServerFn(getPublicInvitation);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<InvitationEvent | null>(null);

  useEffect(() => {
    load({ data: { token } })
      .then((result) => {
        setEvent(result.event as InvitationEvent);
        setState("ready");
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "This invitation link is unavailable.");
        setState("error");
      });
  }, [load, token]);

  const coupleName = (() => {
    if (!event) return "";
    if (event.brideName && event.groomName) return `${event.brideName} & ${event.groomName}`;
    if (event.brideName) return event.brideName;
    if (event.groomName) return event.groomName;
    return event.name || "A wedding celebration";
  })();

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <BrandLogo className="mb-12" />
        {state === "loading" && (
          <p className="text-sm text-muted-foreground">Loading invitation…</p>
        )}
        {state === "error" && (
          <section className="panel p-8 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <WarningCircle size={24} />
            </div>
            <h1 className="serif text-2xl text-foreground">Invitation unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </section>
        )}
        {state === "ready" && event && (
          <section className="panel overflow-hidden">
            <div className="bg-[color:var(--rose)]/10 px-6 py-10 text-center sm:px-10">
              <div className="eyebrow mb-4">The Wedding of</div>
              <h1 className="serif text-4xl text-foreground text-balance sm:text-5xl">
                {coupleName}
              </h1>
              {event.type && (
                <p className="mt-4 text-sm font-medium text-muted-foreground">{event.type}</p>
              )}
            </div>
            <div className="px-6 py-10 sm:px-10">
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground mb-8">
                {event.date && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarBlank size={16} weight="duotone" />
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} weight="duotone" />
                    {event.venueName ? `${event.venueName} · ${event.location}` : event.location}
                  </span>
                )}
                {event.adat && (
                  <span className="inline-flex items-center gap-2">
                    <EnvelopeSimple size={16} weight="duotone" />
                    {event.adat}
                  </span>
                )}
              </div>

              <div className="my-2 border-t border-border" />

              <div className="mt-8">
                <div className="eyebrow text-center mb-5">Counting down to the big day</div>
                <Countdown target={event.date} />
              </div>

              <div className="mt-10 flex justify-center">
                <p className="max-w-sm text-center text-xs leading-5 text-muted-foreground">
                  Made with offstories — a quiet workspace for planning weddings together.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
