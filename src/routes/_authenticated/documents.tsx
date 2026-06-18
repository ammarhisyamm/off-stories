import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { documents } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Wedding Preparation" },
      { name: "description", content: "Contracts, invoices, moodboards, and reference links in one vault." },
    ],
  }),
  component: Documents,
});

function Documents() {
  const byKind = documents.reduce<Record<string, typeof documents>>((acc, d) => {
    (acc[d.kind] ||= []).push(d);
    return acc;
  }, {});

  return (
    <AppLayout
      eyebrow="Vault"
      title="Documents & references"
      actions={<QuietButton variant="primary">Add link</QuietButton>}
    >
      <div className="space-y-8">
        {Object.entries(byKind).map(([kind, list]) => (
          <section key={kind}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="serif text-lg">{kind}</h2>
              <span className="text-xs text-muted-foreground">{list.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((d) => (
                <a key={d.id} href={d.url} className="panel p-5 hover:bg-surface-2 transition-colors block">
                  <div className="flex items-center justify-between mb-3">
                    <Pill tone="taupe">{d.kind}</Pill>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(d.addedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="text-sm text-foreground">{d.title}</div>
                  {d.vendor && <div className="text-xs text-muted-foreground mt-1">{d.vendor}</div>}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
