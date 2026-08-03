import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  CalendarBlank,
  CalendarCheck,
  ChartDonut,
  Check,
  CheckCircle,
  Clock,
  FileText,
  FlowerLotus,
  FolderOpen,
  Heart,
  Lightbulb,
  MagicWand,
  MapPin,
  Notebook,
  Sparkle,
  UserCircleGear,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import {
  formatIDR,
  type BudgetItem,
  type Milestone,
  type Task,
  type Vendor,
} from "@/lib/mock-data";
import type { WorkspaceData } from "@/lib/data.functions";
import { getBrowserStorage } from "@/lib/browser-storage";

type SetupMode = "blank" | "smart";
type BudgetChoice = "yes" | "no" | "";
type SetupState = {
  location: string;
  guests: number;
  budgetChoice: BudgetChoice;
  budget: string;
  weddingType: string;
  organizer: "yes" | "no" | "";
};

function markOnboardingComplete() {
  try {
    getBrowserStorage("local").setItem("offstories-onboarding-complete", "true");
  } catch {}
}

const locations = [
  "Jakarta",
  "Bogor",
  "Depok",
  "Tangerang",
  "Bekasi",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Semarang",
  "Bali",
  "Makassar",
  "Medan",
  "Other",
];

const weddingTypes = [
  { label: "Traditional Wedding", icon: Notebook },
  { label: "Modern Wedding", icon: Sparkle },
  { label: "Intimate Wedding", icon: UsersThree },
  { label: "Outdoor Wedding", icon: MapPin },
  { label: "Destination Wedding", icon: CalendarCheck },
];

const blankSetup: SetupState = {
  location: "",
  guests: 250,
  budgetChoice: "",
  budget: "",
  weddingType: "",
  organizer: "",
};

function ChoiceCard({
  selected,
  onSelect,
  badge,
  title,
  description,
  features,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex h-full flex-col rounded-[24px] border bg-surface p-6 text-left transition duration-200 ease-out hover:-translate-y-px hover:border-[#dddddd] sm:p-7 ${
        selected
          ? "border-foreground shadow-[0_0_0_4px_rgb(0_0_0_/_0.04),0_6px_20px_rgb(15_23_42_/_0.05)]"
          : "border-border shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_6px_20px_rgb(15_23_42_/_0.05)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f6f6f6] text-foreground">
          {icon}
        </div>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f6f6] px-2.5 py-1 text-xs font-medium text-[#555555]">
            {badge}
          </span>
        )}
      </div>
      <h3 className="display mt-7 text-xl text-foreground">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-3 border-t border-[#f1f1f1] pt-5 text-sm text-[#5e5e5e]">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <Check size={15} weight="bold" className="text-foreground" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center justify-between border-t border-[#f1f1f1] pt-5 text-xs font-medium text-muted-foreground">
        <span>{selected ? "Selected" : "Choose this setup"}</span>
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border ${
            selected ? "border-foreground bg-primary text-primary-foreground" : "border-[#d8d8d8]"
          }`}
        >
          {selected && <Check size={12} weight="bold" />}
        </span>
      </div>
    </button>
  );
}

function OnboardingModal({ children, titleId }: { children: ReactNode; titleId: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/20 p-3 backdrop-blur-[2px] sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[calc(100dvh-24px)] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-[#e8e8e8] bg-[#fafafa] p-5 shadow-[0_18px_70px_rgb(15_23_42_/_0.16)] sm:max-h-[calc(100dvh-48px)] sm:p-8 lg:p-10"
      >
        {children}
      </div>
    </div>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-10 flex items-center gap-2" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1;
        return (
          <div key={step} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-medium ${
                step <= current
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#f1f1f1] text-[#8a8a8a]"
              }`}
            >
              {step < current ? <Check size={13} weight="bold" /> : step}
            </span>
            {step < total && <span className="h-px flex-1 bg-[#ececec]" />}
          </div>
        );
      })}
    </div>
  );
}

