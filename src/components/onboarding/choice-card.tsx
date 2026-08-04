import type { ReactNode } from "react";
import { Check } from "@phosphor-icons/react";

export function ChoiceCard({
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
      className={`group flex h-full min-w-0 flex-col rounded-[20px] border bg-surface p-4 text-left transition duration-200 ease-out hover:-translate-y-px hover:border-[#dddddd] sm:rounded-[24px] sm:p-6 md:p-7 ${
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
      <h3 className="display mt-6 text-lg text-foreground sm:mt-7 sm:text-xl">{title}</h3>
      <p className="mt-3 max-w-md text-[13px] leading-6 text-muted-foreground sm:text-sm">
        {description}
      </p>
      <ul className="mt-6 space-y-3 border-t border-[#f1f1f1] pt-5 text-sm text-[#5e5e5e]">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <Check size={15} weight="bold" className="text-foreground" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-[#f1f1f1] pt-4 text-xs font-medium text-muted-foreground sm:mt-8 sm:pt-5">
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
