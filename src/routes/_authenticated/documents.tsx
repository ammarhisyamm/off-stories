import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { ViewModal, Detail, DetailGrid, ConfirmDelete } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { DocRef } from "@/lib/types";
import { useMemo, useRef, useState } from "react";
import { X, Trash, ArrowSquareOut, FileText, FolderOpen } from "@phosphor-icons/react";
import { showToast } from "@/components/toast";
import { uploadDocument } from "@/lib/document.functions";
import { useServerFn } from "@tanstack/react-start";

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
  const { data, setKind, canEdit } = useWorkspaceData();
  const uploadDocumentFn = useServerFn(uploadDocument);
  const docs = data.documents as DocRef[];
  const [editingDoc, setEditingDoc] = useState<DocRef | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocRef | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedKind, setSelectedKind] = useState<DocRef["kind"] | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
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

    if (!editingDoc && !selectedFile && !url.trim()) {
      showToast("Add a PDF, DOCX, or URL first", "error");
      return;
    }

    let filePath = editingDoc?.filePath;
    let fileMimeType = editingDoc?.mimeType;
    let fileSize = editingDoc?.size;

    if (selectedFile) {
      const allowedTypes = new Set([
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]);
      const fileExtension = selectedFile.name.toLowerCase().split(".").pop();
      const validExtension = fileExtension === "pdf" || fileExtension === "docx";
      if (
        (!allowedTypes.has(selectedFile.type) && !validExtension) ||
        selectedFile.size > MAX_DOCUMENT_SIZE_BYTES
      ) {
        showToast("Choose a PDF or DOCX file up to 5 MB", "error");
        return;
      }
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.set("file", selectedFile);
      try {
        const uploaded = await uploadDocumentFn({ data: uploadData });
        filePath = uploaded.filePath;
        fileMimeType = uploaded.mimeType;
        fileSize = uploaded.size;
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Couldn't upload document", "error");
        setIsUploading(false);
        return;
      }
    }

    if (editingDoc) {
      saveDocs(
        docs.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                title,
                kind,
                vendor,
                url: url.trim(),
                filePath,
                mimeType: fileMimeType,
                size: fileSize,
              }
            : d,
        ),
      );
    } else {
      const newDoc: DocRef = {
        id: `d${Date.now()}`,
        title,
        kind,
        vendor,
        url: selectedFile ? "" : url.trim(),
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
    popup.location.href = `/api/documents/${doc.filePath.split("/").map(encodeURIComponent).join("/")}`;
  };

  const handleDelete = (id: string) => {
    saveDocs(
      docs.filter((d) => d.id !== id),
      { success: "Document deleted" },
    );
    setIsModalOpen(false);
  };

  const kinds = Array.from(new Set(docs.map((doc) => doc.kind)));
  const visibleDocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return docs
      .filter((doc) => selectedKind === "all" || doc.kind === selectedKind)
      .filter(
        (doc) =>
          !normalizedQuery ||
          [doc.title, doc.vendor, documentKindLabel(doc.kind)].some((value) =>
            value?.toLowerCase().includes(normalizedQuery),
          ),
      )
      .sort((a, b) => {
        if (sort === "name") return a.title.localeCompare(b.title);
        const direction = sort === "newest" ? -1 : 1;
        return direction * (new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
      });
  }, [docs, query, selectedKind, sort]);

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
      <div className="space-y-7">
        {docs.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={20} weight="duotone" />}
            title="No documents yet"
            description="Save links to contracts, invoices, moodboards and floor plans so everything lives in one vault."
            action={
              canEdit ? (
                <QuietButton variant="primary" onClick={handleOpenNew}>
                  Add document
                </QuietButton>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              <CategoryCard
                active={selectedKind === "all"}
                label="All Documents"
                count={docs.length}
                onClick={() => setSelectedKind("all")}
              />
              {kinds.map((kind) => (
                <CategoryCard
                  key={kind}
                  active={selectedKind === kind}
                  label={documentKindLabel(kind)}
                  count={docs.filter((doc) => doc.kind === kind).length}
                  onClick={() => setSelectedKind(kind)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="block min-w-0 flex-1">
                <span className="sr-only">Search documents</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, vendor, or type"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base sm:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block shrink-0">
                <span className="sr-only">Sort documents</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as typeof sort)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleDocs.map((d) => (
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
                  className="group flex min-h-[180px] cursor-pointer flex-col rounded-[20px] border border-border bg-surface p-5 transition duration-200 hover:-translate-y-px hover:border-primary/45 hover:shadow-[0_8px_30px_rgb(15_23_42_/_0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/8 text-primary">
                      <FileText size={24} weight="regular" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="min-w-0 truncate text-base font-medium text-foreground">
                          {d.title}
                        </h3>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void openDocument(d);
                          }}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                          title="Open document"
                          aria-label={`Open ${d.title}`}
                        >
                          <ArrowSquareOut size={18} />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDocumentSize(d.size)} <span aria-hidden="true">•</span>{" "}
                        {new Date(d.addedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {d.vendor && (
                    <p className="mt-4 truncate text-sm text-muted-foreground">{d.vendor}</p>
                  )}
                  <div className="mt-auto pt-5">
                    <Pill tone="taupe">{documentKindLabel(d.kind)}</Pill>
                  </div>
                </div>
              ))}
              {visibleDocs.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  No documents match your search.
                </p>
              )}
            </div>
          </>
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
                    <div className="mb-3 text-sm font-medium text-foreground">
                      Document source *
                    </div>
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

function documentKindLabel(kind: DocRef["kind"]) {
  const labels: Record<DocRef["kind"], string> = {
    Contract: "Contracts",
    Invoice: "Invoices",
    Moodboard: "Moodboards",
    Reference: "References",
    Rundown: "Rundowns",
    "Floor plan": "Floor plans",
  };
  return labels[kind];
}

function formatDocumentSize(size?: number) {
  if (!size) return "Link";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function CategoryCard({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[112px] items-center gap-3 rounded-[20px] border p-4 text-left transition duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 ${
        active
          ? "border-primary bg-primary/5 shadow-[0_6px_20px_rgb(91_14_32_/_0.08)]"
          : "border-border bg-surface hover:border-primary/35 hover:shadow-[0_6px_20px_rgb(15_23_42_/_0.05)]"
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
          active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
        }`}
      >
        <FolderOpen size={22} weight="regular" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground sm:text-base">
          {label}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {count} {count === 1 ? "file" : "files"}
        </span>
      </span>
    </button>
  );
}