function QuestionShell({
  question,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  disabled = false,
}: {
  question: number;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Progress current={question} total={5} />
      <div className="panel p-6 sm:p-8">
        <div className="eyebrow">Question {question} of 5</div>
        <div className="mt-6">{children}</div>
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-[#f1f1f1] pt-5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-[14px] px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-[#f6f6f6] hover:text-foreground"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className="rounded-[14px] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function setupBudget(guests: number, budgetChoice: BudgetChoice, budget: string) {
  if (budgetChoice === "yes" && Number(budget) > 0) return Number(budget);
  return Math.round((guests * 1_140_000) / 1_000_000) * 1_000_000;
}

function getPlanningDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 14);
  return date.toISOString().slice(0, 10);
}

function smartData(setup: SetupState) {
  const budget = setupBudget(setup.guests, setup.budgetChoice, setup.budget);
  const date = getPlanningDate();
  const starterTasks: Task[] = [
    {
      id: "setup-venue",
      title: "Shortlist your wedding venue",
      category: "Venue",
      due: date,
      priority: "high",
      status: "todo",
    },
    {
      id: "setup-guest-list",
      title: "Start your guest list",
      category: "Guests",
      due: date,
      priority: "medium",
      status: "todo",
    },
    {
      id: "setup-vendors",
      title: "Research your first vendors",
      category: "Vendors",
      due: date,
      priority: "medium",
      status: "todo",
    },
  ];
  const starterBudget: BudgetItem[] = [
    {
      id: "setup-venue-budget",
      category: "Venue",
      amount: Math.round(budget * 0.3),
      paid: 0,
      committed: 0,
      status: "planned",
    },
    {
      id: "setup-catering-budget",
      category: "Catering",
      amount: Math.round(budget * 0.35),
      paid: 0,
      committed: 0,
      status: "planned",
    },
    {
      id: "setup-decoration-budget",
      category: "Decoration",
      amount: Math.round(budget * 0.12),
      paid: 0,
      committed: 0,
      status: "planned",
    },
  ];
  const starterMilestones: Milestone[] = [
    { id: "setup-milestone-venue", title: "Book a venue", date, kind: "venue", done: false },
    {
      id: "setup-milestone-guests",
      title: "Finalize guest list",
      date,
      kind: "review",
      done: false,
    },
    {
      id: "setup-milestone-final",
      title: "Final planning review",
      date,
      kind: "review",
      done: false,
    },
  ];
  const starterVendors: Vendor[] = [];

  return {
    event: {
      name: "Our wedding",
      type: setup.weddingType,
      date,
      location: setup.location,
      guestEstimate: setup.guests,
      budget,
    },
    tasks: starterTasks,
    budget: starterBudget,
    vendors: starterVendors,
    milestones: starterMilestones,
    budgetValue: budget,
  } satisfies Pick<WorkspaceData, "event" | "tasks" | "budget" | "vendors" | "milestones"> & {
    budgetValue: number;
  };
}

