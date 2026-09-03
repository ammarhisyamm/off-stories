import { CalendarCheck, MapPin, Notebook, Sparkle, UsersThree } from "@phosphor-icons/react";
import {
  adatOptions,
  adatProcessions,
  ceremonyOptions,
  interpretBudget,
  interpretGuests,
  interpretLocation,
  interpretOrganizer,
  interpretVenue,
  interpretWeddingType,
  locations,
  payerLabels,
  religions,
  timeSlots,
  venueTypes,
  weddingTypes,
  type PlanningInterpretation,
  type SetupState,
} from "@/lib/onboarding";
import { formatIDRInput } from "@/lib/types";
import { QuestionShell } from "./onboarding-modal";

const typeIcons = {
  notebook: Notebook,
  sparkle: Sparkle,
  "users-three": UsersThree,
  "map-pin": MapPin,
  "calendar-check": CalendarCheck,
};

export function LocationVenueStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <QuestionShell
      question={1}
      total={7}
      onBack={onBack}
      onNext={onNext}
      disabled={!setup.location}
    >
      <h3 className="display text-2xl">Di mana pernikahan akan digelar?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Kota & venue menentukan harga catering, dekor, dan logistik — riset 2025 bawa beda 2×.
      </p>
      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium">Kota *</span>
        <select
          value={setup.location}
          onChange={(event) => onUpdate({ location: event.target.value })}
          className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
        >
          <option value="">Pilih kota</option>
          {locations.map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>
      </label>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Tipe venue</span>
          <select
            value={setup.venueType}
            onChange={(e) => onUpdate({ venueType: e.target.value as SetupState["venueType"] })}
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm text-foreground"
          >
            <option value="">Pilih tipe</option>
            {venueTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Status venue</span>
          <select
            value={setup.venueStatus}
            onChange={(e) => onUpdate({ venueStatus: e.target.value as SetupState["venueStatus"] })}
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm text-foreground"
          >
            <option value="not_decided">Belum menentukan</option>
            <option value="shortlisted">Sudah shortlist</option>
            <option value="booked">Sudah booking / DP</option>
          </select>
        </label>
      </div>
      {(setup.venueStatus !== "not_decided" || setup.venueType) && (
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium">Nama venue (opsional)</span>
          <input
            value={setup.venueName}
            onChange={(e) => onUpdate({ venueName: e.target.value })}
            placeholder="Contoh: Balai Kartini, The Ritz-Carlton Bali"
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm text-foreground"
          />
        </label>
      )}
      <InterpretationPanel data={interpretLocation(setup.location)} />
      {setup.venueType && (
        <InterpretationPanel data={interpretVenue(setup.venueType, setup.venueStatus)} />
      )}
    </QuestionShell>
  );
}

export function GuestsStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  // keep total = bride + groom; if total slider moves, split proportionally
  function onTotal(v: number) {
    const ratio = setup.guests ? setup.guestsBride / setup.guests : 0.5;
    const bride = Math.round(v * ratio);
    onUpdate({ guests: v, guestsBride: bride, guestsGroom: v - bride });
  }
  return (
    <QuestionShell question={2} total={7} onBack={onBack} onNext={onNext}>
      <h3 className="display text-2xl">Berapa tamu yang diundang?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Pisahkan per pihak — ngaruh kapasitas gedung & catering 40–50% budget.
      </p>
      <div className="mt-6 rounded-2xl bg-[#f6f6f6] p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm text-muted-foreground">Total tamu</span>
          <output className="display text-3xl tabular-nums">{setup.guests}</output>
        </div>
        <input
          type="range"
          min={20}
          max={1000}
          step={10}
          value={setup.guests}
          onChange={(e) => onTotal(Number(e.target.value))}
          className="mt-5 w-full accent-black"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>20</span>
          <span>1000 tamu</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Mempelai 1</span>
            <input
              type="number"
              min={0}
              max={1000}
              value={setup.guestsBride}
              onChange={(e) => {
                const b = Math.max(0, Number(e.target.value));
                onUpdate({
                  guestsBride: b,
                  guestsGroom: Math.max(0, setup.guests - b),
                  guests: Math.max(b + setup.guestsGroom, 20),
                });
              }}
              className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Mempelai 2</span>
            <input
              type="number"
              min={0}
              max={1000}
              value={setup.guestsGroom}
              onChange={(e) => {
                const g = Math.max(0, Number(e.target.value));
                onUpdate({
                  guestsGroom: g,
                  guestsBride: Math.max(0, setup.guests - g),
                  guests: Math.max(setup.guestsBride + g, 20),
                });
              }}
              className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm"
            />
          </label>
        </div>
      </div>
      <InterpretationPanel
        data={interpretGuests(setup.guests, setup.guestsBride, setup.guestsGroom)}
      />
    </QuestionShell>
  );
}

