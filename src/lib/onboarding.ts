import type { BudgetItem, Milestone, Payer, SeserahanItem, Task, Vendor } from "@/lib/types";
import type { WorkspaceData } from "@/lib/data.functions";
import { getBrowserStorage } from "@/lib/browser-storage";

export type SetupMode = "blank" | "smart";
export type BudgetChoice = "yes" | "no" | "";
export type VenueType =
  | "gedung"
  | "ballroom_hotel"
  | "outdoor"
  | "rumah"
  | "masjid_gereja"
  | "restoran"
  | "";
export type TimeSlot = "pagi" | "siang" | "malam" | "";
export type Religion =
  | "islam"
  | "kristen"
  | "katolik"
  | "hindu"
  | "buddha"
  | "konghucu"
  | "other"
  | "";

export type SetupState = {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string; // kept for compat — maps to akadDate if split not used
  // — new split dates (optional, falls back to weddingDate)
  akadDate: string;
  resepsiDate: string;
  timeSlot: TimeSlot;
  location: string;
  guests: number;
  guestsBride: number;
  guestsGroom: number;
  budgetChoice: BudgetChoice;
  budget: string;
  weddingType: string;
  adat: string;
  organizer: "yes" | "no" | "";
  ceremonyTypes: string[];
  venueStatus: "not_decided" | "shortlisted" | "booked";
  venueName: string;
  venueType: VenueType;
  religion: Religion;
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

export const venueTypes: { value: VenueType; label: string; desc: string }[] = [
  {
    value: "gedung",
    label: "Gedung serbaguna",
    desc: "Kapasitas besar, paket gedung+catering populer",
  },
  {
    value: "ballroom_hotel",
    label: "Ballroom hotel",
    desc: "Full service, harga premium, AC & parkir terjamin",
  },
  {
    value: "outdoor",
    label: "Outdoor (kebun / pantai)",
    desc: "Butuh tenda, izin cuaca, dan sound extra",
  },
  {
    value: "rumah",
    label: "Rumah / halaman",
    desc: "Intimate, bisa gotong royong, tenda & catering terpisah",
  },
  {
    value: "masjid_gereja",
    label: "Masjid / Gereja / Rumah ibadah",
    desc: "Untuk akad/pemberkatan, resepsi terpisah",
  },
  { value: "restoran", label: "Restoran / Rooftop", desc: "Cocok 50–150 pax, paket F&B per pax" },
];

export const timeSlots: { value: TimeSlot; label: string; desc: string }[] = [
  { value: "pagi", label: "Pagi (08–11)", desc: "Adat Jawa/Sunda, akad pagi populer" },
  { value: "siang", label: "Siang (11–15)", desc: "Resepsi siang, catering siang" },
  { value: "malam", label: "Malam (18–21)", desc: "Lighting & dekor lebih maksimal" },
];

export const religions: { value: Religion; label: string }[] = [
  { value: "islam", label: "Islam (KUA)" },
  { value: "kristen", label: "Kristen" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
  { value: "other", label: "Lainnya" },
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
  "Bugis-Makassar",
  "Palembang",
  "Other",
] as const;

/**
 * Riset: prosesi per adat (diringkas dari sumber budaya Indonesia).
 * Dipakai untuk generate checklist otomatis di createLocalPlanningPack.
 */
export const adatProcessions: Record<string, { prosesi: string[]; seserahanNote: string }> = {
  Javanese: {
    prosesi: [
      "Lamaran & Paningset",
      "Pasang Tarub & Bleketepe",
      "Siraman (7 sumber + sungkeman)",
      "Midodareni",
      "Ijab Kabul",
      "Panggih / Balangan Gantal",
    ],
    seserahanNote: "Paningset utama: cincin + busana; abob-abon: makanan bermakna",
  },
  Sundanese: {
    prosesi: [
      "Neundeun Omong",
      "Narosan / Ngalamar (sirih + busana)",
      "Seserahan (6–8 kotak)",
      "Pengajian",
      "Siraman (ngecangkeun aisen, 7 bunga)",
      "Sungkeman",
      "Sawer & Nincak Endog (7 harupat)",
    ],
    seserahanNote: "Seserahan Sunda: alat ibadah, sinjang & brukat, jajanan Sunda, rias",
  },
  Minang: {
    prosesi: [
      "Maresek (penjajakan via bundo kanduang)",
      "Maminang & Batimbang Tando (pihak perempuan melamar)",
      "Malam Bainai (henna)",
      "Akad & resepsi matrilineal",
    ],
    seserahanNote: "Tando: cincin emas, songket, uang adat, sirih carano",
  },
  Batak: {
    prosesi: [
      "Marhusip (lamaran + pantun raja parhata)",
      "Martumpol (pemberkatan gereja)",
      "Ulos & adat marga",
      "Pesta adat (landek dance)",
    ],
    seserahanNote: "Hantaran: pinahan lobu / dekke arsik, ulos",
  },
  Betawi: {
    prosesi: [
      "Lamaran via mak comblang + Sirih Lamaran",
      "Tande putus (cincin seminggu setelah lamaran)",
      "Palang Pintu (silat & pantun)",
      "Akad & resepsi",
    ],
    seserahanNote: "Roti buaya wajib di seserahan Betawi",
  },
  Balinese: {
    prosesi: [
      "Memadik (lamaran)",
      "Mekala-kalaan (penyucian)",
      "Mesegeh Agung (upacara utama)",
      "Nganten / Mepejati",
    ],
    seserahanNote: "Seserahan: banten & canang, kain endek",
  },
  "Chinese Indonesian": {
    prosesi: [
      "Lamaran & Sangjit (12 nampan hantaran)",
      "Tea Pai (teh + angpao)",
      "Akad/pemberkatan",
      "Resepsi / Banquet",
    ],
    seserahanNote: "Sangjit: kue lapis, buah, teh, perhiasan",
  },
  "Bugis-Makassar": {
    prosesi: [
      "Mammanu-manua (penjajakan)",
      "Mappasiarekeng (lamaran)",
      "Mappacci / Tudang Penni (henna)",
      "Akad & resepsi + uang panai",
    ],
    seserahanNote: "Uang panai (mahar adat) + erang-erang",
  },
  Palembang: {
    prosesi: [
      "Ngidang / lamaran",
      "Seserahan (7–9 dulang)",
      "Akad & resepsi",
      "Tarian Gending Sriwijaya",
    ],
    seserahanNote: "Seserahan: kain songket Palembang, pempek & kue 8 jam",
  },
};

/**
 * Riset harga 2024-2025 Indonesia (rangkuman websearch):
 * - Catering: 20k–150k/pax (standard 50–90k, premium 120–150k), Jabodetabek 40k–90k, Bandung 75–150k
 * - Venue gedung: 10–50jt (Jakarta 20–50jt, kota kecil 5–15jt), Ballroom hotel 25–100jt, Outdoor 15–100jt
 * - Total tier: 50pax 30–60jt, 100pax 60–120jt, 200pax 150–250jt, 500pax 400–800jt
 * - Catering ~40–50% total, Venue+dekor ~25%
 */
export const cityPricing: Record<
  string,
  { cateringPerPax: number; venueBase: number; tier: string }
> = {
  Jakarta: { cateringPerPax: 90000, venueBase: 30000000, tier: "metro-tinggi" },
  Tangerang: { cateringPerPax: 80000, venueBase: 25000000, tier: "metro-tinggi" },
  Bekasi: { cateringPerPax: 75000, venueBase: 22000000, tier: "metro" },
  Depok: { cateringPerPax: 75000, venueBase: 20000000, tier: "metro" },
  Bogor: { cateringPerPax: 70000, venueBase: 18000000, tier: "metro" },
  Bandung: { cateringPerPax: 75000, venueBase: 20000000, tier: "menengah-tinggi" },
  Surabaya: { cateringPerPax: 80000, venueBase: 25000000, tier: "metro-tinggi" },
  Bali: { cateringPerPax: 95000, venueBase: 35000000, tier: "premium" },
  Yogyakarta: { cateringPerPax: 55000, venueBase: 12000000, tier: "menengah" },
  Semarang: { cateringPerPax: 60000, venueBase: 15000000, tier: "menengah" },
  Makassar: { cateringPerPax: 65000, venueBase: 15000000, tier: "menengah" },
  Medan: { cateringPerPax: 60000, venueBase: 15000000, tier: "menengah" },
  Other: { cateringPerPax: 50000, venueBase: 10000000, tier: "hemat" },
};

export const blankSetup: SetupState = {
  partnerOneName: "",
  partnerTwoName: "",
  weddingDate: "",
  akadDate: "",
  resepsiDate: "",
  timeSlot: "",
  location: "",
  guests: 250,
  guestsBride: 125,
  guestsGroom: 125,
  budgetChoice: "",
  budget: "",
  weddingType: "",
  adat: "No specific adat yet",
  organizer: "",
  ceremonyTypes: ["Akad", "Resepsi"],
  venueStatus: "not_decided",
  venueName: "",
  venueType: "",
  religion: "islam",
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
  "Midodareni",
  "Panggih",
  "Sawer / Nincak Endog",
  "Malam Bainai",
  "Palang Pintu",
  "Sangjit",
] as const;

export const payerLabels: Record<Payer, string> = {
  couple: "Pasangan",
  bride_family: "Keluarga mempelai 1",
  groom_family: "Keluarga mempelai 2",
  shared: "Dibagi bersama",
  other: "Lainnya",
};

export function setupBudget(
  guests: number,
  budgetChoice: BudgetChoice,
  budget: string,
  location?: string,
) {
  if (budgetChoice === "yes" && Number(budget) > 0) return Number(budget);
  // Riset-based: catering 40-50% + venue. Use cityPricing if available.
  const city = location && cityPricing[location] ? location : "Other";
  const pricing = cityPricing[city]!;
  const catering = guests * pricing.cateringPerPax;
  // total ≈ catering / 0.42 + venue overhead (venue already partly in catering bundle? we add 30%)
  const estimate = Math.round((catering / 0.42 + pricing.venueBase * 0.6) / 1000000) * 1000000;
  // Clamp to tiers observed: 50pax ~35jt, 500pax ~450jt
  return Math.max(15000000, estimate);
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
  const pricing = location ? cityPricing[location] : undefined;
  const tier = pricing?.tier ?? (location ? "Menengah" : "Belum dapat ditentukan");
  const label = location || "kota belum dipilih";
  const implications = pricing
    ? tier.includes("metro") || tier.includes("premium")
      ? [
          `Catering ~Rp ${pricing.cateringPerPax.toLocaleString("id-ID")}/pax, venue base ~Rp ${(pricing.venueBase / 1_000_000).toFixed(0)}jt di ${label} (riset 2025).`,
          `Gedung populer di ${label} penuh 8–12 bulan sebelum — booking & DP awal kunci harga.`,
        ]
      : [
          `Catering ~Rp ${pricing.cateringPerPax.toLocaleString("id-ID")}/pax di ${label} — lebih hemat dari Jabodetabek.`,
          "Vendor lokal & paket gedung+catering bisa hemat 15–20%.",
        ]
    : [
        "Pilihan venue dan vendor lokal dapat membantu efisiensi biaya.",
        "Akses keluarga, pengiriman barang, dan ketersediaan vendor perlu dikonfirmasi.",
      ];
  return {
    title: "Location interpretation",
    interpretation: location
      ? `${label} (${tier}) memberi konteks harga pasar lokal untuk venue, catering, dan logistik.`
      : "Lokasi belum ditentukan, jadi estimasi masih pakai asumsi nasional (Other).",
    tier,
    implications,
    recommendation: location
      ? `Shortlist 3 venue di ${label} dan minta paket catering+dekor bundling untuk bandingkan.`
      : "Tentukan kota utama dulu — selisih catering antar kota bisa 2×.",
  };
}

export function interpretGuests(
  guests: number,
  bride?: number,
  groom?: number,
): PlanningInterpretation {
  const scale =
    guests < 100 ? "Intimate" : guests < 300 ? "Menengah" : guests < 500 ? "Besar" : "Sangat besar";
  const splitNote = bride && groom ? ` (${bride} dari mempelai 1, ${groom} dari mempelai 2)` : "";
  const implications =
    guests < 100
      ? [
          "Venue kecil / restoran / rumah cukup — catering 40 porsi + stall 2 cukup.",
          "Undang digital + souvenir simple hemat 3–5jt.",
        ]
      : guests < 300
        ? [
            "Kapasitas gedung 300–500, buffet 2 line, parkir & toilet jadi faktor.",
            `Catering ~${guests}×Rp 70–90k = Rp ${Math.round((guests * 80000) / 1_000_000)}jt — pos terbesar (40–50%).`,
          ]
        : [
            "Butuh gedung 600+ kapasitas, alur tamu, 3–4 stall, usher & keamanan.",
            `Catering ${guests} pax bisa 150–250jt — validasi kapasitas & flow sebelum DP.`,
          ];
  return {
    title: "Guest count interpretation",
    interpretation: `${guests || 0} tamu${splitNote} — skala ${scale.toLowerCase()} di konteks Indonesia.`,
    tier: scale,
    implications,
    recommendation:
      guests >= 300
        ? "Finalkan guest list per pihak (Bride/Groom/Keluarga) sebelum survei venue."
        : "Pisahkan tamu inti vs cadangan; RSVP 1 bulan sebelum untuk lock porsi.",
  };
}

export function interpretBudget(
  budgetChoice: BudgetChoice,
  budget: string,
  location?: string,
  guests?: number,
): PlanningInterpretation {
  if (budgetChoice !== "yes") {
    const pricing = location ? cityPricing[location] : cityPricing["Other"]!;
    const hint = guests
      ? ` Dengan ${guests} tamu di ${location || "Other"}, estimasi riset ~Rp ${(setupBudget(guests, "no", "", location) / 1_000_000).toFixed(0)}jt.`
      : "";
    return {
      title: "Budget readiness interpretation",
      interpretation:
        `Budget belum dikunci; estimasi riset pakai catering Rp ${pricing.cateringPerPax.toLocaleString("id-ID")}/pax + venue base.` +
        hint,
      implications: [
        "Mulai dari rentang, bukan 1 angka — siapkan buffer 10–15% untuk hidden cost.",
        "Bandingkan 3 paket bundling gedung+catering+dekor sebelum DP.",
      ],
      recommendation:
        "Tetapkan batas atas dan 3 prioritas (catering/venue/dokumentasi) sebelum quotation.",
    };
  }
  const amount = Number(budget) || 0;
  const tier =
    amount < 100_000_000
      ? "Lean (100 tamu intimate)"
      : amount < 300_000_000
        ? "Balanced (200–300 tamu)"
        : "Premium (500+ tamu)";
  return {
    title: "Budget readiness interpretation",
    interpretation: `${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)} — ${tier}.`,
    tier,
    implications: [
      "Jaga venue+catering ≤65% total; sisakan 10–15% buffer.",
      "Pisahkan committed vs paid vs buffer sejak quotation pertama.",
    ],
    recommendation:
      "Alokasikan catering 40–50%, venue+dekor 25%, foto 10%, sisanya souvenir/MC/cadangan.",
  };
}

export function interpretWeddingType(weddingType: string, adat: string): PlanningInterpretation {
  const style = weddingType || "gaya belum dipilih";
  const proc = adatProcessions[adat];
  const tradition =
    adat && adat !== "No specific adat yet"
      ? ` Dengan ${adat}${proc ? ` (${proc.prosesi.slice(0, 2).join(" → ")})` : ""},`
      : " Tanpa adat khusus,";
  const complexity =
    adat && adat !== "No specific adat yet"
      ? "Menengah–tinggi (adat)"
      : weddingType === "Intimate Wedding"
        ? "Rendah–menengah"
        : "Menengah";
  return {
    title: "Wedding style interpretation",
    interpretation: `${style}${tradition} urutan prosesi & vendor mengikuti adat.`,
    complexity,
    implications: [
      "Gaya memengaruhi layout, rundown, PIC keluarga, dan vendor (rias adat, dekor).",
      proc
        ? `${adat}: ${proc.prosesi.join(" → ")}. Konfirmasi urutan & penanggung jawab dengan sesepuh.`
        : "Jika ada prosesi keluarga, masukkan sebagai ceremony terpisah di rundown.",
    ],
    recommendation:
      "Lock prosesi adat dengan kedua keluarga 6–8 bulan sebelum, sebelum fitting & dekor.",
  };
}

export function interpretOrganizer(organizer: SetupState["organizer"]): PlanningInterpretation {
  if (organizer === "yes") {
    return {
      title: "WO interpretation",
      interpretation:
        "WO jadi pusat koordinasi vendor, keluarga, dan timeline — riset: vendor WO penuh 9–12 bulan sebelum peak season.",
      implications: [
        "WO kelola arrival, rundown, dan eskalasi hari-H — minta scope tertulis + jumlah kru + overtime.",
        "Tetap butuh PIC keluarga untuk keputusan adat & sambutan tamu VIP.",
      ],
      recommendation: "Tanya WO: breakdown scope, PIC utama, simulasi hari-H, dan paket bundling.",
      complexity: "Risiko lebih rendah",
    };
  }
  return {
    title: "WO interpretation",
    interpretation: "Tanpa WO, pasangan & keluarga pegang koordinasi — butuh family coordinator.",
    implications: [
      "Tunjuk 1 PIC operasional yang tidak jadi pengantin di hari-H.",
      "Call sheet, kontak vendor, rundown per menit, dan plan B cuaca harus siap H-7.",
    ],
    recommendation:
      "Susun call sheet sejak booking vendor; technical meeting H-14 dengan semua vendor.",
    complexity: "Risiko lebih tinggi",
  };
}

export function interpretVenue(
  venueType: VenueType,
  venueStatus: SetupState["venueStatus"],
): PlanningInterpretation {
  const typeLabel = venueTypes.find((v) => v.value === venueType)?.label ?? "belum dipilih";
  const statusNote =
    venueStatus === "booked"
      ? "Sudah booking — kunci harga & tanggal."
      : venueStatus === "shortlisted"
        ? "Sudah shortlist — bandingkan 3 paket."
        : "Belum menentukan — survei segera (venue penuh 8–12 bulan di kota besar).";
  return {
    title: "Venue interpretation",
    interpretation: `${typeLabel}: ${statusNote}`,
    tier:
      venueType === "ballroom_hotel"
        ? "Premium"
        : venueType === "outdoor"
          ? "Butuh plan B"
          : venueType
            ? "Menengah"
            : "Belum ditentukan",
    implications:
      venueType === "outdoor"
        ? [
            "Siapkan tenda, genset, toilet portable, dan izin hujan.",
            "Sound & lighting outdoor butuh 10–20% extra.",
          ]
        : venueType === "rumah"
          ? [
              "Bisa gotong royong, tapi cek listrik, parkir, dan izin tetangga.",
              "Catering & dekor terpisah — koordinasi ekstra.",
            ]
          : [
              "Cek rekanan vendor gedung, jam loading, dan overtime.",
              "DP awal kunci harga tahun berjalan.",
            ],
    recommendation:
      venueStatus === "not_decided"
        ? "Survei 3 venue minggu ini; bawa checklist kapasitas & fasilitas."
        : "Konfirmasi kapasitas vs guest list + parkir.",
  };
}

export function getPlanningDate(weddingDate?: string) {
  if (weddingDate) return weddingDate;
  const date = new Date();
  date.setMonth(date.getMonth() + 14);
  return date.toISOString().slice(0, 10);
}

export function smartData(setup: SetupState) {
  const primaryDate = setup.akadDate || setup.weddingDate;
  const budget = setupBudget(setup.guests, setup.budgetChoice, setup.budget, setup.location);
  const date = getPlanningDate(primaryDate);
  const resepsiDate = setup.resepsiDate ? getPlanningDate(setup.resepsiDate) : date;
  const coupleName = [setup.partnerOneName, setup.partnerTwoName].filter(Boolean).join(" & ");
  const pricing = cityPricing[setup.location] ?? cityPricing["Other"]!;
  // Riset: alokasi 2025 — catering 40-50%, venue 20-30%, dekor 12%, foto 8%, etc.
  const cateringPct = setup.guests >= 300 ? 0.42 : 0.38;
  const starterTasks: Task[] = [
    {
      id: "setup-venue",
      title:
        setup.venueStatus === "booked"
          ? `Konfirmasi final venue: ${setup.venueName || "venue terpilih"}`
          : "Shortlist 3 venue sesuai kapasitas & budget",
      category: "Venue",
      due: date,
      priority: "high",
      status: "todo",
    },
    {
      id: "setup-guest-list",
      title: `Finalkan guest list ${setup.guests} tamu (${setup.guestsBride} & ${setup.guestsGroom} split)`,
      category: "Guests",
      due: date,
      priority: "high",
      status: "todo",
    },
    {
      id: "setup-catering",
      title: `Food tasting catering — estimasi ${setup.guests}×Rp ${pricing.cateringPerPax.toLocaleString("id-ID")} = Rp ${Math.round((setup.guests * pricing.cateringPerPax) / 1_000_000)}jt`,
      category: "Catering",
      due: date,
      priority: "high",
      status: "todo",
    },
  ];
  const localPack = createLocalPlanningPack(setup);
  // Budget alokasi riset-based
  const starterBudget: BudgetItem[] = [
    {
      id: "setup-catering-budget",
      category: "Catering",
      amount: Math.round(budget * cateringPct),
      paid: 0,
      committed: 0,
      status: "planned",
    },
    {
      id: "setup-venue-budget",
      category: "Venue",
      amount: Math.round(budget * 0.25),
      paid: setup.venueStatus === "booked" ? Math.round(budget * 0.1) : 0,
      committed: 0,
      status: setup.venueStatus === "booked" ? "partial" : "planned",
    },
    {
      id: "setup-decoration-budget",
      category: "Decoration",
      amount: Math.round(budget * 0.12),
      paid: 0,
      committed: 0,
      status: "planned",
    },
    {
      id: "setup-photo-budget",
      category: "Photography",
      amount: Math.round(budget * 0.08),
      paid: 0,
      committed: 0,
      status: "planned",
    },
    {
      id: "setup-buffer-budget",
      category: "Buffer (10%)",
      amount: Math.round(budget * 0.1),
      paid: 0,
      committed: 0,
      status: "planned",
    },
  ];
  const starterMilestones: Milestone[] = [
    {
      id: "setup-milestone-venue",
      title: setup.venueStatus === "booked" ? "Venue locked" : "Book venue (DP kunci harga)",
      date,
      kind: "venue",
      done: setup.venueStatus === "booked",
    },
    {
      id: "setup-milestone-legal",
      title: setup.religion === "islam" ? "Urus KUA & dokumen" : "Urus pemberkatan & dokumen",
      date,
      kind: "legal",
      done: false,
    },
    {
      id: "setup-milestone-guests",
      title: "Finalize guest list per pihak",
      date,
      kind: "review",
      done: false,
    },
    {
      id: "setup-milestone-catering",
      title: "Food tasting & lock porsi",
      date: resepsiDate,
      kind: "vendor",
      done: false,
    },
    {
      id: "setup-milestone-final",
      title: "Technical meeting H-14 & gladi",
      date: resepsiDate,
      kind: "review",
      done: false,
    },
  ];
  const starterVendors: Vendor[] = [];

  return {
    event: {
      name: coupleName || "Our wedding",
      type: setup.weddingType,
      date, // primary
      akadDate: primaryDate,
      resepsiDate,
      timeSlot: setup.timeSlot,
      location: setup.location,
      venueType: setup.venueType,
      venueName: setup.venueName,
      adat: setup.adat,
      brideName: setup.partnerOneName,
      groomName: setup.partnerTwoName,
      guestEstimate: setup.guests,
      guestsBride: setup.guestsBride,
      guestsGroom: setup.guestsGroom,
      budget,
      ceremonyTypes: setup.ceremonyTypes,
      venueStatus: setup.venueStatus,
      budgetPayer: setup.budgetPayer,
      planningTeam: setup.planningTeam,
      religion: setup.religion,
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
  const date = getPlanningDate(setup.akadDate || setup.weddingDate);
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

  const proc = adatProcessions[setup.adat];
  if (proc) {
    proc.prosesi.forEach((p, i) => add(`${p} — ${setup.adat}`, "Adat", i < 2 ? "high" : "medium"));
    add(`Siapkan seserahan ${setup.adat}: ${proc.seserahanNote}`, "Seserahan");
  } else if (setup.adat !== "No specific adat yet") {
    add(`Confirm ${setup.adat} ceremony sequence with both families`, "Adat", "high");
    add(`List ${setup.adat} attire, accessories, and symbolic items`, "Adat");
  }
  if (setup.ceremonyTypes.includes("Akad") || setup.religion === "islam") {
    add(
      "Confirm KUA / catatan sipil — gratis di KUA jam kerja, luar KUA ada biaya",
      "KUA & Legal",
      "high",
    );
    add("Prepare KTP, KK, pas foto, surat pengantar RT/RW", "KUA & Legal", "high");
  }
  if (setup.ceremonyTypes.includes("Resepsi")) {
    add(
      `Lock catering ${setup.guests} pax + 2 stall (riset: ${setup.location || "Other"} Rp ${(cityPricing[setup.location]?.cateringPerPax ?? 50000).toLocaleString("id-ID")}/pax)`,
      "Catering",
      "high",
    );
    add(`Draft rundown ${setup.timeSlot || "pagi/siang"} & PIC keluarga`, "Rundown");
  }
  if (
    setup.ceremonyTypes.includes("Siraman") ||
    proc?.prosesi.some((p) => p.toLowerCase().includes("siraman"))
  ) {
    add(
      "Siraman: air 7 sumber, 7 bunga (mawar, melati, kenanga, cempaka, sedap malam), sungkeman",
      "Adat",
    );
  }
  if (setup.ceremonyTypes.includes("Tea Pai") || proc?.prosesi.includes("Tea Pai (teh + angpao)")) {
    add("Tea Pai: tea set, angpao, seating keluarga besar", "Adat", "high");
  }
  if (setup.venueType === "outdoor") {
    add("Outdoor plan B: tenda, genset, toilet portable, izin hujan", "Venue", "high");
  }
  if (setup.venueType === "rumah") {
    add("Rumah: cek listrik, parkir, izin tetangga, tenda", "Venue");
  }
  if (setup.organizer === "no")
    add("Tunjuk 1 PIC non-pengantin sebagai day-of coordinator + call sheet H-7", "Family", "high");
  else if (setup.organizer === "yes")
    add("Brief WO: scope, jumlah kru, overtime, bundling gedung+catering", "WO");
  // Religion-specific
  if (setup.religion === "kristen" || setup.religion === "katolik")
    add("Booking gereja & katekisasi / kanonik", "Legal", "high");
  if (setup.religion === "hindu")
    add("Koordinasi dengan sulinggih / pemangku untuk upacara", "Adat", "high");
  return tasks;
}

export function createStarterSeserahan(): SeserahanItem[] {
  return [
    ["Alat ibadah", "Alat ibadah", "alat ibadah seserahan"],
    ["Perlengkapan wanita", "Perlengkapan", "perlengkapan wanita seserahan"],
    ["Pakaian atau kain (sinjang/batik)", "Pakaian", "kain batik seserahan"],
    ["Skincare dan makeup", "Perawatan", "skincare makeup seserahan"],
    ["Tas atau sepatu", "Aksesori", "tas sepatu seserahan"],
    ["Jajanan / kue adat", "Makanan", "kue adat seserahan"],
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
