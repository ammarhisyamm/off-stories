import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddVendorModal } from "@/components/add-vendor-modal";
import { vendorStore } from "@/lib/stores";
import { formatIDR, type Vendor } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — Wedding Preparation" },
      {
        name: "description",
        content: "Centralized vendor list with quotes, status, and side-by-side comparison.",
      },
    ],
  }),
  component: Vendors,
});

function Vendors() {
  const [compareCat, setCompareCat] = useState<string>("Dekorasi");
  const [vendors, setVendors] = useState<Vendor[]>(() => vendorStore.load());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = Array.from(new Set(vendors.map((v) => v.category)));
  const compare = vendors.filter((v) => v.category === compareCat);

  function handleAdd(vendor: Vendor) {
    const next = [vendor, ...vendors];
    vendorStore.save(next);
    setVendors(next);
  }

  return (
    <AppLayout
      eyebrow="Sourcing"
      title="Vendor manager"
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          Add vendor
        </QuietButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 panel overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="serif text-lg">All vendors</h2>
          </div>
          <ul className="divide-y divide-border">
            {vendors.map((v) => (
              <li key={v.id} className="px-5 py-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-md bg-surface-2 border border-border flex items-center justify-center text-xs serif text-muted-foreground">
                  {v.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">{v.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {v.category} · {v.packageName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm tabular-nums text-foreground">
                    {formatIDR(v.final ?? v.quoted)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {v.final ? "final" : "quoted"}
                  </div>
                </div>
                <Pill
                  tone={
                    v.status === "booked"
                      ? "sage"
                      : v.status === "shortlisted"
                        ? "taupe"
                        : v.status === "cancelled"
                          ? "warn"
                          : "neutral"
                  }
                >
                  {v.status}
                </Pill>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 panel p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow">Comparison</div>
              <h2 className="serif text-xl mt-1">Side by side</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCompareCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 ${
                  compareCat === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {compare.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendors yet in this category.</p>
          ) : (
            <div className="space-y-3">
              {compare.map((v) => (
                <div key={v.id} className="panel-muted p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground">{v.name}</div>
                    <Pill tone={v.status === "booked" ? "sage" : "neutral"}>{v.status}</Pill>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{v.packageName}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Quoted</div>
                      <div className="tabular-nums text-foreground">{formatIDR(v.quoted)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Final</div>
                      <div className="tabular-nums text-foreground">
                        {v.final ? formatIDR(v.final) : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <AddVendorModal onClose={() => setIsModalOpen(false)} onSave={handleAdd} />
      )}
    </AppLayout>
  );
}
