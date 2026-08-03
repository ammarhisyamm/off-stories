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

  const stepProps = { setup, onUpdate: update };

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
                className="ml-auto rounded-[14px] bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35"
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
