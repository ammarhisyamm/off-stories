import type { ReactNode } from "react";
import { Check } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

export function OnboardingModal({ children, titleId }: { children: ReactNode; titleId: string }) {
  const modal = (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#111111]/20 p-2 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-2 max-h-[calc(100dvh-16px)] w-full min-w-0 max-w-6xl overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px] border border-[#e8e8e8] bg-[#fafafa] p-4 shadow-[0_18px_70px_rgb(15_23_42_/_0.16)] sm:my-4 sm:max-h-[calc(100dvh-32px)] sm:rounded-[28px] sm:p-7 lg:p-10"
      >
        {children}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

export function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="mb-7 flex items-center gap-2 sm:mb-10"
      aria-label={`Step ${current} of ${total}`}
    >
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
      <div className="panel p-4 sm:p-8">
        <div className="eyebrow">Question {question} of 5</div>
        <div className="mt-6">{children}</div>
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#f1f1f1] pt-4 sm:mt-10 sm:pt-5">
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
