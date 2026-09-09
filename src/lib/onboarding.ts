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
 * Baseline internal untuk estimasi awal. Harga aktual perlu dikonfirmasi langsung
 * kepada venue dan vendor karena paket, pajak, service, dan kondisi kota berbeda.
 */
export const cityPricing: Record<
  string,
  { cateringPerPax: number; venueBase: number; tier: string }
> = {
  Jakarta: { cateringPerPax: 75000, venueBase: 35000000, tier: "metro-tinggi" },
  Tangerang: { cateringPerPax: 70000, venueBase: 30000000, tier: "metro-tinggi" },
  Bekasi: { cateringPerPax: 68000, venueBase: 27000000, tier: "metro" },
  Depok: { cateringPerPax: 68000, venueBase: 25000000, tier: "metro" },
  Bogor: { cateringPerPax: 65000, venueBase: 22000000, tier: "metro" },
  Bandung: { cateringPerPax: 70000, venueBase: 25000000, tier: "menengah-tinggi" },
  Surabaya: { cateringPerPax: 75000, venueBase: 30000000, tier: "metro-tinggi" },
  Bali: { cateringPerPax: 80000, venueBase: 40000000, tier: "premium" },
  Yogyakarta: { cateringPerPax: 60000, venueBase: 15000000, tier: "menengah" },
  Semarang: { cateringPerPax: 62000, venueBase: 18000000, tier: "menengah" },
  Makassar: { cateringPerPax: 62000, venueBase: 18000000, tier: "menengah" },
  Medan: { cateringPerPax: 60000, venueBase: 18000000, tier: "menengah" },
  Other: { cateringPerPax: 60000, venueBase: 12000000, tier: "hemat" },
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

export type SuggestedBudgetAllocation = {
  id: string;
  label: string;
  percent: number;
};

export type PlanningRecommendation = {
  id: string;
  label: string;
  title: string;
  detail: string;
};

const highDemandLocations = new Set(["Jakarta", "Tangerang", "Surabaya", "Bali"]);

function formatShortIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSuggestedBudgetAllocation(setup: SetupState): SuggestedBudgetAllocation[] {
  const isLargeWedding = setup.guests >= 300;
  const isOutdoor = setup.venueType === "outdoor";
  const cateringPercent = isLargeWedding ? 30 : 28;
  const venuePercent = isOutdoor ? 20 : isLargeWedding ? 16 : 17;
  const contingencyPercent = isOutdoor ? (isLargeWedding ? 5 : 7) : isLargeWedding ? 9 : 10;

  return [
    { id: "venue", label: "Venue", percent: venuePercent },
    { id: "catering", label: "Catering", percent: cateringPercent },
    { id: "decoration", label: "Decoration", percent: 12 },
    { id: "photography", label: "Photography & Videography", percent: 10 },
    { id: "attire", label: "Makeup & Attire", percent: 10 },
    { id: "entertainment", label: "Entertainment & MC", percent: 4 },
    { id: "stationery", label: "Invitation & Souvenirs", percent: 4 },
    { id: "family", label: "Family & transport", percent: 5 },
    { id: "contingency", label: "Contingency", percent: contingencyPercent },
  ];
}

export function interpretLocation(location: string): PlanningInterpretation {
  const pricing = location ? cityPricing[location] : undefined;
  const tier = !location
    ? "Belum dipilih"
    : highDemandLocations.has(location)
      ? "Permintaan tinggi"
      : "Biaya relatif seimbang";
  const label = location || "kota belum dipilih";
  return {
    title: "Konteks lokasi",
    interpretation: location
      ? `${label} menjadi acuan awal untuk ketersediaan venue, biaya logistik, dan pilihan vendor.`
      : "Lokasi belum dipilih, jadi estimasi saat ini hanya memakai asumsi nasional yang konservatif.",
    tier,
    implications: [
      pricing && highDemandLocations.has(location)
        ? "Tanggal akhir pekan dan venue populer biasanya membutuhkan keputusan lebih awal."
        : "Bandingkan paket lokal, kapasitas, akses keluarga, parkir, dan jadwal loading vendor.",
    ],
    recommendation: location
      ? `Shortlist tiga venue di ${label}; minta harga nett dan rincian fasilitas yang sama untuk dibandingkan.`
      : "Tentukan kota utama sebelum mengunci budget atau mulai membandingkan vendor.",
  };
}

export function interpretGuests(
  guests: number,
  bride?: number,
  groom?: number,
): PlanningInterpretation {
  const scale =
    guests < 100 ? "Intimate" : guests < 300 ? "Menengah" : guests < 700 ? "Besar" : "Sangat besar";
  const splitNote = bride && groom ? ` (${bride} dari mempelai 1, ${groom} dari mempelai 2)` : "";
  const implications =
    guests < 100
      ? [
          "Prioritaskan suasana, alur keluarga inti, dan minimum order vendor daripada kapasitas besar.",
        ]
      : guests < 300
        ? ["Venue, catering, kursi, parkir, dan RSVP mulai menjadi penggerak biaya utama."]
        : [
            "Pastikan alur kedatangan, kapasitas parkir, titik makan, dan PIC tamu disepakati sebelum booking.",
          ];
  return {
    title: "Konteks jumlah tamu",
    interpretation: `${guests || 0} tamu${splitNote} — skala ${scale.toLowerCase()} di konteks Indonesia.`,
    tier: scale,
    implications,
    recommendation:
      guests >= 300
        ? "Bagi target tamu per pihak dan gunakan angka total itu saat meminta proposal venue serta catering."
        : "Pisahkan tamu inti dan cadangan agar kapasitas venue serta porsi catering tetap terkendali.",
  };
}

export function interpretBudget(
  budgetChoice: BudgetChoice,
  budget: string,
  location?: string,
  guests?: number,
): PlanningInterpretation {
  if (budgetChoice !== "yes") {
    return {
      title: "Kesiapan budget",
      interpretation:
        "Budget belum dikunci. Mulai dari total dana yang benar-benar tersedia, termasuk kontribusi keluarga yang sudah disepakati.",
      implications: [
        `${guests ?? 0} tamu tetap menjadi penggerak utama untuk biaya venue dan catering${location ? ` di ${location}` : ""}.`,
      ],
      recommendation:
        "Sepakati batas total, pembayar tiap pos, dan dana cadangan sebelum membayar DP pertama.",
    };
  }
  const amount = Number(budget) || 0;
  const tier =
    amount < 150_000_000
      ? "Perlu prioritas ketat"
      : amount < 400_000_000
        ? "Ruang lingkup terarah"
        : "Ruang lingkup luas";
  return {
    title: "Kesiapan budget",
    interpretation: `${formatShortIDR(amount)} sudah menjadi batas kerja awal untuk menyaring pilihan venue, jumlah tamu, dan vendor.`,
    tier,
    implications: [
      "Biaya venue dan catering perlu dibahas lebih dulu karena biasanya menyerap porsi terbesar dari keseluruhan dana.",
    ],
    recommendation:
      "Pisahkan setidaknya 10% sebagai cadangan dan pastikan setiap quotation menyebutkan harga nett.",
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
    title: "Konteks gaya & adat",
    interpretation: `${style}${tradition} urutan prosesi, kebutuhan vendor, dan keputusan keluarga perlu diselaraskan sejak awal.`,
    complexity,
    implications: [
      "Gaya memengaruhi layout, rundown, PIC keluarga, serta kebutuhan rias dan dekor.",
      proc
        ? `${adat}: konfirmasi urutan ${proc.prosesi.slice(0, 3).join(" → ")} dan penanggung jawabnya dengan keluarga.`
        : "Jika ada prosesi keluarga, masukkan sebagai ceremony terpisah di rundown.",
    ],
    recommendation:
      "Tetapkan prosesi yang benar-benar dipakai dan siapa pengambil keputusan untuk setiap sesi.",
  };
}

export function interpretOrganizer(organizer: SetupState["organizer"]): PlanningInterpretation {
  if (organizer === "yes") {
    return {
      title: "WO interpretation",
      interpretation:
        "WO dapat menjadi pusat koordinasi vendor, keluarga, dan timeline agar pasangan tidak memegang semua detail operasional.",
      implications: [
        "Tetap tetapkan PIC keluarga untuk keputusan adat dan kebutuhan tamu penting.",
      ],
      recommendation:
        "Minta scope tertulis, PIC utama, jumlah kru, dan ketentuan overtime sebelum menandatangani kontrak.",
      complexity: "Risiko lebih rendah",
    };
  }
  return {
    title: "WO interpretation",
    interpretation:
      "Tanpa WO, pasangan dan keluarga memegang koordinasi sehingga pembagian peran harus lebih jelas.",
    implications: [
      "Tunjuk satu PIC operasional yang bukan pengantin untuk mengelola vendor di hari-H.",
    ],
    recommendation: "Buat call sheet, kontak vendor, dan rundown bersama semua PIC sebelum hari-H.",
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
        : "Belum menentukan — gunakan shortlist agar kapasitas dan biaya bisa dibandingkan secara setara.";
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
        ? ["Siapkan plan B cuaca, tenda, listrik cadangan, dan fasilitas tamu."]
        : venueType === "rumah"
          ? [
              "Bisa gotong royong, tapi cek listrik, parkir, dan izin tetangga.",
              "Catering & dekor terpisah — koordinasi ekstra.",
            ]
          : [
              "Cek rekanan vendor gedung, jam loading, dan overtime.",
              "Pastikan harga tertulis sudah mencakup fasilitas, pajak, dan service.",
            ],
    recommendation:
      venueStatus === "not_decided"
        ? "Survei 3 venue minggu ini; bawa checklist kapasitas & fasilitas."
        : "Konfirmasi kapasitas vs guest list + parkir.",
  };
}

export function getIndonesiaPlanningRecommendations(
  setup: SetupState,
  estimatedBudget: number,
): PlanningRecommendation[] {
  const planningMonths = getPlanningDurationMonths(setup.akadDate || setup.weddingDate);
  const cityLabel = setup.location || "kota pilihanmu";
  const venueRecommendation: PlanningRecommendation =
    setup.venueStatus === "booked"
      ? {
          id: "venue-terms",
          label: "Venue",
          title: "Review detail booking venue",
          detail: `Cocokkan kapasitas ${setup.guests} tamu, jam penggunaan, rekanan vendor, dan harga nett sebelum melanjutkan ke vendor lain.`,
        }
      : {
          id: "venue-shortlist",
          label: planningMonths > 0 && planningMonths <= 6 ? "Prioritas minggu ini" : "Venue",
          title: `Shortlist venue di ${cityLabel}`,
          detail:
            planningMonths > 0 && planningMonths <= 6
              ? "Fokus pada tanggal tersedia, kapasitas, parkir, dan fasilitas yang benar-benar sudah termasuk."
              : "Bandingkan tiga opsi dengan format proposal yang sama—kapasitas, paket, biaya tambahan, dan aturan vendor luar.",
        };
  const budgetRecommendation: PlanningRecommendation =
    setup.budgetChoice === "yes"
      ? {
          id: "budget-buffer",
          label: "Budget",
          title: `Jaga ${formatShortIDR(Math.round(estimatedBudget * 0.1))} sebagai cadangan`,
          detail:
            "Pisahkan dari dana vendor agar tambahan porsi, transportasi, dan kebutuhan keluarga tidak mengganggu rencana utama.",
        }
      : {
          id: "budget-alignment",
          label: "Budget",
          title: "Sepakati batas dana sebelum membayar DP",
          detail:
            "Catat kontribusi pasangan dan keluarga per pos, lalu gunakan total tersebut untuk menyaring paket venue serta catering.",
        };
  const operationsRecommendation: PlanningRecommendation =
    setup.adat && setup.adat !== "No specific adat yet"
      ? {
          id: "family-adat",
          label: "Keluarga & adat",
          title: `Selaraskan prosesi ${setup.adat}`,
          detail: `Tetapkan ${setup.ceremonyTypes.length || 1} prosesi yang dipakai, urutannya, dan PIC keluarga sebelum rundown dibuat.`,
        }
      : setup.organizer === "no"
        ? {
            id: "day-of-pic",
            label: "Operasional",
            title: "Tunjuk PIC hari-H sejak sekarang",
            detail:
              "Pilih orang yang tidak menjadi pengantin untuk memegang kontak vendor, rundown, dan keputusan cepat di lokasi.",
          }
        : {
            id: "guest-flow",
            label: "Tamu",
            title: "Kunci target tamu per pihak",
            detail: `Gunakan pembagian ${setup.guestsBride} dan ${setup.guestsGroom} tamu saat mengecek kapasitas serta menyiapkan porsi catering.`,
          };

  return [venueRecommendation, budgetRecommendation, operationsRecommendation];
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
  const budgetAllocation = getSuggestedBudgetAllocation(setup);
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
      title: `Food tasting dan lock porsi untuk ${setup.guests} tamu`,
      category: "Catering",
      due: date,
      priority: "high",
      status: "todo",
    },
  ];
  const localPack = createLocalPlanningPack(setup);
  const starterBudget: BudgetItem[] = budgetAllocation.map((item) => {
    const isBookedVenue = item.id === "venue" && setup.venueStatus === "booked";
    const amount = Math.round((budget * item.percent) / 100);

    return {
      id: `setup-${item.id}-budget`,
      category: item.label,
      amount,
      paid: isBookedVenue ? Math.round(amount * 0.1) : 0,
      committed: 0,
      status: isBookedVenue ? "partial" : "planned",
      payer: setup.budgetPayer,
    };
  });
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
      `Minta proposal catering untuk ${setup.guests} tamu dengan harga nett dan detail porsi`,
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
