import { useMemo, useState } from "react";
import { FileText, MagicWand } from "@phosphor-icons/react";
import {
  blankSetup,
  ceremonyOptions,
  markOnboardingComplete,
  payerLabels,
  createStarterSeserahan,
  setupBudget,
  smartData,
  type SetupMode,
  type SetupState,
} from "@/lib/onboarding";
import { ChoiceCard } from "./onboarding/choice-card";
import { OnboardingModal } from "./onboarding/onboarding-modal";
import {
  BudgetStep,
  GuestsStep,
  LocationStep,
  OrganizerStep,
  WeddingTypeStep,
} from "./onboarding/questions";
import { PlanReadyPreview } from "./onboarding/plan-ready-preview";

export function DashboardOnboarding({
  setKind,
  onComplete,
  onClose,
}: {
  setKind: (
    kind: "event" | "tasks" | "budget" | "vendors" | "milestones" | "seserahan",
    payload: unknown,
    opts?: { success?: string | null },
  ) => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<SetupMode | null>(null);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState(1);
  const [setup, setSetup] = useState<SetupState>(blankSetup);
  const [startError, setStartError] = useState<string | null>(null);

  const estimatedBudget = useMemo(
    () => setupBudget(setup.guests, setup.budgetChoice, setup.budget),
    [setup.budget, setup.budgetChoice, setup.guests],
  );

  function update(next: Partial<SetupState>) {
    setSetup((current) => ({ ...current, ...next }));
  }

  function chooseMode(next: SetupMode) {
    setStartError(null);
    setMode(next);
  }

  function continueFromStart() {
    if (!mode) return;
    if (
      mode === "blank" &&
      (!setup.partnerOneName.trim() || !setup.partnerTwoName.trim() || !setup.weddingDate)
    ) {
      setStartError(
        "Nama kedua mempelai dan tanggal pernikahan wajib diisi untuk memulai Blank Canvas.",
      );
      return;
    }
    if (mode === "blank") {
      const partnerOneName = setup.partnerOneName.trim();
      const partnerTwoName = setup.partnerTwoName.trim();
      const coupleName = `${partnerOneName} & ${partnerTwoName}`;
      setKind(
        "event",
        {
          name: coupleName || "Your wedding",
          type: "Wedding",
          date: setup.weddingDate,
          location: "",
          brideName: partnerOneName,
          groomName: partnerTwoName,
          guestEstimate: 0,
          budget: 0,
          ceremonyTypes: setup.ceremonyTypes,
          venueStatus: setup.venueStatus,
          venueName: setup.venueName,
          budgetPayer: setup.budgetPayer,
          planningTeam: setup.planningTeam,
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
    setKind("seserahan", createStarterSeserahan(), { success: null });
    markOnboardingComplete();
    onComplete();
  }

  const stepProps = { setup, onUpdate: update };

  const currentPage =
    stage === 1 ? (
      <div className="onboarding-page" key="start">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">Welcome to OffStories</div>
          <h2 id="setup-dialog-title" className="display mt-3 text-3xl text-foreground sm:text-4xl">
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
            features={["Empty Timeline", "Empty Checklist", "Empty Budget", "Empty Vendor List"]}
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
        <div className="mx-auto mt-7 max-w-5xl rounded-[20px] border border-[#eaeaea] bg-white p-5 sm:p-6">
          <div>
            <div className="text-sm font-medium text-foreground">
              Start with your wedding details
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Optional for now, but these details help personalize your workspace and budget plan.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Nama mempelai 1 *</span>
              <input
                value={setup.partnerOneName}
                onChange={(event) => onUpdate({ partnerOneName: event.target.value })}
                placeholder="Contoh: Andra"
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Nama mempelai 2 *</span>
              <input
                value={setup.partnerTwoName}
                onChange={(event) => onUpdate({ partnerTwoName: event.target.value })}
                placeholder="Contoh: Kirana"
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Tanggal akad / pernikahan *</span>
              <input
                type="date"
                value={setup.weddingDate}
                onChange={(event) => onUpdate({ weddingDate: event.target.value })}
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium">Acara yang akan direncanakan</span>
              <div className="flex flex-wrap gap-2">
                {ceremonyOptions.map((ceremony) => {
                  const active = setup.ceremonyTypes.includes(ceremony);
                  return (
                    <button
                      key={ceremony}
                      type="button"
                      onClick={() =>
                        onUpdate({
                          ceremonyTypes: active
                            ? setup.ceremonyTypes.filter((item) => item !== ceremony)
                            : [...setup.ceremonyTypes, ceremony],
                        })
                      }
                      className={`rounded-full border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface text-muted-foreground hover:bg-surface-2"}`}
                      aria-pressed={active}
                    >
                      {ceremony}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Status venue</span>
              <select
                value={setup.venueStatus}
                onChange={(event) =>
                  onUpdate({ venueStatus: event.target.value as SetupState["venueStatus"] })
                }
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              >
                <option value="not_decided">Belum menentukan</option>
                <option value="shortlisted">Sudah shortlist</option>
                <option value="booked">Sudah booking</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Budget utama dibayar oleh</span>
              <select
                value={setup.budgetPayer}
                onChange={(event) =>
                  onUpdate({ budgetPayer: event.target.value as SetupState["budgetPayer"] })
                }
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              >
                {Object.entries(payerLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium">Nama venue (opsional)</span>
              <input
                value={setup.venueName}
                onChange={(event) => onUpdate({ venueName: event.target.value })}
                placeholder="Contoh: Gedung Serbaguna Jakarta"
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              />
            </label>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-5xl items-center justify-between gap-4 border-t border-[#e9e9e9] pt-5">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Select a setup to continue.
          </p>
          <button
            type="button"
            onClick={continueFromStart}
            disabled={!mode}
            className="ml-auto rounded-[14px] bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#430a17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35"
          >
            Continue
          </button>
        </div>
        {startError && (
          <p role="alert" className="mx-auto mt-3 max-w-5xl text-right text-sm text-destructive">
            {startError}
          </p>
        )}
      </div>
    ) : stage === 2 ? (
      <div className="onboarding-page" key={`question-${question}`}>
        <div className="mb-7 max-w-2xl sm:mb-10">
          <div className="eyebrow">Smart Wedding Setup</div>
          <h2 id="smart-setup-title" className="display mt-3 text-3xl text-foreground sm:text-4xl">
            Let&apos;s make a thoughtful first plan.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A few answers are all we need to prepare your workspace.
          </p>
        </div>
        {question === 1 && (
          <LocationStep {...stepProps} onBack={() => setStage(1)} onNext={nextQuestion} />
        )}
        {question === 2 && (
          <GuestsStep {...stepProps} onBack={() => setQuestion(1)} onNext={nextQuestion} />
        )}
        {question === 3 && (
          <BudgetStep {...stepProps} onBack={() => setQuestion(2)} onNext={nextQuestion} />
        )}
        {question === 4 && (
          <WeddingTypeStep {...stepProps} onBack={() => setQuestion(3)} onNext={nextQuestion} />
        )}
        {question === 5 && (
          <OrganizerStep {...stepProps} onBack={() => setQuestion(4)} onNext={nextQuestion} />
        )}
      </div>
    ) : (
      <div className="onboarding-page" key="preview">
        <PlanReadyPreview
          setup={setup}
          estimatedBudget={estimatedBudget}
          onBack={() => setStage(2)}
          onFinish={finishSetup}
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      <OnboardingModal
        titleId={
          stage === 1
            ? "setup-dialog-title"
            : stage === 2
              ? "smart-setup-title"
              : "plan-ready-title"
        }
        onClose={onClose}
      >
        {currentPage}
      </OnboardingModal>
    </div>
  );
}
