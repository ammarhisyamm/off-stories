import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { ViewModal, Detail, DetailGrid, ConfirmDelete } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { DocRef } from "@/lib/mock-data";
import { useState } from "react";
import { X, Trash, ArrowSquareOut } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Wedding Preparation" },
      {
        name: "description",
        content: "Contracts, invoices, moodboards, and reference links in one vault.",
      },
    ],
  }),
  component: Documents,
});

function Documents() {
  const { data, setKind } = useWorkspaceData();
  const docs = data.documents as DocRef[];
  const [editingDoc, setEditingDoc] = useState<DocRef | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocRef | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveDocs = (newDocs: DocRef[]) => {
    setKind("documents", newDocs);
  };

  const handleOpenNew = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocRef) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const handleOpenView = (doc: DocRef) => {
    setViewingDoc(doc);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const kind = formData.get("kind") as DocRef["kind"];
    const vendor = formData.get("vendor") as string;
    const url = formData.get("url") as string;

    if (editingDoc) {
      saveDocs(docs.map((d) => (d.id === editingDoc.id ? { ...d, title, kind, vendor, url } : d)));
    } else {
      const newDoc: DocRef = {
        id: `d${Date.now()}`,
        title,
        kind,
        vendor,
        url,
        addedAt: new Date().toISOString().split("T")[0],
      };
      saveDocs([...docs, newDoc]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    saveDocs(docs.filter((d) => d.id !== id));
    setIsModalOpen(false);
  };

  const byKind = docs.reduce<Record<string, typeof docs>>((acc, d) => {
    (acc[d.kind] ||= []).push(d);
    return acc;
  }, {});

  return (
    <AppLayout
      eyebrow="Vault"
      title="Documents & references"
      actions={
        <QuietButton variant="primary" onClick={handleOpenNew}>
          Add link
        </QuietButton>
      }
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
                <div
                  key={d.id}
                  onClick={() => handleOpenView(d)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenView(d);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="panel p-5 hover:bg-surface-2 transition-colors flex flex-col group cursor-pointer hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Pill tone="taupe">{d.kind}</Pill>
                    <span className="text-xs text-muted-foreground">
                      {new Date(d.addedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-foreground pr-6 relative">
                    {d.title}
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-0 top-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      title="Open link"
                    >
                      <ArrowSquareOut size={16} />
                    </a>
                  </div>
                  {d.vendor && <div className="text-xs text-muted-foreground mt-1">{d.vendor}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {viewingDoc && (
        <ViewModal
          title="Document details"
          onClose={() => setViewingDoc(null)}
          onDelete={() => handleDelete(viewingDoc.id)}
          onEdit={() => {
            const d = viewingDoc;
            setViewingDoc(null);
            handleOpenEdit(d);
          }}
          badge={<Pill tone="taupe">{viewingDoc.kind}</Pill>}
        >
          <Detail label="Title" value={viewingDoc.title} />
          <DetailGrid>
            <Detail
              label="Added"
              value={new Date(viewingDoc.addedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Detail label="Vendor" value={viewingDoc.vendor || "—"} />
          </DetailGrid>
          <Detail
            label="URL"
            value={
              <a
                href={viewingDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--sage)] hover:underline break-all inline-flex items-center gap-1"
              >
                {viewingDoc.url} <ArrowSquareOut size={13} />
              </a>
            }
          />
        </ViewModal>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="serif text-xl">{editingDoc ? "Edit Document" : "Add Link"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {confirming ? (
                <ConfirmDelete
                  message="Delete this document? This can't be undone."
                  onCancel={() => setConfirming(false)}
                  onConfirm={() => {
                    setConfirming(false);
                    handleDelete(editingDoc!.id);
                  }}
                />
              ) : (
                <>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={editingDoc?.title}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="e.g. Venue Contract v2"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Type</span>
                  <select
                    name="kind"
                    required
                    defaultValue={editingDoc?.kind || ""}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="Contract">Contract</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Moodboard">Moodboard</option>
                    <option value="Reference">Reference</option>
                    <option value="Rundown">Rundown</option>
                    <option value="Floor plan">Floor plan</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Vendor (optional)</span>
                  <input
                    name="vendor"
                    defaultValue={editingDoc?.vendor}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    placeholder="e.g. Padma Hall"
                  />
                </label>
              </div>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">URL</span>
                <input
                  name="url"
                  type="url"
                  required
                  defaultValue={editingDoc?.url}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="https://..."
                />
              </label>
              <div className="flex items-center justify-between pt-2">
                {editingDoc ? (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Trash size={16} /> Delete
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-2">
                  <QuietButton type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </QuietButton>
                  <QuietButton variant="primary" type="submit">
                    Save Link
                  </QuietButton>
                </div>
              </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
