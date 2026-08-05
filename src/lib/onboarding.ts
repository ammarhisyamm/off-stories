import type { BudgetItem, Milestone, Payer, SeserahanItem, Task, Vendor } from "@/lib/types";
import type { WorkspaceData } from "@/lib/data.functions";
import { getBrowserStorage } from "@/lib/browser-storage";

export type SetupMode = "blank" | "smart";
export type BudgetChoice = "yes" | "no" | "";
export type SetupState = {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string;
  location: string;
  guests: number;
  budgetChoice: BudgetChoice;
  budget: string;
  weddingType: string;
  adat: string;
  organizer: "yes" | "no" | "";
  ceremonyTypes: string[];
  venueStatus: "not_decided" | "shortlisted" | "booked";
  venueName: string;
  budgetPayer: Payer;
  planningTeam: string[];
};

export function markOnboardingComplete() {
  try {
    getBrowserStorage("local").setItem("offstories-onboarding-complete", "true");
  } catch {}
}

export const locations = [
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

export const weddingTypes = [
  {
    label: "Traditional Wedding",
    icon: "notebook",
    description: "A celebration shaped by family traditions, ceremony, and cultural details.",
  },
  {
    label: "Modern Wedding",
    icon: "sparkle",
    description: "A contemporary celebration with a flexible, personal flow.",
  },
  {
    label: "Intimate Wedding",
    icon: "users-three",
    description: "A smaller gathering focused on meaningful moments with close people.",
  },
  {
    label: "Outdoor Wedding",
    icon: "map-pin",
    description: "A venue-led celebration with weather, logistics, and guest comfort in mind.",
  },
  {
    label: "Destination Wedding",
    icon: "calendar-check",
    description: "A celebration away from home with travel and guest coordination included.",
  },
] as const;

export const adatOptions = [
  "No specific adat yet",
  "Javanese",
  "Sundanese",
  "Batak",
  "Minang",
  "Balinese",
  "Betawi",
  "Chinese Indonesian",
  "Other",
] as const;

export const blankSetup: SetupState = {
  partnerOneName: "",
  partnerTwoName: "",
  weddingDate: "",
  location: "",
  guests: 250,
  budgetChoice: "",
  budget: "",
  weddingType: "",
  adat: "No specific adat yet",
  organizer: "",
  ceremonyTypes: ["Akad", "Resepsi"],
  venueStatus: "not_decided",
  venueName: "",
  budgetPayer: "shared",
  planningTeam: ["Partner 1", "Partner 2"],
};

export const ceremonyOptions = [
  "Lamaran",
  "Akad",
  "Resepsi",
  "Pengajian",
  "Siraman",
  "Tea Pai",
] as const;

export const payerLabels: Record<Payer, string> = {
  couple: "Pasangan",
  bride_family: "Keluarga mempelai 1",
  groom_family: "Keluarga mempelai 2",
  shared: "Dibagi bersama",
  other: "Lainnya",
};

export function setupBudget(guests: number, budgetChoice: BudgetChoice, budget: string) {
  if (budgetChoice === "yes" && Number(budget) > 0) return Number(budget);
  return Math.round((guests * 1_140_000) / 1_000_000) * 1_000_000;
}

export function getPlanningDate(weddingDate?: string) {
  if (weddingDate) return weddingDate;
  const date = new Date();
  date.setMonth(date.getMonth() + 14);
  return date.toISOString().slice(0, 10);
}

export function smartData(setup: SetupState) {
  const budget = setupBudget(setup.guests, setup.budgetChoice, setup.budget);
  const date = getPlanningDate(setup.weddingDate);
  const coupleName = [setup.partnerOneName, setup.partnerTwoName].filter(Boolean).join(" & ");
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
  const localPack = createLocalPlanningPack(setup);
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
      name: coupleName || "Our wedding",
      type: setup.weddingType,
      date,
      location: setup.location,
      adat: setup.adat,
      brideName: setup.partnerOneName,
      groomName: setup.partnerTwoName,
      guestEstimate: setup.guests,
      budget,
      ceremonyTypes: setup.ceremonyTypes,
      venueStatus: setup.venueStatus,
      venueName: setup.venueName,
      budgetPayer: setup.budgetPayer,
      planningTeam: setup.planningTeam,
    },
    tasks: [...starterTasks, ...localPack],
    budget: starterBudget,
    vendors: starterVendors,
    milestones: starterMilestones,
    budgetValue: budget,
  } satisfies Pick<WorkspaceData, "event" | "tasks" | "budget" | "vendors" | "milestones"> & {
    budgetValue: number;
  };
}

export function createLocalPlanningPack(setup: SetupState): Task[] {
  const date = getPlanningDate(setup.weddingDate);
  const tasks: Task[] = [];
  const add = (title: string, category: string, priority: Task["priority"] = "medium") =>
    tasks.push({
      id: `local-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${tasks.length}`,
      title,
      category,
      due: date,
      priority,
      status: "todo",
    });

  if (setup.adat !== "No specific adat yet") {
    add(`Confirm ${setup.adat} ceremony sequence with both families`, "Adat", "high");
    add(`List ${setup.adat} attire, accessories, and symbolic items`, "Adat");
  }
  if (setup.ceremonyTypes.includes("Akad")) {
    add("Confirm KUA or civil registration requirements", "KUA & Legal", "high");
    add("Prepare identity documents and required photos", "KUA & Legal", "high");
  }
  if (setup.ceremonyTypes.includes("Resepsi")) {
    add("Confirm catering menu and guest serving count", "Catering");
    add("Draft the reception rundown and family PICs", "Rundown");
  }
  if (setup.ceremonyTypes.includes("Siraman"))
    add("Confirm siraman items and ceremony helpers", "Adat");
  if (setup.ceremonyTypes.includes("Tea Pai"))
    add("Confirm tea pai sequence, tea set, and family seating", "Adat");
  if (setup.organizer === "no") add("Assign a family or friend as day-of coordinator", "Family");
  return tasks;
}

export function createStarterSeserahan(): SeserahanItem[] {
  return [
    ["Alat ibadah", "Alat ibadah", "alat ibadah seserahan"],
    ["Perlengkapan wanita", "Perlengkapan", "perlengkapan wanita seserahan"],
    ["Pakaian atau kain", "Pakaian", "kain seserahan"],
    ["Skincare dan makeup", "Perawatan", "skincare makeup seserahan"],
    ["Tas atau sepatu", "Aksesori", "tas sepatu seserahan"],
  ].map(([name, category, keyword], index) => ({
    id: `seserahan-${index}`,
    name,
    category,
    quantity: 1,
    estimatedCost: 0,
    actualCost: 0,
    status: "to_buy" as const,
    link: `https://shopee.co.id/search?keyword=${encodeURIComponent(keyword)}`,
  }));
}
