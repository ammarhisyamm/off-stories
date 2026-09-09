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
import {
  clearSeoPlanningDraft,
  getSeoPlanningDraft,
  trackSeoEvent,
  type SeoPlanningDraft,
} from "@/lib/seo-growth";
import type { Note, Task } from "@/lib/types";
import { ChoiceCard } from "./onboarding/choice-card";
import { OnboardingModal } from "./onboarding/onboarding-modal";
import {
  AdatStep,
  BudgetStep,
  DateTimeStep,
  GuestsStep,
  LocationVenueStep,
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
    kind: "event" | "tasks" | "budget" | "vendors" | "milestones" | "notes" | "seserahan",
    payload: unknown,
    opts?: { success?: string | null },
  ) => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [seoDraft] = useState<SeoPlanningDraft | null>(() => getSeoPlanningDraft());
  const [mode, setMode] = useState<SetupMode | null>(() => (seoDraft ? "smart" : null));
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState(1);
  const [setup, setSetup] = useState<SetupState>(() => ({
    ...blankSetup,
    location: seoDraft?.city ?? blankSetup.location,
    guests: seoDraft?.guests ?? blankSetup.guests,
    guestsBride: seoDraft?.guests ? Math.ceil(seoDraft.guests / 2) : blankSetup.guestsBride,
    guestsGroom: seoDraft?.guests ? Math.floor(seoDraft.guests / 2) : blankSetup.guestsGroom,
    budgetChoice: seoDraft?.budget ? "yes" : blankSetup.budgetChoice,
    budget: seoDraft?.budget ? String(seoDraft.budget) : blankSetup.budget,
    weddingType: seoDraft?.weddingType ?? blankSetup.weddingType,
    weddingDate: seoDraft?.weddingDate ?? blankSetup.weddingDate,
    akadDate: seoDraft?.weddingDate ?? blankSetup.akadDate,
    resepsiDate: seoDraft?.weddingDate ?? blankSetup.resepsiDate,
  }));
  const [startDetails, setStartDetails] = useState({
    partnerOneName: blankSetup.partnerOneName,
    partnerTwoName: blankSetup.partnerTwoName,
    weddingDate: seoDraft?.weddingDate ?? blankSetup.weddingDate,
  });
  const [startError, setStartError] = useState<string | null>(null);

  const estimatedBudget = useMemo(
    () => setupBudget(setup.guests, setup.budgetChoice, setup.budget, setup.location),
    [setup.budget, setup.budgetChoice, setup.guests, setup.location],
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
    const partnerOneName = startDetails.partnerOneName.trim();
    const partnerTwoName = startDetails.partnerTwoName.trim();
    const weddingDate = startDetails.weddingDate;
    if (!partnerOneName || !partnerTwoName || !weddingDate) {
      setStartError("Nama kedua mempelai dan tanggal pernikahan wajib diisi sebelum melanjutkan.");
      return;
    }
    update({
      partnerOneName,
      partnerTwoName,
      weddingDate,
      akadDate: weddingDate,
      resepsiDate: weddingDate,
    });
    if (mode === "blank") {
      const coupleName = `${partnerOneName} & ${partnerTwoName}`;
      setKind(
        "event",
        {
          name: coupleName || "Your wedding",
          type: "Wedding",
          date: weddingDate,
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
      trackSeoEvent("workspace_created", { content_cluster: seoDraft?.contentCluster });
      trackSeoEvent("wedding_date_added", { content_cluster: seoDraft?.contentCluster });
      clearSeoPlanningDraft();
      markOnboardingComplete();
      onComplete();
      return;
    }
    setStage(2);
  }

  function nextQuestion() {
    if (question < 7) setQuestion((current) => (current + 1) as typeof question);
    else setStage(3);
  }

  function finishSetup() {
    const prepared = smartData(setup);
    const imported = importSeoTemplate(seoDraft, prepared.event.date);
    setKind("event", prepared.event, { success: null });
    setKind("tasks", [...prepared.tasks, ...imported.tasks], { success: null });
    setKind("budget", prepared.budget, { success: null });
    setKind("vendors", prepared.vendors, { success: null });
    setKind("milestones", prepared.milestones, { success: null });
    if (imported.notes.length) setKind("notes", imported.notes, { success: null });
    setKind("seserahan", createStarterSeserahan(), { success: null });
    trackSeoEvent("workspace_created", { content_cluster: seoDraft?.contentCluster });
    trackSeoEvent("wedding_date_added", { content_cluster: seoDraft?.contentCluster });
    clearSeoPlanningDraft();
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
        {mode && (
          <div className="mx-auto mt-7 max-w-5xl rounded-[20px] border border-[#eaeaea] bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] sm:p-6">
            <div>
              <div className="text-sm font-medium text-foreground">
                Start with your wedding details
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {mode === "blank"
                  ? "Isi detail ini untuk membuka workspace kosong."
                  : "Isi nama dan tanggal dulu, lalu lanjutkan ke setup pintar."}
              </p>
              {seoDraft && (
                <p className="mt-2 text-xs font-medium text-primary">
                  Hasil dari{" "}
                  {seoDraft.contentCluster === "budget"
                    ? "budget"
                    : seoDraft.contentCluster === "timeline"
                      ? "timeline"
                      : "template"}{" "}
                  kamu sudah kami bawa ke setup ini.
                </p>
              )}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Nama mempelai 1 *</span>
                <input
                  type="text"
                  name="partner-one-name"
                  autoComplete="off"
                  value={startDetails.partnerOneName}
                  onChange={(event) =>
                    setStartDetails((current) => ({
                      ...current,
                      partnerOneName: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Andra"
                  className="h-12 w-full rounded-[14px] border border-[#eaeaea] bg-white px-4 text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 sm:text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Nama mempelai 2 *</span>
                <input
                  type="text"
                  name="partner-two-name"
                  autoComplete="off"
                  value={startDetails.partnerTwoName}
                  onChange={(event) =>
                    setStartDetails((current) => ({
                      ...current,
                      partnerTwoName: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Kirana"
                  className="h-12 w-full rounded-[14px] border border-[#eaeaea] bg-white px-4 text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 sm:text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Tanggal akad / pernikahan *</span>
                <input
                  type="date"
                  name="wedding-date"
                  value={startDetails.weddingDate}
                  onChange={(event) =>
                    setStartDetails((current) => ({
                      ...current,
                      weddingDate: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-[14px] border border-[#eaeaea] bg-white px-4 text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 sm:text-sm"
                />
              </label>
              {mode === "blank" && (
                <>
                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium">
                      Acara yang akan direncanakan
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {ceremonyOptions.map((ceremony) => {
                        const active = setup.ceremonyTypes.includes(ceremony);
                        return (
                          <label
                            key={ceremony}
                            className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring ${active ? "border-primary bg-primary/5 text-primary" : "border-border bg-white text-foreground hover:bg-surface"}`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() =>
                                update({
                                  ceremonyTypes: active
                                    ? setup.ceremonyTypes.filter((item) => item !== ceremony)
                                    : [...setup.ceremonyTypes, ceremony],
                                })
                              }
                              className="h-4 w-4 shrink-0 rounded border-input accent-primary"
                              aria-label={ceremony}
                            />
                            <span className="flex-1 leading-none">{ceremony}</span>
                            {active && (
                              <span className="text-xs" aria-hidden>
                                ✓
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Status venue</span>
                    <select
                      value={setup.venueStatus}
                      onChange={(event) =>
                        update({ venueStatus: event.target.value as SetupState["venueStatus"] })
                      }
                      className="h-12 w-full rounded-[14px] border border-[#eaeaea] bg-white px-4 text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 sm:text-sm"
                    >
                      <option value="not_decided">Belum menentukan</option>
                      <option value="shortlisted">Sudah shortlist</option>
                      <option value="booked">Sudah booking</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Budget utama dibayar oleh
                    </span>
                    <select
                      value={setup.budgetPayer}
                      onChange={(event) =>
                        update({ budgetPayer: event.target.value as SetupState["budgetPayer"] })
                      }
                      className="h-12 w-full rounded-[14px] border border-[#eaeaea] bg-white px-4 text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 sm:text-sm"
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
                      type="text"
                      name="venue-name"
                      autoComplete="off"
                      value={setup.venueName}
                      onChange={(event) => update({ venueName: event.target.value })}
                      placeholder="Contoh: Gedung Serbaguna Jakarta"
                      className="h-12 w-full rounded-[14px] border border-[#eaeaea] bg-white px-4 text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 sm:text-sm"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        )}
        {mode === "smart" && (
          <div className="mx-auto mt-7 max-w-5xl rounded-[20px] border border-[#eaeaea] bg-[#fafafa] p-5 text-sm text-muted-foreground sm:p-6">
            Smart Wedding Setup akan memandu kamu melalui lokasi, jumlah tamu, budget, tipe wedding,
            adat, dan Wedding Organizer sampai preview plan siap.
          </div>
        )}
        <div className="mx-auto mt-8 flex max-w-5xl items-center justify-between gap-4 border-t border-[#e9e9e9] pt-5">
          <p className="hidden text-xs text-muted-foreground sm:block">
            {mode === "blank"
              ? "Isi detail wajib untuk membuka workspace kosong."
              : "Pilih Smart Wedding Setup untuk mulai wizard."}
          </p>
          <button
            type="button"
            onClick={continueFromStart}
            disabled={!mode}
            className="ml-auto inline-flex h-11 items-center justify-center rounded-[14px] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#430a17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35"
          >
            {mode === "blank" ? "Finish and open workspace" : "Start smart setup"}
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
          <LocationVenueStep {...stepProps} onBack={() => setStage(1)} onNext={nextQuestion} />
        )}
        {question === 2 && (
          <GuestsStep {...stepProps} onBack={() => setQuestion(1)} onNext={nextQuestion} />
        )}
        {question === 3 && (
          <DateTimeStep {...stepProps} onBack={() => setQuestion(2)} onNext={nextQuestion} />
        )}
        {question === 4 && (
          <BudgetStep {...stepProps} onBack={() => setQuestion(3)} onNext={nextQuestion} />
        )}
        {question === 5 && (
          <AdatStep {...stepProps} onBack={() => setQuestion(4)} onNext={nextQuestion} />
        )}
        {question === 6 && (
          <WeddingTypeStep {...stepProps} onBack={() => setQuestion(5)} onNext={nextQuestion} />
        )}
        {question === 7 && (
          <OrganizerStep {...stepProps} onBack={() => setQuestion(6)} onNext={nextQuestion} />
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

function importSeoTemplate(draft: SeoPlanningDraft | null, due: string) {
  if (!draft?.templateType || !draft.checkedTasks?.length) {
    return { tasks: [] as Task[], notes: [] as Note[] };
  }

  const selected = draft.checkedTasks.slice(0, 20);
  const title =
    draft.templateType === "checklist"
      ? "Checklist pilihan dari template"
      : draft.templateType === "budget"
        ? "Kategori budget pilihan dari template"
        : "Struktur guest list pilihan dari template";
  const note: Note = {
    id: `seo-template-${draft.templateType}`,
    title,
    body: selected.map((item) => `• ${item}`).join("\n"),
    tag: "Template",
    date: new Date().toISOString().slice(0, 10),
  };
  const tasks = selected.map((item, index) => ({
    id: `seo-template-${draft.templateType}-${index}`,
    title:
      draft.templateType === "checklist"
        ? item
        : draft.templateType === "budget"
          ? `Review alokasi ${item}`
          : `Mulai daftar tamu: ${item}`,
    category:
      draft.templateType === "budget"
        ? "Budget"
        : draft.templateType === "guests"
          ? "Guests"
          : "Planning",
    due,
    priority: "medium" as const,
    status: "todo" as const,
  }));
  return { tasks, notes: [note] };
}
