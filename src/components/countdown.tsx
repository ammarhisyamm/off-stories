import { useEffect, useState } from "react";

const DAY_MS = 86400000;
const HOUR_MS = 3_600_000;
const MIN_MS = 60_000;

type Ticker = { days: number; hours: number; minutes: number; seconds: number };

function diffUnits(target: string): Ticker {
  const targetTime = new Date(`${target}T00:00:00`).getTime();
  if (Number.isNaN(targetTime)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  let diff = Math.max(0, targetTime - Date.now());
  const days = Math.floor(diff / DAY_MS);
  diff -= days * DAY_MS;
  const hours = Math.floor(diff / HOUR_MS);
  diff -= hours * HOUR_MS;
  const minutes = Math.floor(diff / MIN_MS);
  const seconds = Math.floor((diff - minutes * MIN_MS) / 1000);
  return { days, hours, minutes, seconds };
}

function useCountdown(target: string): Ticker {
  const [state, setState] = useState<Ticker>(() => diffUnits(target));
  useEffect(() => {
    setState(diffUnits(target));
    const id = setInterval(() => setState(diffUnits(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return state;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const SEGMENTS: { key: keyof Ticker; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/**
 * A live wallclock countdown to a wedding date ("YYYY-MM-DD").
 * Used on the dashboard hero and the public invitation page.
 */
export function Countdown({ target, compact = false }: { target: string; compact?: boolean }) {
  const t = useCountdown(target);
  const passed = new Date(`${target}T00:00:00`).getTime() < Date.now();

  if (compact) {
    return passed ? (
      <span className="text-sm text-muted-foreground">The big day has come.</span>
    ) : (
      <span className="inline-flex items-baseline gap-2 tabular-nums text-foreground">
        <span className="serif text-2xl">{t.days}d</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
        </span>
      </span>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {SEGMENTS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-border bg-surface/80 px-2 py-4 text-center shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]"
        >
          <div className="serif text-3xl tabular-nums text-foreground sm:text-4xl">
            {pad(t[key])}
          </div>
          <div className="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CountdownPassedNotice({ target }: { target: string }) {
  const passed = new Date(`${target}T00:00:00`).getTime() < Date.now();
  if (!passed) return null;
  return (
    <div className="text-sm text-muted-foreground">
      The day has arrived — set your reminders, rest, and enjoy the celebration.
    </div>
  );
}
