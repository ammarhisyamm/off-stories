import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.checklist": "Checklist",
    "nav.budget": "Budget",
    "nav.seserahan": "Seserahan",
    "nav.vendors": "Vendors",
    "nav.guests": "Guests",
    "nav.notes": "Notes",
    "nav.documents": "Documents",
    "nav.settings": "Settings",
    "nav.admin": "Admin",
    "nav.weddingDay": "Wedding day",
    "nav.timeline": "Timeline",
    "nav.rundown": "Rundown",
    "nav.commandCenter": "Command center",
    "public.blog": "Blog",
    "public.privacy": "Privacy",
    "public.terms": "Terms",
    "public.signIn": "Sign in",
    "public.tagline": "offstories, one calm place for planning your wedding.",
    "common.loading": "Loading…",
    "common.signOut": "Sign out",
    "common.workspace": "Workspace",
    "common.daysUntil": "days until",
    "common.daysToGo": "days to go",
    "common.setupEvent": "Set up your event in Settings",
    "common.setupEventShort": "Set up your event",
    "common.yourWedding": "Your wedding",
    "checklist.title": "Master checklist",
    "checklist.eyebrow": "Operational",
    "checklist.desc": "Auto-generated master checklist grouped by category and phase.",
    "checklist.filterCategory": "Filter category",
    "checklist.all": "All",
    "checklist.reset": "Reset",
    "checklist.of": "of",
    "checklist.tasks": "tasks",
    "checklist.addTask": "Add task",
    "checklist.progress": "Progress overview",
    "checklist.complete": "complete",
    "onboarding.welcome": "Welcome to OffStories",
    "onboarding.howStart": "How would you like to start?",
    "onboarding.chooseStyle":
      "Choose the option that best fits your planning style. You can customize everything later.",
    "onboarding.blank": "Blank Canvas",
    "onboarding.blankDesc":
      "Start with a completely empty workspace and build your wedding plan from scratch.",
    "onboarding.smart": "Smart Wedding Setup",
    "onboarding.smartDesc":
      "Answer a few simple questions and OffStories will prepare your planning workspace for you.",
    "onboarding.recommended": "✦ Recommended",
    "onboarding.startDetails": "Start with your wedding details",
    "onboarding.partner1": "Partner 1 name *",
    "onboarding.partner2": "Partner 2 name *",
    "onboarding.weddingDate": "Wedding date *",
    "onboarding.finishBlank": "Finish and open workspace",
    "onboarding.startSmart": "Start smart setup",
    "onboarding.smartTitle": "Let's make a thoughtful first plan.",
    "onboarding.smartSubtitle": "A few answers are all we need to prepare your workspace.",
    "onboarding.q1Title": "Where will your wedding take place?",
    "onboarding.q1Desc": "We'll use this to shape your first planning suggestions.",
    "onboarding.location": "Location *",
    "onboarding.venueType": "Venue type",
    "onboarding.venueStatus": "Venue status",
    "onboarding.notDecided": "Not decided",
    "onboarding.shortlisted": "Shortlisted",
    "onboarding.booked": "Booked / DP paid",
    "onboarding.venueName": "Venue name (optional)",
    "onboarding.chooseCity": "Choose a city",
    "onboarding.chooseType": "Choose type",
    "onboarding.q2Title": "How many guests are you expecting?",
    "onboarding.q2Desc": "Split by side — affects venue capacity & catering (40–50% of budget).",
    "onboarding.totalGuests": "Total guests",
    "onboarding.partner1Guests": "Partner 1",
    "onboarding.partner2Guests": "Partner 2",
    "onboarding.q3Title": "When is the event?",
    "onboarding.q3Desc": "Akad & reception can be different days; time affects catering & décor.",
    "onboarding.akadDate": "Akad date *",
    "onboarding.resepsiDate": "Reception date",
    "onboarding.timeSlot": "Main time",
    "onboarding.religion": "Religion / Registration",
    "onboarding.chooseTime": "Choose time",
    "onboarding.q4Title": "Do you have a budget?",
    "onboarding.budgetYes": "Yes, we have a figure",
    "onboarding.budgetNo": "Not yet — estimate for us",
    "onboarding.budgetLabel": "Total budget (IDR)",
    "onboarding.budgetPayer": "Budget covered by",
    "onboarding.q5Title": "Which traditions & ceremonies?",
    "onboarding.q5Desc": "Select your main adat — checklist will be auto-generated.",
    "onboarding.mainAdat": "Main tradition",
    "onboarding.ceremonies": "Ceremonies planned (select all that apply)",
    "onboarding.q6Title": "What wedding style?",
    "onboarding.q6Desc": "Pick the closest — you can mix later.",
    "onboarding.q7Title": "Will you hire a Wedding Organizer?",
    "onboarding.q7Desc": "WOs get fully booked 9–12 months before peak season.",
    "onboarding.woYes": "Yes — Full / Day-of WO",
    "onboarding.woNo": "No — Family / friend as PIC",
    "onboarding.seePlan": "See your plan",
    "onboarding.langSwitch": "Language",
  },
  id: {
    "nav.dashboard": "Dasbor",
    "nav.checklist": "Checklist",
    "nav.budget": "Anggaran",
    "nav.seserahan": "Seserahan",
    "nav.vendors": "Vendor",
    "nav.guests": "Tamu",
    "nav.notes": "Catatan",
    "nav.documents": "Dokumen",
    "nav.settings": "Pengaturan",
    "nav.admin": "Admin",
    "nav.weddingDay": "Hari-H",
    "nav.timeline": "Timeline",
    "nav.rundown": "Rundown",
    "nav.commandCenter": "Command center",
    "public.blog": "Blog",
    "public.privacy": "Privasi",
    "public.terms": "Syarat",
    "public.signIn": "Masuk",
    "public.tagline": "offstories, satu tempat tenang untuk merencanakan pernikahanmu.",
    "common.loading": "Memuat…",
    "common.signOut": "Keluar",
    "common.workspace": "Workspace",
    "common.daysUntil": "hari menuju",
    "common.daysToGo": "hari lagi",
    "common.setupEvent": "Atur acara di Pengaturan",
    "common.setupEventShort": "Atur acaramu",
    "common.yourWedding": "Pernikahanmu",
    "checklist.title": "Checklist utama",
    "checklist.eyebrow": "Operasional",
    "checklist.desc": "Checklist induk otomatis per kategori dan fase.",
    "checklist.filterCategory": "Filter kategori",
    "checklist.all": "Semua",
    "checklist.reset": "Reset",
    "checklist.of": "dari",
    "checklist.tasks": "tugas",
    "checklist.addTask": "Tambah tugas",
    "checklist.progress": "Ringkasan progres",
    "checklist.complete": "selesai",
    "onboarding.welcome": "Selamat datang di OffStories",
    "onboarding.howStart": "Mau mulai seperti apa?",
    "onboarding.chooseStyle": "Pilih yang paling cocok dengan gayamu. Semua bisa diubah nanti.",
    "onboarding.blank": "Blank Canvas",
    "onboarding.blankDesc": "Mulai dari workspace kosong dan bangun rencanamu dari nol.",
    "onboarding.smart": "Smart Wedding Setup",
    "onboarding.smartDesc": "Jawab beberapa pertanyaan, OffStories akan siapkan workspace untukmu.",
    "onboarding.recommended": "✦ Rekomendasi",
    "onboarding.startDetails": "Mulai dengan detail pernikahan",
    "onboarding.partner1": "Nama mempelai 1 *",
    "onboarding.partner2": "Nama mempelai 2 *",
    "onboarding.weddingDate": "Tanggal pernikahan *",
    "onboarding.finishBlank": "Selesai & buka workspace",
    "onboarding.startSmart": "Mulai setup pintar",
    "onboarding.smartTitle": "Mari buat rencana awal yang matang.",
    "onboarding.smartSubtitle": "Beberapa jawaban saja cukup untuk menyiapkan workspace-mu.",
    "onboarding.q1Title": "Di mana pernikahan akan digelar?",
    "onboarding.q1Desc":
      "Kota & venue menentukan harga catering, dekor, dan logistik — riset 2026 beda 2×.",
    "onboarding.location": "Kota *",
    "onboarding.venueType": "Tipe venue",
    "onboarding.venueStatus": "Status venue",
    "onboarding.notDecided": "Belum menentukan",
    "onboarding.shortlisted": "Sudah shortlist",
    "onboarding.booked": "Sudah booking / DP",
    "onboarding.venueName": "Nama venue (opsional)",
    "onboarding.chooseCity": "Pilih kota",
    "onboarding.chooseType": "Pilih tipe",
    "onboarding.q2Title": "Berapa tamu yang diundang?",
    "onboarding.q2Desc": "Pisahkan per pihak — ngaruh kapasitas gedung & catering 40–50% budget.",
    "onboarding.totalGuests": "Total tamu",
    "onboarding.partner1Guests": "Mempelai 1",
    "onboarding.partner2Guests": "Mempelai 2",
    "onboarding.q3Title": "Kapan acaranya?",
    "onboarding.q3Desc": "Akad & resepsi bisa beda hari; jam menentukan catering & dekor.",
    "onboarding.akadDate": "Tanggal Akad *",
    "onboarding.resepsiDate": "Tanggal Resepsi",
    "onboarding.timeSlot": "Jam utama",
    "onboarding.religion": "Agama / Pencatatan",
    "onboarding.chooseTime": "Pilih jam",
    "onboarding.q4Title": "Sudah ada budget?",
    "onboarding.budgetYes": "Ya, sudah ada angka",
    "onboarding.budgetNo": "Belum — minta estimasi riset",
    "onboarding.budgetLabel": "Budget total (Rp)",
    "onboarding.budgetPayer": "Budget ditanggung oleh",
    "onboarding.q5Title": "Adat & prosesi apa yang dipakai?",
    "onboarding.q5Desc": "Pilih adat utama — checklist prosesi otomatis dibuat.",
    "onboarding.mainAdat": "Adat utama",
    "onboarding.ceremonies": "Upacara yang direncanakan (pilih semua yang perlu)",
    "onboarding.q6Title": "Gaya pernikahan seperti apa?",
    "onboarding.q6Desc": "Pilih yang paling mendekati — bisa digabung nanti.",
    "onboarding.q7Title": "Pakai Wedding Organizer?",
    "onboarding.q7Desc": "WO cepat penuh 9–12 bulan sebelum peak season.",
    "onboarding.woYes": "Ya — WO full / day-of",
    "onboarding.woNo": "Tidak — keluarga / teman jadi PIC",
    "onboarding.seePlan": "Lihat preview",
    "onboarding.langSwitch": "Bahasa",
  },
};

function getInitialLang(): Lang {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("offstories-lang") as Lang | null;
    if (stored === "en" || stored === "id") return stored;
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith("id")) return "id";
    return nav.startsWith("en") ? "en" : "id";
  }
  return "id";
}

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  lang: "id",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getInitialLang());

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("offstories-lang", l);
      document.documentElement.lang = l;
      document.cookie = `offstories-lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {
      return;
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    const stored = getInitialLang();
    if (stored !== lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    const dict = dictionaries[lang];
    return (key: string) => dict[key] ?? dictionaries.en[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