export function DateTimeStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const primary = setup.akadDate || setup.weddingDate;
  return (
    <QuestionShell question={3} total={7} onBack={onBack} onNext={onNext} disabled={!primary}>
      <h3 className="display text-2xl">Kapan acaranya?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Akad & resepsi bisa beda hari; jam menentukan catering & dekor.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Tanggal Akad *</span>
          <input
            type="date"
            value={setup.akadDate || setup.weddingDate}
            onChange={(e) =>
              onUpdate({
                akadDate: e.target.value,
                weddingDate: e.target.value,
                resepsiDate: setup.resepsiDate || e.target.value,
              })
            }
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Tanggal Resepsi</span>
          <input
            type="date"
            value={setup.resepsiDate || setup.akadDate || setup.weddingDate}
            onChange={(e) => onUpdate({ resepsiDate: e.target.value })}
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Kosongkan jika sama dengan akad
          </span>
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Jam utama</span>
          <select
            value={setup.timeSlot}
            onChange={(e) => onUpdate({ timeSlot: e.target.value as SetupState["timeSlot"] })}
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm"
          >
            <option value="">Pilih jam</option>
            {timeSlots.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} — {t.desc}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Agama / Pencatatan</span>
          <select
            value={setup.religion}
            onChange={(e) => onUpdate({ religion: e.target.value as SetupState["religion"] })}
            className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm"
          >
            {religions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {setup.religion === "islam" && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Islam: KUA gratis di jam kerja; di luar KUA/jam kerja ada biaya. Siapkan KTP, KK, pas
          foto, surat RT/RW.
        </p>
      )}
    </QuestionShell>
  );
}

