import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X, Trash, PencilSimple } from "@phosphor-icons/react";
import { QuietButton } from "@/components/app-layout";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(onClose, 150);
  }, [onClose]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const focusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null,
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    (dialog?.querySelector<HTMLElement>("[autofocus]") ?? focusable()[0] ?? dialog)?.focus?.();
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      previous?.focus?.();
    };
  }, [close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-md ${
        closing
          ? "animate-out fade-out duration-150 ease-in"
          : "animate-in fade-in duration-200 ease-out"
      }`}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`bg-surface/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-browser ring-1 ring-black/5 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto focus:outline-none ${
          closing
            ? "animate-out fade-out zoom-out-95 duration-150 ease-in"
            : "animate-in fade-in zoom-in-95 duration-200"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="display text-xl">{title}</h2>
          <button
            onClick={close}
            aria-label="Close"
            className="p-1 rounded-md text-muted-foreground transition duration-150 hover:text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDelete({
  message,
  onCancel,
  onConfirm,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground">{message}</p>
      <div className="flex items-center justify-end gap-2 pt-2">
        <QuietButton type="button" onClick={onCancel}>
          Cancel
        </QuietButton>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center gap-2 rounded-md bg-destructive text-destructive-foreground px-3 py-1.5 text-sm font-medium hover:bg-destructive/90 transition duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash size={15} /> Delete
        </button>
      </div>
    </div>
  );
}

export function ViewModal({
  title,
  onClose,
  onEdit,
  onDelete,
  badge,
  children,
}: {
  title: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <ModalShell title="Confirm delete" onClose={onClose}>
        <ConfirmDelete
          message="This can't be undone. The item will be removed permanently."
          onCancel={() => setConfirming(false)}
          onConfirm={onDelete}
        />
      </ModalShell>
    );
  }

  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="space-y-3">
        {badge}
        {children}
      </div>
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors"
        >
          <Trash size={16} /> Delete
        </button>
        <div className="flex items-center gap-2">
          <QuietButton type="button" onClick={onClose}>
            Close
          </QuietButton>
          <QuietButton type="button" variant="primary" onClick={onEdit}>
            <PencilSimple size={15} /> Edit
          </QuietButton>
        </div>
      </div>
    </ModalShell>
  );
}

export function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="text-sm text-foreground mt-1 leading-relaxed whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
