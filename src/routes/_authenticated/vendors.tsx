import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { AddVendorModal } from "@/components/add-vendor-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
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
  const { data, setKind } = useWorkspaceData();
  const vendors = data.vendors as Vendor[];
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [viewing, setViewing] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = Array.from(new Set(vendors.map((v) => v.category)));
  const compare = vendors.filter((v) => v.category === compareCat);

  function handleSave(vendor: Vendor) {
    const exists = vendors.some((v) => v.id === vendor.id);
    const next = exists
      ? vendors.map((v) => (v.id === vendor.id ? vendor : v))
      : [vendor, ...vendors];
    setKind("vendors", next);
    setIsModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    setKind(
      "vendors",
      vendors.filter((v) => v.id !== id),
      { success: "Vendor deleted" },
    );
    setIsModalOpen(false);
    setEditing(null);
  }

  function openEdit(vendor: Vendor) {
    setEditing(vendor);
    setIsModalOpen(true);
  }

  function openView(vendor: Vendor) {
    setViewing(vendor);
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
              <li
                key={v.id}
                onClick={() => openView(v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openView(v);
                  }
                }}
                role="button"
                tabIndex={0}
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-2/60 transition-colors focus-within:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div className="h-9 w-9 rounded-md bg-surface-2 border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
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
                  <div className="text-xs text-muted-foreground">
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
                className={`text-xs px-3 py-2 rounded-full border transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${
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
                <div
                  key={v.id}
                  onClick={() => openView(v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openView(v);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="panel-muted p-4 cursor-pointer hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
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
      {viewing && (
        <ViewModal
          title="Vendor details"
          onClose={() => setViewing(null)}
          onDelete={() => handleDelete(viewing.id)}
          onEdit={() => {
            const v = viewing;
            setViewing(null);
            openEdit(v);
          }}
          badge={
            <Pill
              tone={
                viewing.status === "booked"
                  ? "sage"
                  : viewing.status === "shortlisted"
                    ? "taupe"
                    : viewing.status === "cancelled"
                      ? "warn"
                      : "neutral"
              }
            >
              {viewing.status}
            </Pill>
          }
        >
          <Detail label="Name" value={viewing.name} />
          <DetailGrid>
            <Detail label="Category" value={viewing.category} />
            <Detail label="Package" value={viewing.packageName} />
            <Detail label="Contact" value={viewing.contact} />
            <Detail label="Phone" value={viewing.phone} />
            <Detail label="Quoted" value={formatIDR(viewing.quoted)} />
            <Detail label="Final" value={viewing.final ? formatIDR(viewing.final) : "—"} />
          </DetailGrid>
        </ViewModal>
      )}
      {isModalOpen && (
        <AddVendorModal
          initial={editing ?? undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </AppLayout>
  );
}
