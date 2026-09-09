import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarBlank,
  Check,
  ClipboardText,
  CurrencyCircleDollar,
  UsersThree,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { SeoCta } from "@/components/seo/seo-page";
import { cityPricing, locations, setupBudget, weddingTypes } from "@/lib/onboarding";
import { formatIDR, formatIDRInput, parseIDRInput } from "@/lib/types";

function addMonths(date: Date, months: number) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value;
}

function asDateLabel(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

const timelineMilestones = [
  {
    offset: -12,
    title: "Sepakati budget dan jumlah tamu awal",
    note: "Fondasi untuk semua keputusan vendor.",
  },
  {
    offset: -10,
    title: "Shortlist dan booking venue",
    note: "Venue populer biasanya penuh lebih cepat.",
  },
  {
    offset: -8,
    title: "Kunci catering, foto-video, dan dekor",
    note: "Bandingkan paket dan jadwal pembayaran.",
  },
  {
    offset: -5,
    title: "Susun guest list, undangan, dan seserahan",
    note: "Pisahkan tamu kedua pihak sejak awal.",
  },
  {
    offset: -3,
    title: "Finalisasi busana, fitting, dan rundown",
    note: "Mulai briefing keluarga dan vendor inti.",
  },
  {
    offset: -1,
    title: "Kunci RSVP, seating, dan konfirmasi vendor",
    note: "Siapkan call sheet hari H.",
  },
];

export function WeddingTimelineTool() {
  const [weddingDate, setWeddingDate] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const timeline = useMemo(() => {
    const date = weddingDate ? new Date(`${weddingDate}T12:00:00`) : null;
    if (!date || Number.isNaN(date.getTime())) return [];
    return timelineMilestones.map((milestone) => ({
      ...milestone,
      date: addMonths(date, milestone.offset),
    }));
  }, [weddingDate]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setHasGenerated(Boolean(weddingDate));
        }}
        className="panel h-fit p-6 sm:p-8"
      >
        <CalendarBlank size={24} className="text-primary" />
        <h2 className="display mt-5 text-2xl text-foreground">Masukkan tanggal pernikahanmu</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Kami susun titik keputusan utama dari sekarang sampai hari H. Kamu bisa menyesuaikannya
          lagi di workspace.
        </p>
        <label className="mt-6 block text-sm font-medium text-foreground" htmlFor="timeline-date">
          Tanggal pernikahan
        </label>
        <input
          id="timeline-date"
          type="date"
          required
          value={weddingDate}
          onChange={(event) => setWeddingDate(event.target.value)}
          className="mt-2 h-12 w-full border border-border px-4 text-base sm:text-sm"
        />
        <button
          type="submit"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[14px] bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          Generate timeline
        </button>
      </form>

      <div className="panel min-h-[360px] p-6 sm:p-8">
        {!hasGenerated ? (
          <div className="flex min-h-[300px] flex-col justify-center">
            <div className="eyebrow">Preview</div>
            <h2 className="display mt-3 text-2xl text-foreground">
              Timeline yang mengikuti tanggal kalian.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Masukkan tanggal untuk melihat kapan idealnya mulai budget, venue, vendor utama,
              undangan, dan final confirmation.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="eyebrow">Timeline awal</div>
                <h2 className="mt-1 text-xl font-semibold text-foreground">
                  Menuju {asDateLabel(new Date(`${weddingDate}T12:00:00`))}
                </h2>
              </div>
              <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                6 milestone
              </span>
            </div>
            <ol className="mt-5 space-y-5">
              {timeline.map((item) => (
                <li key={item.title} className="grid grid-cols-[92px_1fr] gap-4">
                  <time className="pt-0.5 text-xs font-medium text-muted-foreground">
                    {asDateLabel(item.date)}
                  </time>
                  <div className="border-l border-border pl-4">
                    <div className="text-sm font-semibold text-foreground">{item.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.note}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <SeoCta
              className="mt-7"
              label="Simpan timeline ini di OffStories"
              draft={{
                sourcePage: "/id/tools/wedding-timeline",
                contentCluster: "timeline",
                ctaVariant: "save_timeline",
                weddingDate,
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}

const budgetParts = [
  { label: "Venue", percent: 20 },
  { label: "Catering", percent: 35 },
  { label: "Decoration", percent: 12 },
  { label: "Photography & Video", percent: 10 },
  { label: "MUA & Attire", percent: 8 },
  { label: "Others + buffer", percent: 15 },
];

export function WeddingBudgetCalculator() {
  const [city, setCity] = useState("Jakarta");
  const [guests, setGuests] = useState(200);
  const [style, setStyle] = useState("Modern Wedding");
  const [budgetInput, setBudgetInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const total = budgetInput ? parseIDRInput(budgetInput) : setupBudget(guests, "no", "", city);
  const cityTier = cityPricing[city]?.tier ?? "menengah";

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
        className="panel h-fit p-6 sm:p-8"
      >
        <CurrencyCircleDollar size={24} className="text-primary" />
        <h2 className="display mt-5 text-2xl text-foreground">Buat estimasi awal</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Ini titik mulai, bukan quotation vendor. Angka bisa kamu lanjutkan dan ubah bersama
          pasangan.
        </p>
        <label className="mt-6 block text-sm font-medium" htmlFor="budget-city">
          Kota
        </label>
        <select
          id="budget-city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="mt-2 h-12 w-full border border-border px-4 text-sm"
        >
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <label className="mt-5 block text-sm font-medium" htmlFor="budget-guests">
          Jumlah tamu: {guests.toLocaleString("id-ID")}
        </label>
        <input
          id="budget-guests"
          type="range"
          min="20"
          max="3000"
          step="10"
          value={guests}
          onChange={(event) => setGuests(Number(event.target.value))}
          className="mt-3 w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20</span>
          <span>3.000 tamu</span>
        </div>
        <label className="mt-5 block text-sm font-medium" htmlFor="budget-style">
          Gaya pernikahan
        </label>
        <select
          id="budget-style"
          value={style}
          onChange={(event) => setStyle(event.target.value)}
          className="mt-2 h-12 w-full border border-border px-4 text-sm"
        >
          {weddingTypes.map((type) => (
            <option key={type.label}>{type.label}</option>
          ))}
        </select>
        <label className="mt-5 block text-sm font-medium" htmlFor="budget-total">
          Total budget (opsional)
        </label>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            Rp
          </span>
          <input
            id="budget-total"
            inputMode="numeric"
            value={formatIDRInput(budgetInput)}
            onChange={(event) => setBudgetInput(event.target.value)}
            placeholder="150.000.000"
            className="h-12 w-full border border-border py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <button
          type="submit"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[14px] bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          Hitung budget
        </button>
      </form>

      <div className="panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="eyebrow">{submitted ? "Estimasi kamu" : "Contoh estimasi"}</div>
            <div className="display mt-2 text-4xl text-foreground sm:text-5xl">
              {formatIDR(total)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {guests.toLocaleString("id-ID")} tamu · {city} · {style}
            </p>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Tier biaya {cityTier.replace(/-/g, " ")}
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {budgetParts.map((part) => (
            <div
              key={part.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"
            >
              <div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{part.label}</span>
                  <span className="text-muted-foreground">{part.percent}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${part.percent}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatIDR(Math.round((total * part.percent) / 100))}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
          Estimasi akan makin akurat setelah kamu memasukkan quotation, DP, dan pembayaran vendor.
        </p>
        <SeoCta
          className="mt-6"
          label="Kelola budget ini bersama pasangan"
          draft={{
            sourcePage: "/id/tools/kalkulator-budget-pernikahan",
            contentCluster: "budget",
            ctaVariant: "save_budget",
            city,
            guests,
            budget: total,
            weddingType: style,
          }}
        />
      </div>
    </section>
  );
}

const checklistItems = [
  "Tentukan tanggal dan format acara",
  "Sepakati total budget awal",
  "Shortlist 3 venue",
  "Buat daftar tamu per pihak",
  "Bandingkan vendor catering",
  "Atur sesi planning mingguan berdua",
];
const guestGroups = ["Keluarga mempelai 1", "Keluarga mempelai 2", "Teman dekat", "Rekan kerja"];

export function InteractiveTemplate({ type }: { type: "checklist" | "budget" | "guests" }) {
  const [checked, setChecked] = useState<string[]>([]);
  const sourcePage = `/id/templates/wedding-${type === "guests" ? "guest-list" : type}`;
  const details = {
    checklist: {
      icon: ClipboardText,
      title: "Wedding checklist yang bisa kamu mulai sekarang",
      description:
        "Centang tugas pertama, lalu lanjutkan dengan tenggat yang mengikuti tanggal pernikahanmu.",
      label: "Lanjutkan checklist ini di OffStories",
      cluster: "checklist" as const,
    },
    budget: {
      icon: CurrencyCircleDollar,
      title: "Template budget yang tidak berhenti di spreadsheet",
      description: "Mulai dari pos inti, lalu lanjutkan ke DP, pelunasan, dan siapa yang membayar.",
      label: "Gunakan budget ini di OffStories",
      cluster: "budget" as const,
    },
    guests: {
      icon: UsersThree,
      title: "Shared guest list untuk dua keluarga",
      description:
        "Pisahkan setiap pihak sejak awal agar jumlah pax, RSVP, dan seating tidak tercampur.",
      label: "Mulai shared guest list",
      cluster: "guests" as const,
    },
  }[type];
  const Icon = details.icon;
  const rows =
    type === "checklist"
      ? checklistItems
      : type === "budget"
        ? budgetParts.map((part) => `${part.label} · ${part.percent}%`)
        : guestGroups;

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="panel h-fit p-6 sm:p-8">
        <Icon size={24} className="text-primary" />
        <h2 className="display mt-5 text-2xl text-foreground">{details.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{details.description}</p>
        <div className="mt-6 space-y-3 text-sm text-muted-foreground">
          <p>• Bisa dipakai berdua dari browser</p>
          <p>• Tetap editable setelah dibuat</p>
          <p>• Terhubung ke modul planning lain</p>
        </div>
      </div>
      <div className="panel p-6 sm:p-8">
        <div className="eyebrow">Preview template</div>
        <div className="mt-5 divide-y divide-border border-y border-border">
          {rows.map((row) => {
            const active = checked.includes(row);
            return (
              <button
                key={row}
                type="button"
                onClick={() =>
                  setChecked((current) =>
                    active ? current.filter((item) => item !== row) : [...current, row],
                  )
                }
                className="flex w-full items-center gap-3 py-4 text-left text-sm transition-colors hover:text-primary"
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white"}`}
                >
                  {active && <Check size={13} weight="bold" />}
                </span>
                <span className={active ? "text-muted-foreground line-through" : "text-foreground"}>
                  {row}
                </span>
                {type === "guests" && (
                  <span className="ml-auto text-xs text-muted-foreground">0 pax</span>
                )}
              </button>
            );
          })}
        </div>
        <SeoCta
          className="mt-7"
          label={details.label}
          draft={{
            sourcePage,
            contentCluster: details.cluster,
            ctaVariant: `continue_${type}`,
            checkedTasks: checked,
            templateType: type,
          }}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          {checked.length
            ? `${checked.length} item dipilih — pilihan ini ikut tersimpan saat kamu mulai workspace.`
            : "Mulai dari satu item saja; kamu bisa ubah semuanya nanti."}
        </p>
      </div>
    </section>
  );
}

export function ProductLinkGrid() {
  const links = [
    {
      to: "/id/tools/wedding-timeline",
      label: "Wedding Timeline Generator",
      body: "Buat milestone dari tanggal pernikahanmu.",
    },
    {
      to: "/id/tools/kalkulator-budget-pernikahan",
      label: "Kalkulator Budget Pernikahan",
      body: "Hitung alokasi awal dari kota dan jumlah tamu.",
    },
    {
      to: "/id/templates/wedding-guest-list",
      label: "Wedding Guest List Template",
      body: "Mulai pembagian tamu dengan pasangan.",
    },
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {links.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="group rounded-[20px] border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          <div className="text-sm font-semibold text-foreground group-hover:text-primary">
            {item.label}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            Buka tool <ArrowRight size={14} />
          </span>
        </Link>
      ))}
    </div>
  );
}
