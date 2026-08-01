import type { ReactNode } from "react";

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-browser">
      <div className="flex items-center gap-1.5 border-b border-border bg-background px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--rose)]/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--taupe)]/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--sage)]/60" />
        <div className="ml-3 flex-1 truncate rounded-md border border-border bg-surface-2 px-3 py-1 text-[10px] text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 serif text-sm leading-none text-foreground">{value}</div>
      {hint ? <div className="mt-0.5 text-[8px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function Progress({ pct, tone }: { pct: number; tone?: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full ${tone ?? "bg-sage"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const nav = [
  "Dashboard",
  "Timeline",
  "Checklist",
  "Budget",
  "Vendors",
  "Guests",
  "Notes",
  "Documents",
  "Settings",
];

function Sidebar() {
  return (
    <div className="hidden w-36 shrink-0 flex-col gap-0.5 border-r border-border bg-surface-2/50 p-3 sm:flex">
      {nav.map((item, i) => (
        <div
          key={item}
          className={`flex items-center gap-2 rounded-md px-2 py-1 text-[10px] ${
            i === 0 ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-sage" : "bg-[color:var(--taupe)]/40"}`}
          />
          {item}
        </div>
      ))}
      <div className="mt-3 rounded-md border border-dashed border-border px-2 py-2 text-[9px] text-muted-foreground">
        + Add collaborators
      </div>
    </div>
  );
}