export function BudgetStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <QuestionShell
      question={4}
      total={7}
      onBack={onBack}
      onNext={onNext}
      disabled={!setup.budgetChoice || (setup.budgetChoice === "yes" && !setup.budget)}
    >
      <h3 className="display text-2xl">Sudah ada budget?</h3>
      <div className="mt-6 space-y-3">
        {[
          { value: "yes" as const, label: "Ya, sudah ada angka" },
          { value: "no" as const, label: "Belum — minta estimasi riset" },
        ].map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onUpdate({ budgetChoice: o.value })}
            className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-sm ${setup.budgetChoice === o.value ? "border-primary bg-primary/5" : "border-border hover:bg-[#fafafa]"}`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${setup.budgetChoice === o.value ? "border-primary" : "border-[#cfcfcf]"}`}
            >
              {setup.budgetChoice === o.value && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </span>
            {o.label}
          </button>
        ))}
      </div>
      {setup.budgetChoice === "yes" && (
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium">Budget total (Rp)</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground">
              Rp
            </span>
            <input
              value={formatIDRInput(setup.budget)}
              onChange={(e) => onUpdate({ budget: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="250.000.000"
              className="h-12 w-full border border-[#eaeaea] bg-white pl-11 pr-4 text-sm"
            />
          </div>
        </label>
      )}
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium">Budget ditanggung oleh</span>
        <select
          value={setup.budgetPayer}
          onChange={(e) => onUpdate({ budgetPayer: e.target.value as SetupState["budgetPayer"] })}
          className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm"
        >
          {Object.entries(payerLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <InterpretationPanel
        data={interpretBudget(setup.budgetChoice, setup.budget, setup.location, setup.guests)}
      />
    </QuestionShell>
  );
}

export function AdatStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const proc = adatProcessions[setup.adat];
  return (
    <QuestionShell question={5} total={7} onBack={onBack} onNext={onNext}>
      <h3 className="display text-2xl">Adat & prosesi apa yang dipakai?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Pilih adat utama — checklist prosesi otomatis dibuat.
      </p>
      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium">Adat utama</span>
        <select
          value={setup.adat}
          onChange={(e) => onUpdate({ adat: e.target.value })}
          className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-sm"
        >
          {adatOptions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      {proc && (
        <div className="mt-3 rounded-xl border border-border bg-surface p-4 text-xs leading-5 text-muted-foreground">
          <div className="font-medium text-foreground">
            {setup.adat} — {proc.prosesi.length} prosesi
          </div>
          <div className="mt-1">{proc.prosesi.join(" → ")}</div>
          <div className="mt-2 italic">{proc.seserahanNote}</div>
        </div>
      )}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium">
          Upacara yang direncanakan (pilih semua yang perlu)
        </span>
        <div className="flex flex-wrap gap-2">
          {ceremonyOptions.map((c) => {
            const active = setup.ceremonyTypes.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  onUpdate({
                    ceremonyTypes: active
                      ? setup.ceremonyTypes.filter((x) => x !== c)
                      : [...setup.ceremonyTypes, c],
                  })
                }
                className={`rounded-full border px-3 py-2 text-xs ${active ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface text-muted-foreground hover:bg-surface-2"}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <InterpretationPanel data={interpretWeddingType("", setup.adat)} />
    </QuestionShell>
  );
}

export function WeddingTypeStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <QuestionShell
      question={6}
      total={7}
      onBack={onBack}
      onNext={onNext}
      disabled={!setup.weddingType}
    >
      <h3 className="display text-2xl">Gaya pernikahan seperti apa?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Pilih yang paling mendekati — bisa digabung nanti.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {weddingTypes.map(({ label, icon, description }) => {
          const Icon = typeIcons[icon];
          return (
            <button
              key={label}
              type="button"
              onClick={() => onUpdate({ weddingType: label })}
              className={`flex items-start gap-3 rounded-[14px] border px-4 py-4 text-left ${setup.weddingType === label ? "border-primary bg-primary/5" : "border-border hover:bg-[#fafafa]"}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <InterpretationPanel data={interpretWeddingType(setup.weddingType, setup.adat)} />
    </QuestionShell>
  );
}

export function OrganizerStep({
  setup,
  onUpdate,
  onBack,
  onNext,
}: {
  setup: SetupState;
  onUpdate: (patch: Partial<SetupState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <QuestionShell
      question={7}
      total={7}
      onBack={onBack}
      onNext={onNext}
      disabled={!setup.organizer}
      nextLabel="Lihat preview"
    >
      <h3 className="display text-2xl">Pakai Wedding Organizer?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        WO membantu di peak season (Ramadan & tanggal cantik) — cepat penuh 9–12 bulan sebelum.
      </p>
      <div className="mt-6 space-y-3">
        {[
          {
            value: "yes" as const,
            label: "Ya — WO full / day-of",
            desc: "Rekomendasi: booking 9–12 bulan sebelum",
          },
          {
            value: "no" as const,
            label: "Tidak — keluarga / teman jadi PIC",
            desc: "Butuh 1 PIC non-pengantin + call sheet",
          },
        ].map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onUpdate({ organizer: o.value })}
            className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-sm ${setup.organizer === o.value ? "border-primary bg-primary/5" : "border-border hover:bg-[#fafafa]"}`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${setup.organizer === o.value ? "border-primary" : "border-[#cfcfcf]"}`}
            >
              {setup.organizer === o.value && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </span>
            <span>
              <span className="block font-medium">{o.label}</span>
              <span className="text-xs text-muted-foreground">{o.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <InterpretationPanel data={interpretOrganizer(setup.organizer)} />
    </QuestionShell>
  );
}

// Keep old names as aliases for compat if imported elsewhere
export const LocationStep = LocationVenueStep;

function InterpretationPanel({ data }: { data: PlanningInterpretation }) {
  return (
    <section
      className="mt-5 rounded-[16px] border border-[#ececec] bg-[#fafafa] px-4 py-3.5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Quick planning note
        </div>
        {(data.tier || data.complexity) && (
          <div className="text-xs font-medium text-foreground">{data.tier ?? data.complexity}</div>
        )}
      </div>
      <h4 className="mt-2 text-sm font-semibold text-foreground">{data.title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {data.interpretation} {data.implications[0]}
      </p>
      <p className="mt-2 border-t border-[#eaeaea] pt-2 text-xs font-medium leading-5 text-foreground">
        Next: {data.recommendation}
      </p>
    </section>
  );
}
