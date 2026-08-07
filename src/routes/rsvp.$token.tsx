import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle, EnvelopeSimple, MapPin } from "@phosphor-icons/react";
import { getPublicRsvp, submitPublicRsvp } from "@/lib/rsvp.functions";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/rsvp/$token")({
  head: () => ({
    meta: [
      { title: "RSVP — offstories" },
      { name: "description", content: "Respond to a wedding invitation." },
    ],
  }),
  component: RsvpPage,
});

function RsvpPage() {
  const { token } = Route.useParams();
  const getRsvp = useServerFn(getPublicRsvp);
  const submitRsvp = useServerFn(submitPublicRsvp);
  const [state, setState] = useState<"loading" | "ready" | "sent" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<{ name: string; pax: number; rsvp: string } | null>(null);
  const [event, setEvent] = useState<{ name: string; date: string; location: string } | null>(null);
  const [rsvp, setRsvp] = useState<"yes" | "no" | "maybe">("yes");
  const [pax, setPax] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    getRsvp({ data: { token } })
      .then((result) => {
        setGuest(result.guest);
        setEvent(result.event);
        setPax(result.guest.pax);
        if (result.guest.rsvp === "no" || result.guest.rsvp === "maybe") setRsvp(result.guest.rsvp);
        setState("ready");
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "This RSVP link is unavailable.");
        setState("error");
      });
  }, [getRsvp, token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await submitRsvp({ data: { token, rsvp, pax, note } });
      setState("sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't save your response.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-lg">
        <BrandLogo className="mb-12" />
        {state === "loading" && (
          <p className="text-sm text-muted-foreground">Loading invitation…</p>
        )}
        {state === "error" && (
          <Notice title="RSVP unavailable" message={error ?? "This link is not available."} />
        )}
        {state === "sent" && (
          <Notice
            icon={<CheckCircle size={28} weight="duotone" />}
            title="Response saved"
            message="Thank you. Your hosts have received your RSVP."
          />
        )}
        {state === "ready" && guest && event && (
          <section className="panel p-6 sm:p-10">
            <div className="eyebrow mb-3">You're invited</div>
            <h1 className="serif text-3xl text-foreground sm:text-4xl">
              {event.name || "A wedding celebration"}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {event.date && (
                <span className="inline-flex items-center gap-1.5">
                  <EnvelopeSimple size={16} />
                  {event.date}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} />
                  {event.location}
                </span>
              )}
            </div>
            <div className="my-8 border-t border-border" />
            <p className="text-sm text-muted-foreground">
              Hi {guest.name}, please let us know if you can join us.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">
                  Will you attend?
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["yes", "maybe", "no"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRsvp(value)}
                      className={`rounded-md border px-3 py-2.5 text-sm capitalize transition ${rsvp === value ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      {value === "yes" ? "Yes" : value === "maybe" ? "Maybe" : "Can't attend"}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-medium">
                Note <span className="font-normal text-muted-foreground">(optional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 500))}
                  rows={3}
                  maxLength={500}
                  className="mt-2 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Message for the couple"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Submit RSVP
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

function Notice({
  icon,
  title,
  message,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <section className="panel p-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--rose)]/15 text-[color:var(--rose)]">
        {icon ?? <EnvelopeSimple size={24} />}
      </div>
      <h1 className="serif text-2xl text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </section>
  );
}
