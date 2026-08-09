import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, EmptyState, Pill, QuietButton } from "@/components/app-layout";
import { AddRundownModal } from "@/components/add-rundown-modal";
import { ViewModal, Detail, DetailGrid } from "@/components/modal-shell";
import { useWorkspaceData } from "@/lib/use-workspace-data";
import type { RundownItem } from "@/lib/types";
import { ClipboardText, Check } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/rundown")({
  head: () => ({
    meta: [
      { title: "Rundown — Wedding Preparation" },
      { name: "description", content: "Hourly wedding-day schedule with owners and notes." },
    ],
  }),
  component: Rundown,
});

function Rundown() {
  const { data, setKind, canEdit } = useWorkspaceData();
  const items = data.rundown as RundownItem[];
  const [editing, setEditing] = useState<RundownItem | null>(null);
  const [viewing, setViewing] = useState<RundownItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function saveItem(item: RundownItem) {
    const next = items.some((current) => current.id === item.id)
      ? items.map((current) => (current.id === item.id ? item : current))
      : [...items, item];
    setKind("rundown", next);
    setEditing(null);
    setIsModalOpen(false);
  }

  function deleteItem(id: string) {
    setKind(
      "rundown",
      items.filter((item) => item.id !== id),
      { success: "Rundown item deleted" },
    );
    setViewing(null);
    setEditing(null);
    setIsModalOpen(false);
  }

  function toggleItem(id: string) {
    setKind(
      "rundown",
      items.map((item) =>
        item.id === id ? { ...item, status: item.status === "done" ? "planned" : "done" } : item,
      ),
      { success: null },
    );
  }

  const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <AppLayout
      eyebrow="Wedding day"
      title="Rundown"
      actions={
        <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
          Add agenda
        </QuietButton>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <div className="eyebrow">Agenda items</div>
          <div className="serif mt-2 text-2xl tabular-nums">{items.length}</div>
        </div>
        <div className="panel p-5">
          <div className="eyebrow">PICs assigned</div>
          <div className="serif mt-2 text-2xl tabular-nums">
            {items.filter((item) => item.pic).length}
          </div>
        </div>
        <div className="panel p-5">
          <div className="eyebrow">Ready</div>
          <div className="serif mt-2 text-2xl tabular-nums">
            {items.filter((item) => item.status === "done").length}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ClipboardText size={20} weight="duotone" />}
          title="Your wedding-day rundown is empty"
          description="Add the ceremony, family cues, vendor arrivals, and reception moments in the order they happen."
          action={
            canEdit ? (
              <QuietButton variant="primary" onClick={() => setIsModalOpen(true)}>
                Add first agenda
              </QuietButton>
            ) : undefined
          }
        />
      ) : (
        <div className="panel divide-y divide-border">
          {sortedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-4">
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-label={item.status === "done" ? "Mark as planned" : "Mark as ready"}
                disabled={!canEdit}
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.status === "done" ? "border-sage bg-sage text-white" : "border-border text-transparent hover:border-muted-foreground"} ${canEdit ? "active:scale-90" : "cursor-not-allowed opacity-50"}`}
              >
                <Check size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setViewing(item)}
                className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {item.time}
                  </span>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {[item.location, item.pic ? `PIC: ${item.pic}` : undefined]
                    .filter(Boolean)
                    .join(" · ") || "No location or PIC yet"}
                </div>
              </button>
              <Pill tone={item.status === "done" ? "sage" : "neutral"}>
                {item.status === "done" ? "Ready" : "Planned"}
              </Pill>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <ViewModal
          title="Rundown details"
          onClose={() => setViewing(null)}
          onDelete={() => deleteItem(viewing.id)}
          onEdit={() => {
            const item = viewing;
            setViewing(null);
            setEditing(item);
            setIsModalOpen(true);
          }}
          badge={
            <Pill tone={viewing.status === "done" ? "sage" : "neutral"}>{viewing.status}</Pill>
          }
        >
          <DetailGrid>
            <Detail label="Time" value={viewing.time} />
            <Detail label="PIC" value={viewing.pic ?? "Unassigned"} />
            <Detail label="Location" value={viewing.location ?? "Not set"} />
            <Detail label="Notes" value={viewing.notes ?? "No notes"} />
          </DetailGrid>
          <Detail label="Agenda" value={viewing.title} />
        </ViewModal>
      )}

      {isModalOpen && (
        <AddRundownModal
          initial={editing ?? undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
          }}
          onSave={saveItem}
          onDelete={deleteItem}
        />
      )}
    </AppLayout>
  );
}
