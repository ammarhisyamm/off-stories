import type { ReactNode } from "react";
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
import { formatIDR } from "@/lib/types";
import { getPlanningDate, type SetupState } from "@/lib/onboarding";

export function PlanReadyPreview({
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
  const planningDate = new Date(`${getPlanningDate(setup.weddingDate)}T12:00:00`);
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
    <div className="mx-auto min-w-0 max-w-6xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <header className="rounded-[24px] border border-[#eaeaea] bg-[#f6f6f6] px-4 py-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.03),0_6px_20px_rgb(15_23_42_/_0.04)] sm:rounded-[28px] sm:px-9 sm:py-9">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="eyebrow">Wedding Workspace</div>
            <h2
              id="plan-ready-title"
              className="display mt-3 max-w-xl text-2xl text-foreground sm:text-4xl"
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
                ...(setup.adat && setup.adat !== "No specific adat yet" ? [setup.adat] : []),
                setup.location || "Location to be decided",
                `${setup.guests} Guests`,
                formattedDate,
                ...(setup.partnerOneName && setup.partnerTwoName
                  ? [`${setup.partnerOneName} & ${setup.partnerTwoName}`]
                  : []),
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
              className="mt-7 inline-flex h-10 items-center justify-center rounded-[14px] bg-primary px-4 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
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
            {setup.adat && setup.adat !== "No specific adat yet" && (
              <OverviewItem
                icon={<FlowerLotus size={19} />}
                label="Cultural Tradition"
                value={setup.adat}
              />
            )}
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
            {(setup.partnerOneName || setup.partnerTwoName) && (
              <OverviewItem
                icon={<Heart size={19} />}
                label="Couple"
                value={[setup.partnerOneName, setup.partnerTwoName].filter(Boolean).join(" & ")}
              />
            )}
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e8e8e8] bg-white px-5 text-sm text-[#444444] transition duration-200 hover:bg-[#f6f6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
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
