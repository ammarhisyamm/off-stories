import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, QuietButton } from "@/components/app-layout";
import { event } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Wedding Preparation" },
      { name: "description", content: "Event details, workspace preferences, and profile." },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <AppLayout eyebrow="Workspace" title="Settings" actions={<QuietButton variant="primary">Save changes</QuietButton>}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
          <nav className="panel p-2 text-sm">
            {["Event details", "Preferences", "Collaborators", "Notifications", "Account"].map((s, i) => (
              <button
                key={s}
                className={`w-full text-left px-3 py-2 rounded-md ${i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </nav>
        </aside>

        <section className="lg:col-span-2 panel p-7">
          <div className="eyebrow mb-1">Event details</div>
          <h2 className="serif text-2xl mb-6">{event.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Event name" value={event.name} />
            <Field label="Event type" value={event.type} />
            <Field label="Date" value={new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
            <Field label="Location" value={event.location} />
            <Field label="Estimated guests" value={String(event.guestEstimate)} />
            <Field label="Estimated budget" value={`Rp ${event.budget.toLocaleString("id-ID")}`} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input
        defaultValue={value}
        className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
      />
    </label>
  );
}
