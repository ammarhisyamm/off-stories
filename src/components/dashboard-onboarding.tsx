import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarCheck,
  Check,
  FileText,
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
    window.localStorage.setItem("offstories-onboarding-complete", "true");
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
  action,
}: {
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
  action: string;
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
      <span
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-[14px] px-4 text-sm font-medium transition-colors ${
          selected
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface text-[#444444]"
        }`}
      >
        {action}
      </span>
    </button>
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

function smartData(setup: SetupState) {
  const budget = setupBudget(setup.guests, setup.budgetChoice, setup.budget);
  const date = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
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
        <>
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow">Welcome to OffStories</div>
            <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
              How would you like to start?
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Choose the option that best fits your planning style.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChoiceCard
              selected={mode === "blank"}
              onSelect={() => chooseMode("blank")}
              title="Blank Canvas"
              description="Start with a completely empty workspace and build your wedding plan from scratch."
              features={["Empty Timeline", "Empty Checklist", "Empty Budget", "Empty Vendor List"]}
              action="Start from Scratch"
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
              action="Let's Get Started"
              icon={<MagicWand size={28} weight="regular" />}
            />
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={continueFromStart}
              disabled={!mode}
              className="rounded-[14px] bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {stage === 2 && (
        <>
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow">Smart Wedding Setup</div>
            <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
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
        </>
      )}

      {stage === 3 && (
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow">Your first plan</div>
            <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
              A thoughtful start, ready when you are.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Here’s what OffStories prepared from your answers.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="panel p-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Wallet size={19} />
                Estimated wedding budget
              </div>
              <div className="display mt-4 text-3xl">{formatIDR(estimatedBudget)}</div>
              <p className="mt-2 text-xs text-muted-foreground">
                {setup.budgetChoice === "yes"
                  ? "Based on the budget you shared."
                  : "A starting estimate based on your guest count."}
              </p>
            </div>
            <div className="panel p-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <UsersThree size={19} />
                Estimated guest count
              </div>
              <div className="display mt-4 text-3xl">
                {setup.guests}{" "}
                <span className="text-base font-medium text-muted-foreground">Guests</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Planning in {setup.location} · {setup.weddingType}
              </p>
            </div>
          </div>
          <div className="panel mt-4 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow">Recommended allocation</div>
                <h3 className="display mt-2 text-xl">A simple budget shape</h3>
              </div>
              <Wallet size={22} className="text-muted-foreground" />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Venue", value: 30 },
                { label: "Catering", value: 35 },
                { label: "Decoration", value: 12 },
                { label: "Photography & Videography", value: 8 },
                { label: "Makeup & Attire", value: 5 },
                { label: "Entertainment", value: 3 },
                { label: "Invitation & Souvenirs", value: 3 },
                { label: "Miscellaneous", value: 4 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{item.label}</span>
                    <span className="tabular-nums text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#f1f1f1]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreparedItem
              icon={<CalendarCheck size={20} />}
              label="Timeline with important milestones"
            />
            <PreparedItem icon={<FileText size={20} />} label="Wedding checklist" />
            <PreparedItem icon={<Wallet size={20} />} label="Budget planner" />
            <PreparedItem icon={<UserCircleGear size={20} />} label="Vendor categories" />
            <PreparedItem icon={<UsersThree size={20} />} label="Guest list" />
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={finishSetup}
              className="rounded-[14px] bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-black"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreparedItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-border bg-surface px-4 py-3.5 text-sm text-[#444444]">
      <span className="text-foreground">{icon}</span>
      <span>{label}</span>
      <Check size={15} weight="bold" className="ml-auto text-[#16a34a]" />
    </div>
  );
}