export function DashboardMockup() {
  const tasks = [
    { t: "Konfirmasi floor plan dengan venue", cat: "Venue", p: "high", s: "in_progress" },
    { t: "Tasting menu catering — putaran kedua", cat: "Catering", p: "high", s: "todo" },
    { t: "Fitting gaun pertama", cat: "Attire", p: "medium", s: "todo" },
    { t: "Finalisasi konsep moodboard dekorasi", cat: "Dekorasi", p: "high", s: "in_progress" },
  ];
  return (
    <BrowserFrame url="app.offstories.fun/dashboard">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Akad + Resepsi · Bandung, ID
              </div>
              <div className="serif text-base leading-snug text-foreground">
                77 days to Andra &amp; Kirana
              </div>
            </div>
            <div className="rounded-md bg-primary px-2.5 py-1.5 text-[9px] font-medium text-primary-foreground">
              + Add task
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Tasks" value="6" hint="3 in progress" />
            <Stat label="Budget" value="425M" hint="238M committed" />
            <Stat label="Vendors" value="4" hint="booked" />
            <Stat label="Guests" value="214" hint="confirmed · 320" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-5">
            <div className="rounded-lg border border-border bg-surface p-2.5 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-foreground">
                  This week
                </span>
                <span className="text-[9px] text-sage">3 due</span>
              </div>
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <div key={task.t} className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full border ${
                        task.p === "high" ? "border-rose bg-rose/30" : "border-taupe bg-taupe/30"
                      }`}
                    />
                    <span className="truncate text-[10px] text-foreground">{task.t}</span>
                    <span className="ml-auto shrink-0 text-[8px] text-muted-foreground">
                      {task.cat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-2.5 lg:col-span-2">
              <div className="mb-2 text-[9px] font-medium uppercase tracking-[0.1em] text-foreground">
                Milestones
              </div>
              <div className="space-y-1.5">
                {[
                  { t: "Tentukan venue akad", d: true },
                  { t: "DP catering", d: true },
                  { t: "Fitting pertama", d: false },
                  { t: "Pelunasan dekorasi", d: false },
                ].map((m) => (
                  <div key={m.t} className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${m.d ? "bg-sage" : "bg-surface-2"}`}
                    />
                    <span
                      className={`text-[10px] ${m.d ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {m.t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function ChecklistMockup() {
  const rows = [
    { t: "Urus surat N1–N4 di kelurahan", cat: "Legal", p: "high", done: false },
    { t: "Desain undangan digital", cat: "Invitation", p: "medium", done: false },
    { t: "Book MUA utama", cat: "Attire", p: "high", done: true },
    { t: "Tentukan venue akad", cat: "Venue", p: "high", done: true },
    { t: "Pilih souvenir tamu", cat: "Souvenir", p: "low", done: false },
    { t: "Setor DP catering", cat: "Catering", p: "high", done: true },
  ];
  return (
    <BrowserFrame url="app.offstories.fun/checklist">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 p-3.5 sm:p-4">
          <div className="mb-2 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Checklist
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[58%] rounded-full bg-sage" />
          </div>
          <div className="space-y-1">
            {rows.map((r) => (
              <div
                key={r.t}
                className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-2.5 py-1.5"
              >
                <span
                  className={`grid h-3 w-3 shrink-0 place-items-center rounded-full border ${
                    r.done ? "border-sage bg-sage" : "border-border bg-background"
                  }`}
                >
                  {r.done ? (
                    <span className="text-[7px] leading-none text-primary-foreground">✓</span>
                  ) : null}
                </span>
                <span
                  className={`truncate text-[10px] ${r.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {r.t}
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-medium ${
                    r.p === "high"
                      ? "bg-rose/15 text-[color:var(--rose)]"
                      : r.p === "medium"
                        ? "bg-taupe/15 text-[color:var(--taupe)]"
                        : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {r.p}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function BudgetMockup() {
  const rows = [
    { cat: "Venue", vendor: "Padma Hall", amount: "95M", pct: 32 },
    { cat: "Catering", vendor: "Mawar Catering", amount: "120M", pct: 30 },
    { cat: "Dekorasi", vendor: "Studio Layang", amount: "65M", pct: 0 },
    { cat: "Foto & Video", vendor: "Antara Visual", amount: "48M", pct: 29 },
    { cat: "Attire", vendor: "Atelier Sage", amount: "42M", pct: 29 },
  ];
  return (
    <BrowserFrame url="app.offstories.fun/budget">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 p-3.5 sm:p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Budget · 425M
            </span>
            <span className="serif text-sm text-foreground">56% committed</span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[56%] rounded-full bg-sage" />
          </div>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.cat} className="rounded-md border border-border bg-surface px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] text-foreground">{r.cat}</span>
                  <span className="shrink-0 text-[9px] text-muted-foreground">{r.vendor}</span>
                  <span className="shrink-0 text-[10px] font-medium text-foreground">
                    {r.amount}
                  </span>
                </div>
                <div className="mt-1.5">
                  <Progress pct={r.pct} tone={r.pct === 0 ? "bg-taupe/60" : "bg-sage"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function GuestsMockup() {
  const rows = [
    { name: "Keluarga Rahardjo", side: "Bride", pax: 8, s: "yes" },
    { name: "Keluarga Wijaya", side: "Groom", pax: 12, s: "yes" },
    { name: "Office — Andra", side: "Groom", pax: 18, s: "maybe" },
    { name: "Tante Mira & family", side: "Bride", pax: 4, s: "pending" },
    { name: "Sahabat SMA — Kirana", side: "Bride", pax: 10, s: "yes" },
  ];
  const tone = (s: string) =>
    s === "yes"
      ? "bg-sage/20 text-sage"
      : s === "maybe"
        ? "bg-taupe/20 text-taupe"
        : "bg-surface-2 text-muted-foreground";
  const label = (s: string) => (s === "yes" ? "Confirmed" : s === "maybe" ? "Maybe" : "Pending");
  return (
    <BrowserFrame url="app.offstories.fun/guests">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 p-3.5 sm:p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Guests · 268 invited
            </span>
            <span className="serif text-sm text-foreground">214 confirmed</span>
          </div>
          <div className="mb-3 flex gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-sage/70" />
            <div className="h-1.5 w-[16%] rounded-full bg-taupe/50" />
            <div className="h-1.5 w-[8%] rounded-full bg-surface-2" />
          </div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div
                key={r.name}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5"
              >
                <span className="truncate text-[10px] text-foreground">{r.name}</span>
                <span className="shrink-0 text-[8px] text-muted-foreground">
                  {r.side} · {r.pax}
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-medium ${tone(r.s)}`}
                >
                  {label(r.s)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function TimelineMockup() {
  const items = [
    { m: "T-5 months", t: "Tentukan venue akad", d: true },
    { m: "T-4 months", t: "DP catering", d: true },
    { m: "T-3 months", t: "Floor plan finalisasi", d: false },
    { m: "T-2 months", t: "Fitting pertama", d: false },
    { m: "T-1 month", t: "Final guest count", d: false },
  ];
  return (
    <BrowserFrame url="app.offstories.fun/timeline">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 p-3.5 sm:p-4">
          <div className="mb-3 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Timeline · Andra &amp; Kirana
          </div>
          <div className="relative space-y-3 pl-4">
            <div className="absolute bottom-1 left-[3px] top-1 w-px bg-border" />
            {items.map((i) => (
              <div key={i.t} className="relative flex items-start gap-2.5">
                <span
                  className={`absolute -left-4 mt-0.5 h-2 w-2 rounded-full ${i.d ? "bg-sage" : "border border-border bg-background"}`}
                />
                <div className="w-20 shrink-0 text-[8px] uppercase tracking-wider text-muted-foreground">
                  {i.m}
                </div>
                <span
                  className={`text-[10px] ${i.d ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {i.t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
