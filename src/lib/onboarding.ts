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
  } catch {
    return;
  }
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

export function getPlanningDurationMonths(weddingDate: string, startDate = new Date()) {
  const wedding = new Date(`${weddingDate}T12:00:00`);
  if (Number.isNaN(wedding.getTime())) return 0;

  const months =
    (wedding.getFullYear() - startDate.getFullYear()) * 12 +
    (wedding.getMonth() - startDate.getMonth());
  return Math.max(0, months - (wedding.getDate() < startDate.getDate() ? 1 : 0));
}

export type PlanningInterpretation = {
  title: string;
  interpretation: string;
  implications: string[];
  recommendation: string;
  tier?: string;
  complexity?: string;
};

export function interpretLocation(location: string): PlanningInterpretation {
  const metro = ["Jakarta", "Tangerang", "Bekasi", "Depok", "Bogor", "Surabaya", "Bali"].includes(
    location,
  );
  const label = location || "kota belum dipilih";
  return {
    title: "Location interpretation",
    interpretation: location
      ? `${location} memberi konteks lokal untuk venue, vendor, dan logistik acara.`
      : "Lokasi belum ditentukan, jadi estimasi masih menggunakan asumsi umum pasar Indonesia.",
    tier: metro ? "Menengah–tinggi" : location ? "Menengah" : "Belum dapat ditentukan",
    implications: metro
      ? [
          `Venue dan catering di ${label} cenderung lebih kompetitif dan mahal.`,
          "Transportasi, parkir, dan waktu tempuh vendor perlu dikunci lebih awal.",
        ]
      : [
          "Pilihan venue dan vendor lokal dapat membantu efisiensi biaya.",
          "Akses keluarga, pengiriman barang, dan ketersediaan vendor perlu dikonfirmasi.",
        ],
    recommendation: location
      ? `Mulai shortlist venue dan vendor yang biasa menangani acara di ${location}.`
      : "Tentukan kota utama terlebih dahulu agar asumsi biaya tidak terlalu lebar.",
  };
}

export function interpretGuests(guests: number): PlanningInterpretation {
  const scale = guests < 100 ? "Intimate" : guests < 300 ? "Menengah" : "Besar";
  const implications =
    guests < 100
      ? [
          "Venue kecil dan format seated dinner atau intimate reception lebih mudah dikontrol.",
          "Variasi menu dan dekorasi dapat dibuat lebih personal.",
        ]
      : guests < 300
        ? [
            "Kapasitas venue, jumlah buffet line, seating, dan parkir mulai menjadi faktor utama.",
            "Catering, dekorasi, dan staffing akan naik mengikuti jumlah pax.",
          ]
        : [
            "Perlu venue dengan alur tamu, parkir, toilet, dan service flow yang kuat.",
            "Catering, meja-kursi, usher, keamanan, dan transportasi menjadi cost driver terbesar.",
          ];
  return {
    title: "Guest count interpretation",
    interpretation: `${guests || 0} tamu masuk skala ${scale.toLowerCase()} untuk konteks pernikahan Indonesia.`,
    tier: scale,
    implications,
    recommendation:
      guests >= 300
        ? "Validasi kapasitas venue dan flow catering sebelum mengunci vendor."
        : "Buat guest list per keluarga dan teman agar target pax tidak terus melebar.",
  };
}

export function interpretBudget(
  budgetChoice: BudgetChoice,
  budget: string,
): PlanningInterpretation {
  if (budgetChoice !== "yes") {
    return {
      title: "Budget readiness interpretation",
      interpretation:
        "Budget belum dikunci; pendekatan terbaik adalah discovery berbasis guest count, kota, dan prioritas keluarga.",
      implications: [
        "Mulai dari rentang biaya, bukan satu angka tunggal.",
        "Booking vendor sebelum scope jelas meningkatkan risiko overbudget.",
      ],
      recommendation:
        "Tetapkan batas atas dan tiga prioritas utama sebelum meminta quotation vendor.",
    };
  }
  const amount = Number(budget) || 0;
  const tier = amount < 100_000_000 ? "Lean" : amount < 300_000_000 ? "Balanced" : "Premium";
  return {
    title: "Budget readiness interpretation",
    interpretation: `${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)} masuk tier ${tier.toLowerCase()} sebagai titik awal perencanaan.`,
    tier,
    implications: [
      "Alokasi venue, catering, dan vendor utama perlu dijaga agar tidak menghabiskan seluruh dana.",
      "Sisakan buffer 10–15% untuk biaya tambahan, overtime, dan perubahan jumlah tamu.",
    ],
    recommendation: "Pisahkan budget committed, paid, dan buffer sejak quotation pertama masuk.",
  };
}

export function interpretWeddingType(weddingType: string, adat: string): PlanningInterpretation {
  const style = weddingType || "gaya belum dipilih";
  const tradition =
    adat && adat !== "No specific adat yet"
      ? ` Dengan tradisi ${adat},`
      : " Tanpa tradisi khusus yang dipilih,";
  const complexity =
    adat && adat !== "No specific adat yet"
      ? "Menengah–tinggi"
      : weddingType === "Intimate Wedding"
        ? "Rendah–menengah"
        : "Menengah";
  return {
    title: "Wedding style interpretation",
    interpretation: `${style}${tradition} kebutuhan venue, vendor, dan keterlibatan keluarga akan mengikuti format acara yang dipilih.`,
    complexity,
    implications: [
      "Gaya acara memengaruhi layout venue, urutan rundown, kebutuhan vendor, dan jumlah PIC keluarga.",
      adat && adat !== "No specific adat yet"
        ? `Tradisi ${adat} perlu dikonfirmasi urutan prosesi, perlengkapan, dan penanggung jawabnya.`
        : "Jika ada prosesi keluarga tambahan, masukkan sebagai ceremony terpisah agar tidak hilang dari rundown.",
    ],
    recommendation:
      "Konfirmasi urutan prosesi dengan kedua keluarga sebelum mengunci rundown dan vendor.",
  };
}

export function interpretOrganizer(organizer: SetupState["organizer"]): PlanningInterpretation {
  if (organizer === "yes") {
    return {
      title: "WO interpretation",
      interpretation:
        "Wedding Organizer dapat menjadi pusat koordinasi vendor, keluarga, dan timeline di pasar pernikahan Indonesia.",
      implications: [
        "WO membantu mengelola vendor arrival, rundown, dan eskalasi masalah pada hari-H.",
        "Pasangan tetap perlu menyepakati scope kerja, jumlah kru, dan overtime secara tertulis.",
      ],
      recommendation: "Minta breakdown scope, PIC utama, dan simulasi hari-H sebelum booking.",
      complexity: "Risiko lebih rendah",
    };
  }
  return {
    title: "WO interpretation",
    interpretation:
      "Tanpa WO, pasangan dan keluarga memegang lebih banyak pekerjaan koordinasi sebelum dan saat hari-H.",
    implications: [
      "Perlu menunjuk family coordinator atau day-of PIC yang tidak sedang menjadi pengantin.",
      "Vendor contacts, call sheet, rundown, dan emergency plan harus siap sebelum hari-H.",
    ],
    recommendation:
      "Tunjuk satu PIC operasional dan mulai susun call sheet sejak vendor mulai dibooking.",
    complexity: "Risiko lebih tinggi",
  };
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
