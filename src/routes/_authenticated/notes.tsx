import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Pill, QuietButton } from "@/components/app-layout";
import { notes as initialNotes, Note } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { X, Trash } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes & Decisions — Wedding Preparation" },
      {
        name: "description",
        content:
          "Decision log — keep meeting notes, family requests, and important calls in one place.",
      },
    ],
  }),
  component: Notes,
});

function Notes() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wedding_notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      localStorage.setItem("wedding_notes", JSON.stringify(initialNotes));
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem("wedding_notes", JSON.stringify(newNotes));
  };

  const handleOpenNew = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const tag = formData.get("tag") as string;
    const date = formData.get("date") as string;

    if (editingNote) {
      saveNotes(notes.map((n) => (n.id === editingNote.id ? { ...n, title, body, tag, date } : n)));
    } else {
      const newNote: Note = {
        id: `n${Date.now()}`,
        title,
        body,
        tag,
        date: date || new Date().toISOString().split("T")[0],
      };
      saveNotes([...notes, newNote]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
    setIsModalOpen(false);
  };

  return (
    <AppLayout
      eyebrow="Decision log"
      title="Notes & decisions"
      actions={
        <QuietButton variant="primary" onClick={handleOpenNew}>
          New note
        </QuietButton>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notes.map((n) => (
          <article
            key={n.id}
            className="panel p-6 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleOpenEdit(n)}
          >
            <div className="flex items-center justify-between mb-3">
              <Pill tone={n.tag === "Decision" ? "sage" : n.tag === "Family" ? "rose" : "taupe"}>
                {n.tag}
              </Pill>
              <span className="text-xs text-muted-foreground">
                {new Date(n.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h3 className="serif text-lg text-foreground">{n.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
              {n.body}
            </p>
          </article>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="serif text-xl">{editingNote ? "Edit Note" : "New Note"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={editingNote?.title}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="e.g. Venue Meeting Notes"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Tag</span>
                  <select
                    name="tag"
                    defaultValue={editingNote?.tag || "Decision"}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="Decision">Decision</option>
                    <option value="Family">Family</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Date</span>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingNote?.date || new Date().toISOString().split("T")[0]}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </label>
              </div>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Body</span>
                <textarea
                  name="body"
                  required
                  rows={5}
                  defaultValue={editingNote?.body}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                  placeholder="Write your note here..."
                ></textarea>
              </label>
              <div className="flex items-center justify-between pt-2">
                {editingNote ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingNote.id)}
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
                    Save Note
                  </QuietButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
