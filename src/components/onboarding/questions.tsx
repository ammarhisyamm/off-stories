import { CalendarCheck, MapPin, Notebook, Sparkle, UsersThree } from "@phosphor-icons/react";
import { adatOptions, locations, weddingTypes, type SetupState } from "@/lib/onboarding";
import { QuestionShell } from "./onboarding-modal";

const typeIcons = {
  notebook: Notebook,
  sparkle: Sparkle,
  "users-three": UsersThree,
  "map-pin": MapPin,
  "calendar-check": CalendarCheck,
};

function formatBudgetInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
}

export function LocationStep({
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
    <QuestionShell question={1} onBack={onBack} onNext={onNext} disabled={!setup.location}>
      <h3 className="display text-2xl">Where will your wedding take place?</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        We&apos;ll use this to shape your first planning suggestions.
      </p>
      <label className="mt-8 block">
        <span className="mb-2 block text-sm font-medium">Location</span>
        <select
          value={setup.location}
          onChange={(event) => onUpdate({ location: event.target.value })}
          className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
        >
          <option value="">Choose a city</option>
          {locations.map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>
      </label>
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
  return (
    <QuestionShell question={2} onBack={onBack} onNext={onNext}>
      <h3 className="display text-2xl">How many guests are you expecting?</h3>
      <p className="mt-3 text-sm text-muted-foreground">You can always fine-tune this later.</p>
      <div className="mt-8 rounded-2xl bg-[#f6f6f6] p-4 sm:mt-10 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm text-muted-foreground">Estimated guests</span>
          <output htmlFor="guest-range" className="display text-3xl tabular-nums">
            {setup.guests}
          </output>
        </div>
        <input
          id="guest-range"
          type="range"
          min="20"
          max="1000"
          step="10"
          value={setup.guests}
          aria-valuetext={`${setup.guests} guests`}
          onChange={(event) => onUpdate({ guests: Number(event.target.value) })}
          className="mt-7 w-full accent-black"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>20</span>
          <span>1000 guests</span>
        </div>
      </div>
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
    <QuestionShell question={3} onBack={onBack} onNext={onNext} disabled={!setup.budgetChoice}>
      <h3 className="display text-2xl">Do you already know your budget?</h3>
      <div className="mt-8 space-y-3">
        {[
          { value: "yes" as const, label: "Yes, I know my budget" },
          { value: "no" as const, label: "I'm not sure yet" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onUpdate({ budgetChoice: option.value })}
            className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${setup.budgetChoice === option.value ? "border-foreground bg-[#f6f6f6]" : "border-border hover:bg-[#fafafa]"}`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${setup.budgetChoice === option.value ? "border-foreground" : "border-[#cfcfcf]"}`}
            >
              {setup.budgetChoice === option.value && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </span>
            {option.label}
          </button>
        ))}
      </div>
      {setup.budgetChoice === "yes" && (
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium">Your estimated wedding budget</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground">
              Rp
            </span>
            <input
              value={formatBudgetInput(setup.budget)}
              onChange={(event) => onUpdate({ budget: event.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="250.000.000"
              className="h-12 w-full border border-[#eaeaea] bg-white pl-11 pr-4 text-base text-foreground sm:text-sm"
            />
          </div>
        </label>
      )}
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
    <QuestionShell question={4} onBack={onBack} onNext={onNext} disabled={!setup.weddingType}>
      <h3 className="display text-2xl">What type of wedding are you planning?</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Choose the closest starting point. You can combine styles and adjust the plan later.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
        {weddingTypes.map(({ label, icon, description }) => {
          const Icon = typeIcons[icon];
          return (
            <button
              key={label}
              type="button"
              onClick={() => onUpdate({ weddingType: label })}
              className={`flex items-start gap-3 rounded-[14px] border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${setup.weddingType === label ? "border-foreground bg-[#f6f6f6]" : "border-border hover:bg-[#fafafa]"}`}
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
      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium">
          Is there a cultural tradition to include?
        </span>
        <select
          value={setup.adat}
          onChange={(event) => onUpdate({ adat: event.target.value })}
          className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
        >
          {adatOptions.map((adat) => (
            <option key={adat}>{adat}</option>
          ))}
        </select>
        <span className="mt-2 block text-xs leading-5 text-muted-foreground">
          This helps us prepare a more relevant checklist. It is completely optional and can be
          changed later.
        </span>
      </label>
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
      question={5}
      onBack={onBack}
      onNext={onNext}
      disabled={!setup.organizer}
      nextLabel="See your plan"
    >
      <h3 className="display text-2xl">Will you hire a Wedding Organizer?</h3>
      <div className="mt-8 space-y-3">
        {[
          { value: "yes" as const, label: "Yes" },
          { value: "no" as const, label: "No" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onUpdate({ organizer: option.value })}
            className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${setup.organizer === option.value ? "border-foreground bg-[#f6f6f6]" : "border-border hover:bg-[#fafafa]"}`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${setup.organizer === option.value ? "border-foreground" : "border-[#cfcfcf]"}`}
            >
              {setup.organizer === option.value && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </QuestionShell>
  );
}
