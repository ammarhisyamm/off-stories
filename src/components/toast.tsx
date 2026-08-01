import { useEffect, useState } from "react";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

type Tone = "success" | "error";
type ToastItem = { id: number; message: string; tone: Tone };

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  listeners.forEach((l) => l());
}

export function showToast(message: string, tone: Tone = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3200);
}

export function useToasts(): ToastItem[] {
  const [state, setState] = useState<ToastItem[]>(toasts);
  useEffect(() => {
    const listener = () => setState(toasts);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return state;
}

export function ToastViewport() {
  const items = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0 sm:items-end"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex w-full items-start gap-2.5 rounded-lg border bg-surface px-3.5 py-3 text-sm shadow-soft animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            t.tone === "error" ? "border-destructive/30" : "border-border"
          }`}
        >
          {t.tone === "error" ? (
            <WarningCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-destructive" />
          ) : (
            <CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-sage" />
          )}
          <span className="flex-1 text-foreground">{t.message}</span>
          <button
            onClick={() => {
              toasts = toasts.filter((x) => x.id !== t.id);
              emit();
            }}
            aria-label="Dismiss"
            className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
