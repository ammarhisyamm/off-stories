import { useMemo, useState } from "react";
import { FileText, MagicWand } from "@phosphor-icons/react";
import {
  blankSetup,
  markOnboardingComplete,
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
    kind: "event" | "tasks" | "budget" | "vendors" | "milestones",
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
      const coupleName = [setup.partnerOneName, setup.partnerTwoName].filter(Boolean).join(" & ");
      setKind(
        "event",
        {
          name: coupleName || "Your wedding",
          type: "Wedding",
          date: setup.weddingDate,
          location: "",
          brideName: setup.partnerOneName,
          groomName: setup.partnerTwoName,
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
              <span className="mb-2 block text-sm font-medium">Nama mempelai 1</span>
              <input
                value={setup.partnerOneName}
                onChange={(event) => onUpdate({ partnerOneName: event.target.value })}
                placeholder="Contoh: Andra"
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Nama mempelai 2</span>
              <input
                value={setup.partnerTwoName}
                onChange={(event) => onUpdate({ partnerTwoName: event.target.value })}
                placeholder="Contoh: Kirana"
                className="h-12 w-full border border-[#eaeaea] bg-white px-4 text-base text-foreground sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Tanggal akad / pernikahan</span>
              <input
                type="date"
                value={setup.weddingDate}
                onChange={(event) => onUpdate({ weddingDate: event.target.value })}
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
