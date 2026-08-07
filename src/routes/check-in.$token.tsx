import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/brand-logo";
import { getPublicRsvp, submitPublicCheckIn } from "@/lib/rsvp.functions";

export const Route = createFileRoute("/check-in/$token")({
  head: () => ({ meta: [{ title: "Guest check-in — offstories" }] }),
  component: CheckInPage,
});

function CheckInPage() {
  const { token } = Route.useParams();
  const getRsvp = useServerFn(getPublicRsvp);
  const checkIn = useServerFn(submitPublicCheckIn);
  const [state, setState] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getRsvp({ data: { token } })
      .then((result) => {
        setName(result.guest.name);
        setState("ready");
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "This check-in link is unavailable.");
        setState("error");
      });
  }, [getRsvp, token]);

  async function handleCheckIn() {
    try {
      await checkIn({ data: { token } });
      setState("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete check-in.");
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-md">
        <BrandLogo className="mb-12" />
        <section className="panel p-8 text-center">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
            {state === "error" ? <WarningCircle size={26} /> : <CheckCircle size={26} />}
          </div>
          {state === "loading" && (
            <p className="text-sm text-muted-foreground">Loading check-in…</p>
          )}
          {state === "error" && (
            <>
              <h1 className="serif text-2xl text-foreground">Check-in unavailable</h1>
              <p className="mt-2 text-sm text-destructive">{error}</p>
            </>
          )}
          {state === "ready" && (
            <>
              <div className="eyebrow">Guest check-in</div>
              <h1 className="serif mt-2 text-3xl text-foreground">{name}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Confirm this guest has arrived.
              </p>
              <button
                type="button"
                onClick={handleCheckIn}
                className="mt-7 w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Check in guest
              </button>
            </>
          )}
          {state === "done" && (
            <>
              <h1 className="serif text-2xl text-foreground">Checked in</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {name} has been marked as arrived.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
