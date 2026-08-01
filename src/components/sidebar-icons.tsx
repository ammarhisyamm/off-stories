import type { CSSProperties, ReactNode } from "react";

function S({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      className={`sidebar-icon ${className ?? ""}`}
    >
      {children}
    </svg>
  );
}

function p(d: string, i: number): ReactNode {
  return <path key={i} d={d} pathLength={1} style={{ "--i": i } as CSSProperties} />;
}

function c(cx: number, cy: number, r: number, i: number): ReactNode {
  return (
    <circle key={i} cx={cx} cy={cy} r={r} pathLength={1} style={{ "--i": i } as CSSProperties} />
  );
}

export function SidebarHouse({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M3.2 10.4 L12 3.6 L20.8 10.4", 0)}
      {p("M6 10.6 V19.8 H18 V10.6", 1)}
      {p("M10.4 19.8 V14.8 H13.6 V19.8", 2)}
    </S>
  );
}

export function SidebarCalendar({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M5 6.4 H19 V19.2 H5 Z", 0)}
      {p("M8.4 4 V8.4 M15.6 4 V8.4", 1)}
      {c(9.6, 12.6, 0.9, 2)}
      {c(12, 12.6, 0.9, 3)}
      {c(14.4, 12.6, 0.9, 4)}
      {c(9.6, 15.8, 0.9, 5)}
      {c(12, 15.8, 0.9, 6)}
      {c(14.4, 15.8, 0.9, 7)}
    </S>
  );
}

export function SidebarChecklist({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M5.4 6 H18.6 V18.6 H5.4 Z", 0)}
      {p("M8.2 12.2 L11 15 L15.8 9.6", 1)}
    </S>
  );
}

export function SidebarBudget({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M12 3.6 V20.4", 0)}
      {p(
        "M17.6 6.7 C17.6 4.1 13.4 3.4 11.6 4.5 C8.6 6.2 8.6 9.3 11 10.8 C13.6 12.4 16.4 12.9 15.8 16.2 C15.3 18.9 9.4 19.4 7.2 17.3",
        1,
      )}
    </S>
  );
}

export function SidebarVendors({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M3.4 5.2 H20.6 L21.2 7.6 H2.8 Z", 0)}
      {p(
        "M4 7.6 C4.9 9.4 6.1 9.4 7 7.6 C7.9 9.4 9.1 9.4 10 7.6 C10.9 9.4 12.1 9.4 13 7.6 C13.9 9.4 15.1 9.4 16 7.6 C16.9 9.4 18.1 9.4 19 7.6",
        1,
      )}
      {p("M5.4 10.8 H18.6 V19.4 H5.4 Z", 2)}
      {p("M10.4 19.4 V15.2 H13.6 V19.4", 3)}
    </S>
  );
}

export function SidebarGuests({ className }: { className?: string }) {
  return (
    <S className={className}>
      {c(9.6, 7.8, 2.5, 0)}
      {p("M5 18.4 C5 14.9 7.6 13.2 9.6 13.2 C11.6 13.2 14.2 14.9 14.2 18.4", 1)}
      {c(16.2, 8.6, 2.3, 2)}
      {p("M14.6 13.3 C17.8 13.5 19.4 15.3 19.4 18.4", 3)}
    </S>
  );
}

export function SidebarNotes({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M6 3.4 H13.4 L17.6 7.6 V20.6 H6 Z", 0)}
      {p("M13.4 3.4 V7.6 H17.6", 1)}
      {p("M9.2 13.2 H14.8", 2)}
      {p("M9.2 16.4 H14.8", 3)}
    </S>
  );
}

export function SidebarDocuments({ className }: { className?: string }) {
  return (
    <S className={className}>
      {p("M3.6 7.4 H12.6 L14.6 5.4 H20.4 V8.6", 0)}
      {p("M4.4 8.6 H20.6 L19.2 19.4 H5.4 Z", 1)}
    </S>
  );
}

export function SidebarSettings({ className }: { className?: string }) {
  return (
    <S className={className}>
      {c(12, 12, 7.6, 0)}
      {c(12, 12, 3.1, 1)}
      {p(
        "M12 2.1 L12 4.4 M19 5 L17.4 6.6 M21.9 12 L19.6 12 M19 19 L17.4 17.4 M12 21.9 L12 19.6 M5 19 L6.6 17.4 M2.1 12 L4.4 12 M5 5 L6.6 6.6",
        2,
      )}
    </S>
  );
}
