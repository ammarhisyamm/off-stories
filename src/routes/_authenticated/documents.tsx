import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { ViewModal, Detail, DetailGrid, ConfirmDelete } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { DocRef } from "@/lib/types";
import { useRef, useState } from "react";
import { X, Trash, ArrowSquareOut, FolderOpen } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/components/toast";

const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;

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
  const { data, setKind, workspaceId } = useWorkspaceData();
  const docs = data.documents as DocRef[];
  const [editingDoc, setEditingDoc] = useState<DocRef | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocRef | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveDocs = (newDocs: DocRef[], opts?: { success?: string | null }) => {
    setKind("documents", newDocs, opts);
  };

  const handleOpenNew = () => {
    setEditingDoc(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocRef) => {
    setEditingDoc(doc);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenView = (doc: DocRef) => {
    setViewingDoc(doc);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const kind = formData.get("kind") as DocRef["kind"];
    const vendor = formData.get("vendor") as string;
    const url = formData.get("url") as string;

    if (!editingDoc && !selectedFile && !url) {
      showToast("Add a PDF, DOCX, or URL first", "error");
      return;
    }

    setIsUploading(true);
    let filePath = editingDoc?.filePath;
    let fileMimeType = editingDoc?.mimeType;
    let fileSize = editingDoc?.size;

    if (selectedFile) {
      const allowedTypes = new Set([
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]);
      if (!allowedTypes.has(selectedFile.type) || selectedFile.size > MAX_DOCUMENT_SIZE_BYTES) {
        showToast("Choose a PDF or DOCX file up to 5 MB", "error");
        return;
      }
      if (!workspaceId) {
        showToast("Your workspace is not ready yet", "error");
        setIsUploading(false);
        return;
      }
      const fileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      filePath = `${workspaceId}/${crypto.randomUUID()}-${fileName}`;
      const { error } = await supabase.storage.from("documents").upload(filePath, selectedFile, {
        contentType: selectedFile.type,
        upsert: false,
      });
      if (error) {
        showToast(error.message || "Couldn't upload document", "error");
        setIsUploading(false);
        return;
      }
      fileMimeType = selectedFile.type;
      fileSize = selectedFile.size;
    }

    if (editingDoc) {
      saveDocs(
        docs.map((d) =>
          d.id === editingDoc.id
            ? { ...d, title, kind, vendor, url, filePath, mimeType: fileMimeType, size: fileSize }
            : d,
        ),
      );
    } else {
      const newDoc: DocRef = {
        id: `d${Date.now()}`,
        title,
        kind,
        vendor,
        url: selectedFile ? "" : url,
        filePath,
        mimeType: fileMimeType,
        size: fileSize,
        addedAt: new Date().toISOString().split("T")[0],
      };
      saveDocs([...docs, newDoc]);
    }
    setSelectedFile(null);
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const openDocument = async (doc: DocRef) => {
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      showToast("Allow pop-ups to open this document", "error");
      return;
    }
    if (!doc.filePath) {
      popup.location.href = doc.url;
      return;
    }
    const { data: signed, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.filePath, 60 * 60);
    if (error || !signed?.signedUrl) {
      popup.close();
      showToast("Couldn't open this document", "error");
      return;
    }
    popup.location.href = signed.signedUrl;
  };

  const handleDelete = (id: string) => {
    saveDocs(
      docs.filter((d) => d.id !== id),
      { success: "Document deleted" },
    );
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
          Add document
        </QuietButton>
      }
    >
      <div className="space-y-8">
        {docs.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={20} weight="duotone" />}
            title="No documents yet"
            description="Save links to contracts, invoices, moodboards and floor plans so everything lives in one vault."
            action={
              <QuietButton variant="primary" onClick={handleOpenNew}>
                Add document
              </QuietButton>
            }
          />
        ) : (
          Object.entries(byKind).map(([kind, list]) => (
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
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void openDocument(d);
                        }}
                        className="absolute right-0 top-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open document"
                      >
                        <ArrowSquareOut size={16} />
                      </button>
                    </div>
                    {d.vendor && (
                      <div className="text-xs text-muted-foreground mt-1">{d.vendor}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
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
            label={viewingDoc.filePath ? "File" : "URL"}
            value={
              <a
                href={viewingDoc.filePath ? undefined : viewingDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (viewingDoc.filePath) {
                    event.preventDefault();
                    void openDocument(viewingDoc);
                  }
                }}
                className="text-[color:var(--sage)] hover:underline break-all inline-flex items-center gap-1"
              >
                {viewingDoc.filePath ? "Open uploaded file" : viewingDoc.url}{" "}
                <ArrowSquareOut size={13} />
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
            <form onSubmit={(event) => void handleSave(event)} className="space-y-4">
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
                    <span className="block text-sm font-medium mb-1.5">URL (optional)</span>
                    <input
                      name="url"
                      type="url"
                      defaultValue={editingDoc?.url}
                      className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      placeholder="https://..."
                    />
                  </label>
                  <div className="rounded-lg border border-dashed border-border bg-surface-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">Upload a file</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          PDF or DOCX, up to 5 MB.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                      >
                        {selectedFile ? "Choose another" : "Choose file"}
                      </button>
                    </div>
                    {selectedFile && (
                      <div className="mt-3 text-xs text-muted-foreground">{selectedFile.name}</div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                      className="sr-only"
                      onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    />
                  </div>
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
                      <QuietButton variant="primary" type="submit" disabled={isUploading}>
                        {isUploading
                          ? "Uploading…"
                          : selectedFile
                            ? "Upload document"
                            : "Save Link"}
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
