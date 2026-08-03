import type { ReactNode } from "react";
import { Check } from "@phosphor-icons/react";

export function OnboardingModal({ children, titleId }: { children: ReactNode; titleId: string }) {
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

export function Progress({ current, total }: { current: number; total: number }) {
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
                  : "bg-[#f1f1f1] text-muted-foreground"
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

export function QuestionShell({
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
            className="rounded-[14px] px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-[#f6f6f6] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className="rounded-[14px] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
