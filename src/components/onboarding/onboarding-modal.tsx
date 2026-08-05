import type { ReactNode } from "react";
import { Check, X } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

export function OnboardingModal({
  children,
  titleId,
  onClose,
}: {
  children: ReactNode;
  titleId: string;
  onClose?: () => void;
}) {
  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background sm:flex sm:items-center sm:justify-center sm:bg-[#35151d]/20 sm:p-4 sm:backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="onboarding-dialog relative min-h-full w-full min-w-0 max-w-6xl overflow-x-hidden bg-background p-4 sm:my-4 sm:min-h-0 sm:max-h-[calc(100dvh-32px)] sm:overflow-y-auto sm:overscroll-contain sm:rounded-[28px] sm:border sm:border-border sm:p-7 sm:shadow-[0_18px_70px_rgb(91_14_32_/_0.16)] lg:p-10"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close onboarding"
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#e6e6e6] bg-white text-muted-foreground shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] transition-colors hover:bg-[#f6f6f6] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6 sm:top-6"
          >
            <X size={17} />
          </button>
        )}
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
            className="inline-flex h-11 items-center justify-center rounded-[14px] px-4 text-sm text-muted-foreground transition-colors hover:bg-[#f6f6f6] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#430a17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
