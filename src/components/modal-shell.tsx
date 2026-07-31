import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

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
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => el.offsetParent !== null);

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
        closing ? "animate-out fade-out duration-150 ease-in" : "animate-in fade-in duration-200 ease-out"
      }`}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`bg-surface border border-border rounded-xl shadow-2xl ring-1 ring-black/5 w-full max-w-lg p-6 focus:outline-none ${
          closing
            ? "animate-out fade-out zoom-out-95 duration-150 ease-in"
            : "animate-in fade-in zoom-in-95 duration-200"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="serif text-xl">{title}</h2>
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
