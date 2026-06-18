import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { notes } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes & Decisions — Wedding Preparation" },
      { name: "description", content: "Decision log — keep meeting notes, family requests, and important calls in one place." },
    ],
  }),
  component: Notes,
});

function Notes() {
  return (
    <AppLayout
      eyebrow="Decision log"
      title="Notes & decisions"
      actions={<QuietButton variant="primary">New note</QuietButton>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notes.map((n) => (
          <article key={n.id} className="panel p-6">
            <div className="flex items-center justify-between mb-3">
              <Pill tone={n.tag === "Decision" ? "sage" : n.tag === "Family" ? "rose" : "taupe"}>{n.tag}</Pill>
              <span className="text-xs text-muted-foreground">
                {new Date(n.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h3 className="serif text-lg text-foreground">{n.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{n.body}</p>
          </article>
        ))}
      </div>
    </AppLayout>
  );
}