export function DashboardOnboarding({
  setKind,
  onComplete,
}: {
  setKind: (
    kind: "event" | "tasks" | "budget" | "vendors" | "milestones",
    payload: unknown,
    opts?: { success?: string | null },
  ) => void;
  onComplete: () => void;
}) {
  const [mode, setMode] = useState<SetupMode | null>(null);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState(1);
  const [setup, setSetup] = useState<SetupState>(blankSetup);

  const estimatedBudget = useMemo(
    () => setupBudget(setup.guests, setup.budgetChoice, setup.budget),
    [setup.budget, setup.budgetChoice, setup.guests],
  );

  function update(next: Partial<SetupState>) {
    setSetup((current) => ({ ...current, ...next }));
  }

  function chooseMode(next: SetupMode) {
    setMode(next);
  }

  function continueFromStart() {
    if (!mode) return;
    if (mode === "blank") {
      setKind(
        "event",
        {
          name: "Your wedding",
          type: "Wedding",
          date: "",
          location: "",
          guestEstimate: 0,
          budget: 0,
        },
        { success: null },
      );
      markOnboardingComplete();
      onComplete();
      return;
    }
    setStage(2);
  }

  function nextQuestion() {
    if (question < 5) setQuestion((current) => current + 1);
    else setStage(3);
  }

  function finishSetup() {
    const prepared = smartData(setup);
    setKind("event", prepared.event, { success: null });
    setKind("tasks", prepared.tasks, { success: null });
    setKind("budget", prepared.budget, { success: null });
    setKind("vendors", prepared.vendors, { success: null });
    setKind("milestones", prepared.milestones, { success: null });
    markOnboardingComplete();
    onComplete();
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      {stage === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/20 p-3 backdrop-blur-[2px] sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="setup-dialog-title"
            className="max-h-[calc(100dvh-24px)] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-[#e8e8e8] bg-[#fafafa] p-5 shadow-[0_18px_70px_rgb(15_23_42_/_0.16)] sm:max-h-[calc(100dvh-48px)] sm:p-8 lg:p-10"
          >
            <div className="mx-auto max-w-3xl text-center">
              <div className="eyebrow">Welcome to OffStories</div>
              <h2
                id="setup-dialog-title"
                className="display mt-3 text-3xl text-foreground sm:text-4xl"
              >
                How would you like to start?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Choose the option that best fits your planning style. You can customize everything
                later.
              </p>
            </div>
            <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2">
              <ChoiceCard
                selected={mode === "blank"}
                onSelect={() => chooseMode("blank")}
                title="Blank Canvas"
                description="Start with a completely empty workspace and build your wedding plan from scratch."
                features={[
                  "Empty Timeline",
                  "Empty Checklist",
                  "Empty Budget",
                  "Empty Vendor List",
                ]}
                icon={<FileText size={28} weight="regular" />}
              />
              <ChoiceCard
                selected={mode === "smart"}
                onSelect={() => chooseMode("smart")}
                badge="✦ Recommended"
                title="Smart Wedding Setup"
                description="Answer a few simple questions and OffStories will prepare your planning workspace for you."
                features={[
                  "Personalized Timeline",
                  "Wedding Checklist",
                  "Budget Breakdown",
                  "Planning Milestones",
                ]}
                icon={<MagicWand size={28} weight="regular" />}
              />
            </div>
            <div className="mx-auto mt-8 flex max-w-5xl items-center justify-between gap-4 border-t border-[#e9e9e9] pt-5">
              <p className="hidden text-xs text-muted-foreground sm:block">
                Select a setup to continue.
              </p>
              <button
                type="button"
                onClick={continueFromStart}
                disabled={!mode}
                className="ml-auto rounded-[14px] bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 2 && (
        <OnboardingModal titleId="smart-setup-title">
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow">Smart Wedding Setup</div>
            <h2
              id="smart-setup-title"
              className="display mt-3 text-3xl text-foreground sm:text-4xl"
            >
              Let’s make a thoughtful first plan.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              A few answers are all we need to prepare your workspace.
            </p>
          </div>
          {question === 1 && (
            <QuestionShell
              question={1}
              onBack={() => setStage(1)}
              onNext={nextQuestion}
              disabled={!setup.location}
            >
              <h3 className="display text-2xl">Where will your wedding take place?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                We’ll use this to shape your first planning suggestions.
              </p>
              <label className="mt-8 block">
                <span className="mb-2 block text-sm font-medium">Location</span>
                <select
                  value={setup.location}
                  onChange={(event) => update({ location: event.target.value })}
                  className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
                >
                  <option value="">Choose a city</option>
                  {locations.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </label>
            </QuestionShell>
          )}
          {question === 2 && (
            <QuestionShell question={2} onBack={() => setQuestion(1)} onNext={nextQuestion}>
              <h3 className="display text-2xl">How many guests are you expecting?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                You can always fine-tune this later.
              </p>
              <div className="mt-10 rounded-2xl bg-[#f6f6f6] p-5">
                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Estimated guests</span>
                  <span className="display text-3xl tabular-nums">{setup.guests}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={setup.guests}
                  onChange={(event) => update({ guests: Number(event.target.value) })}
                  className="mt-7 w-full accent-black"
                />
                <div className="mt-2 flex justify-between text-xs text-[#8a8a8a]">
                  <span>20</span>
                  <span>1000 guests</span>
                </div>
              </div>
            </QuestionShell>
          )}
          {question === 3 && (
            <QuestionShell
              question={3}
              onBack={() => setQuestion(2)}
              onNext={nextQuestion}
              disabled={!setup.budgetChoice}
            >
              <h3 className="display text-2xl">Do you already know your budget?</h3>
              <div className="mt-8 space-y-3">
                {[
                  { value: "yes" as const, label: "Yes, I know my budget" },
                  { value: "no" as const, label: "I’m not sure yet" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update({ budgetChoice: option.value })}
                    className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-sm transition-colors ${setup.budgetChoice === option.value ? "border-foreground bg-[#f6f6f6]" : "border-border hover:bg-[#fafafa]"}`}
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
                  <span className="mb-2 block text-sm font-medium">Your budget</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground">
                      Rp
                    </span>
                    <input
                      value={setup.budget}
                      onChange={(event) =>
                        update({ budget: event.target.value.replace(/\D/g, "") })
                      }
                      inputMode="numeric"
                      placeholder="250000000"
                      className="h-12 w-full border border-[#eaeaea] bg-white pl-11 pr-4 text-base text-foreground sm:text-sm"
                    />
                  </div>
                </label>
              )}
            </QuestionShell>
          )}
          {question === 4 && (
            <QuestionShell
              question={4}
              onBack={() => setQuestion(3)}
              onNext={nextQuestion}
              disabled={!setup.weddingType}
            >
              <h3 className="display text-2xl">What type of wedding are you planning?</h3>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {weddingTypes.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => update({ weddingType: label })}
                    className={`flex items-center gap-3 rounded-[14px] border px-4 py-3.5 text-left text-sm transition-colors ${setup.weddingType === label ? "border-foreground bg-[#f6f6f6]" : "border-border hover:bg-[#fafafa]"}`}
                  >
                    <Icon size={20} />
                    {label}
                  </button>
                ))}
              </div>
            </QuestionShell>
          )}
          {question === 5 && (
            <QuestionShell
              question={5}
              onBack={() => setQuestion(4)}
              onNext={nextQuestion}
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
                    onClick={() => update({ organizer: option.value })}
                    className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-sm transition-colors ${setup.organizer === option.value ? "border-foreground bg-[#f6f6f6]" : "border-border hover:bg-[#fafafa]"}`}
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
          )}
        </OnboardingModal>
      )}

      {stage === 3 && (
        <OnboardingModal titleId="plan-ready-title">
          <PlanReadyPreview
            setup={setup}
            estimatedBudget={estimatedBudget}
            onBack={() => setStage(2)}
            onFinish={finishSetup}
          />
        </OnboardingModal>
      )}
    </div>
  );
}

function PlanReadyPreview({
  setup,
  estimatedBudget,
  onBack,
  onFinish,
}: {
  setup: SetupState;
  estimatedBudget: number;
  onBack: () => void;
  onFinish: () => void;
}) {
  const planningDate = new Date(`${getPlanningDate()}T12:00:00`);
  const formattedDate = planningDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const allocation = [
    { label: "Venue", percent: 28, icon: Buildings },
    { label: "Catering", percent: 33, icon: UsersThree },
    { label: "Decoration", percent: 12, icon: FlowerLotus },
    { label: "Photography & Videography", percent: 8, icon: Heart },
    { label: "Makeup & Attire", percent: 5, icon: Sparkle },
    { label: "Entertainment", percent: 4, icon: MagicWand },
    { label: "Invitation & Souvenirs", percent: 4, icon: FileText },
    { label: "Miscellaneous", percent: 6, icon: Notebook },
  ];
  const prepared = [
    {
      title: "Personalized Timeline",
      description: "Wedding milestones generated automatically.",
      icon: CalendarCheck,
    },
    {
      title: "Wedding Checklist",
      description: "Recommended planning tasks already prepared.",
      icon: CheckCircle,
    },
    {
      title: "Budget Planner",
      description: "Budget categories have been organized.",
      icon: ChartDonut,
    },
    {
      title: "Vendor Management",
      description: "Organize and compare your vendors.",
      icon: UserCircleGear,
    },
    { title: "Guest List", description: "Start managing invitations and RSVP.", icon: UsersThree },
    {
      title: "Documents",
      description: "Store contracts, invoices, and important files.",
      icon: FolderOpen,
    },
  ];
  const insights = [
    `For weddings with around ${setup.guests} guests in ${setup.location || "your city"}, catering will likely be the largest expense.`,
    "Booking your venue 9–12 months before your wedding date gives you more choices and better pricing.",
    "Your planning timeline suggests starting vendor bookings within the next 30 days.",
  ];
  const budgetFloor = Math.round((estimatedBudget * 0.9) / 1_000_000) * 1_000_000;
  const budgetCeiling = Math.round((estimatedBudget * 1.2) / 1_000_000) * 1_000_000;
  const workspaceStatus = [
    { label: "Timeline Generated", icon: CalendarCheck },
    { label: "Budget Estimated", icon: ChartDonut },
    { label: "Checklist Created", icon: CheckCircle },
    { label: "Vendor Suggestions Ready", icon: UserCircleGear },
  ];

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <header className="rounded-[28px] border border-[#eaeaea] bg-[#f6f6f6] px-6 py-7 shadow-[0_1px_2px_rgb(15_23_42_/_0.03),0_6px_20px_rgb(15_23_42_/_0.04)] sm:px-9 sm:py-9">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="eyebrow">Wedding Workspace</div>
            <h2
              id="plan-ready-title"
              className="display mt-3 max-w-xl text-3xl text-foreground sm:text-4xl"
            >
              Everything is ready for your wedding.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              We&apos;ve prepared your personalized planning workspace based on your wedding
              details. Everything below is editable as your plans evolve.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                setup.weddingType || "Wedding celebration",
                setup.location || "Location to be decided",
                `${setup.guests} Guests`,
                formattedDate,
                "14 Month Planning",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#e2e2e2] bg-white px-3 py-1.5 text-xs text-[#555555]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={onFinish}
              className="mt-7 inline-flex h-10 items-center justify-center rounded-[14px] bg-primary px-4 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-black active:scale-[0.98]"
            >
              Continue Planning
            </button>
          </div>
          <div className="border-t border-[#e3e3e3] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="text-xs font-medium text-[#777777]">Workspace status</div>
            <div className="mt-4 space-y-3">
              {workspaceStatus.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-[#444444]">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#333333]">
                      <Icon size={15} weight="regular" />
                    </span>
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-[#ececec] bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_6px_20px_rgb(15_23_42_/_0.05)] sm:p-7">
          <SectionHeading
            icon={<CalendarBlank size={20} />}
            eyebrow="A quick look"
            title="Wedding Overview"
          />
          <div className="mt-7 divide-y divide-[#f1f1f1]">
            <OverviewItem
              icon={<Notebook size={19} />}
              label="Wedding Style"
              value={setup.weddingType || "Wedding celebration"}
            />
            <OverviewItem
              icon={<MapPin size={19} />}
              label="Wedding Location"
              value={setup.location || "To be decided"}
            />
            <OverviewItem
              icon={<CalendarBlank size={19} />}
              label="Wedding Date"
              value={formattedDate}
            />
            <OverviewItem
              icon={<UsersThree size={19} />}
              label="Estimated Guests"
              value={`${setup.guests} Guests`}
            />
            <OverviewItem
              icon={<UserCircleGear size={19} />}
              label="Wedding Organizer"
              value={setup.organizer === "yes" ? "Yes" : "No"}
            />
            <OverviewItem icon={<Clock size={19} />} label="Planning Duration" value="14 Months" />
          </div>
        </div>

        <div className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_6px_20px_rgb(15_23_42_/_0.05)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#222222]">Estimated Budget</div>
              <div className="mt-1 text-xs text-muted-foreground">
                A working estimate for your planning workspace
              </div>
            </div>
            <Wallet size={22} weight="regular" className="text-[#555555]" />
          </div>
          <div className="mt-8 display text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
            {formatIDR(estimatedBudget)}
          </div>
          <div className="mt-7">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Estimated range</span>
              <span className="tabular-nums">{formatIDR(budgetCeiling)}</span>
            </div>
            <div className="relative mt-4 h-1.5 rounded-full bg-[#eeeeee]">
              <div className="absolute left-0 top-0 h-full w-full rounded-full bg-[#d8d8d8]" />
              <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#111111] shadow-[0_1px_3px_rgb(0_0_0_/_0.18)]" />
            </div>
            <div className="mt-2 flex justify-between text-xs tabular-nums text-[#777777]">
              <span>{formatIDR(budgetFloor)}</span>
              <span>{formatIDR(budgetCeiling)}</span>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            Based on your wedding location, guest count, wedding style, and planning duration.
          </p>
          <div className="mt-7 grid gap-4 border-t border-[#f1f1f1] pt-5 sm:grid-cols-2">
            <BudgetInfoItem
              icon={<MapPin size={17} />}
              label="Location"
              value={setup.location || "To be decided"}
            />
            <BudgetInfoItem
              icon={<UsersThree size={17} />}
              label="Guests"
              value={`${setup.guests} Guests`}
            />
            <BudgetInfoItem
              icon={<Notebook size={17} />}
              label="Style"
              value={setup.weddingType || "Wedding celebration"}
            />
            <BudgetInfoItem icon={<Clock size={17} />} label="Timeline" value="14 Months" />
          </div>
          <p className="mt-6 border-t border-[#f1f1f1] pt-4 text-xs leading-5 text-muted-foreground">
            This estimate becomes more accurate as you add vendors, expenses, and update your
            planning details.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-[#ececec] bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_6px_20px_rgb(15_23_42_/_0.05)] sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            icon={<ChartDonut size={20} />}
            eyebrow="A clear starting point"
            title="Suggested Budget Allocation"
          />
          <span className="text-xs text-muted-foreground">Based on {setup.guests} guests</span>
        </div>
        <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-[#f1f1f1]">
          {allocation.map((item) => (
            <span
              key={item.label}
              className="h-full border-r border-white bg-[#111111] last:border-0"
              style={{ width: `${item.percent}%`, opacity: 0.45 + item.percent / 100 }}
            />
          ))}
        </div>
        <div className="mt-8 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {allocation.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f6f6f6] text-[#555555]">
                  <Icon size={18} weight="regular" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-[#333333]">{item.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.percent}%
                    </span>
                  </div>
                  <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {formatIDR(Math.round((estimatedBudget * item.percent) / 100))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Prepared for you" title="Your Planning Workspace is Ready" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {prepared.map((item) => {
            const Icon = item.icon;
            return (
              <PreparedCard
                key={item.title}
                icon={<Icon size={21} />}
                title={item.title}
                description={item.description}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          icon={<Lightbulb size={20} />}
          eyebrow="A little guidance"
          title="Planning Insights"
        />
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <InsightCard key={insight} number={`0${index + 1}`} text={insight} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            icon={<ArrowRight size={20} />}
            eyebrow="Your first moves"
            title="Recommended Next Steps"
          />
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            A simple order of operations to help you build momentum without the overwhelm.
          </p>
        </div>
        <div className="rounded-[24px] border border-[#ececec] bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_6px_20px_rgb(15_23_42_/_0.05)] sm:p-6">
          {[
            "Set your wedding date",
            "Finalize your estimated budget",
            "Book your venue",
            "Create your guest list",
            "Start adding vendors",
          ].map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-4 border-b border-[#f1f1f1] py-4 last:border-0 last:pb-1 first:pt-1"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e5e5e5] text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <span className="text-sm text-[#333333]">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#ececec] pt-6 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e8e8e8] bg-white px-5 text-sm text-[#444444] transition duration-200 hover:bg-[#f6f6f6] active:scale-[0.98]"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-black active:scale-[0.98]"
        >
          Enter My Dashboard <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h3 className="display mt-2 text-2xl text-foreground">{title}</h3>
    </div>
  );
}

function OverviewItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f6f6f6] text-[#555555]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-sm text-[#222222]">{value}</div>
      </div>
    </div>
  );
}

function BudgetInfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="text-[#666666]">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-[#333333]">{value}</div>
      </div>
    </div>
  );
}

function PreparedCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#ececec] bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42_/_0.03),0_4px_14px_rgb(15_23_42_/_0.04)] transition duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgb(15_23_42_/_0.07)]">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f6f6f6] text-[#333333]">
          {icon}
        </span>
        <Check size={17} weight="bold" className="text-[#16a34a]" />
      </div>
      <h4 className="mt-5 text-base font-semibold text-[#222222]">{title}</h4>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function InsightCard({ number, text }: { number: string; text: string }) {
  return (
    <div className="rounded-[20px] border border-[#ececec] bg-[#fafafa] p-5">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <Lightbulb size={18} weight="thin" />
        <span>{number}</span>
      </div>
      <p className="mt-7 text-sm leading-6 text-[#444444]">{text}</p>
    </div>
  );
}
