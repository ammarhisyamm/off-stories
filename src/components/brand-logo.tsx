import type { HTMLAttributes } from "react";

export function BrandLogo({
  compact = false,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 text-foreground ${className}`.trim()}
      aria-label="Off Frames Stories"
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 120 120" className="h-8 w-8 shrink-0">
        <rect width="120" height="120" rx="20" fill="#111111" />
        <circle cx="56" cy="60" r="34" fill="#ffffff" />
        <circle cx="56" cy="60" r="18" fill="#111111" />
        <circle cx="77" cy="43" r="12" fill="#111111" />
      </svg>
      {!compact && (
        <span className="whitespace-nowrap text-base font-semibold tracking-[-0.065em]">
          <span className="font-bold">OFFRAME</span>
          <span className="font-normal">STORIES</span>
        </span>
      )}
    </div>
  );
}
