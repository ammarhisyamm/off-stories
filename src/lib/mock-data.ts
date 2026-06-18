// Mock data for the Wedding Preparation Dashboard

export const event = {
  name: "Andra & Kirana",
  type: "Akad + Resepsi",
  date: "2026-10-17",
  location: "Bandung, ID",
  guestEstimate: 320,
  budget: 425000000,
};

export const daysUntil = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  category: string;
  due: string;
  priority: Priority;
  status: TaskStatus;
  assignee?: string;
}

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Konfirmasi floor plan dengan venue",
    category: "Venue",
    due: "2026-06-22",
    priority: "high",
    status: "in_progress",
    assignee: "Kirana",
  },
  {
    id: "t2",
    title: "Tasting menu catering — putaran kedua",
    category: "Catering",
    due: "2026-06-28",
    priority: "high",
    status: "todo",
    assignee: "Andra",
  },
  {
    id: "t3",
    title: "Fitting gaun pertama",
    category: "Attire",
    due: "2026-07-05",
    priority: "medium",
    status: "todo",
    assignee: "Kirana",
  },
  {
    id: "t4",
    title: "Finalisasi konsep moodboard dekorasi",
    category: "Dekorasi",
    due: "2026-06-19",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "t5",
    title: "Booking prewedding photoshoot",
    category: "Foto & Video",
    due: "2026-07-10",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t6",
    title: "Urus surat N1–N4 di kelurahan",
    category: "Legal",
    due: "2026-07-20",
    priority: "high",
    status: "todo",
    assignee: "Andra",
  },
  {
    id: "t7",
    title: "Desain undangan digital",
    category: "Invitation",
    due: "2026-07-01",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "t8",
    title: "Pilih souvenir tamu",
    category: "Souvenir",
    due: "2026-08-01",
    priority: "low",
    status: "todo",
  },
  {
    id: "t9",
    title: "Meeting MC & entertainment",
    category: "Entertainment",
    due: "2026-08-15",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t10",
    title: "Briefing keluarga inti",
    category: "Family",
    due: "2026-09-01",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t11",
    title: "Book MUA utama",
    category: "Attire",
    due: "2026-06-10",
    priority: "high",
    status: "done",
  },
  {
    id: "t12",
    title: "Tentukan venue akad",
    category: "Venue",
    due: "2026-05-20",
    priority: "high",
    status: "done",
  },
  {
    id: "t13",
    title: "Setor DP catering",
    category: "Catering",
    due: "2026-06-01",
    priority: "high",
    status: "done",
  },
  {
    id: "t14",
    title: "Estimasi guest list awal",
    category: "Guests",
    due: "2026-05-25",
    priority: "medium",
    status: "done",
  },
];

export interface BudgetItem {
  id: string;
  category: string;
  vendor?: string;
  amount: number;
  paid: number;
  committed: number;
  status: "paid" | "partial" | "due" | "planned";
  dueDate?: string;
}

export const budgetItems: BudgetItem[] = [
  {
    id: "b1",
    category: "Venue",
    vendor: "Padma Hall",
    amount: 95000000,
    paid: 30000000,
    committed: 95000000,
    status: "partial",
    dueDate: "2026-08-01",
  },
  {
    id: "b2",
    category: "Catering",
    vendor: "Mawar Catering",
    amount: 120000000,
    paid: 36000000,
    committed: 120000000,
    status: "partial",
    dueDate: "2026-09-15",
  },
  {
    id: "b3",
    category: "Dekorasi",
    vendor: "Studio Layang",
    amount: 65000000,
    paid: 0,
    committed: 65000000,
    status: "due",
    dueDate: "2026-07-01",
  },
  {
    id: "b4",
    category: "Foto & Video",
    vendor: "Antara Visual",
    amount: 48000000,
    paid: 14000000,
    committed: 48000000,
    status: "partial",
    dueDate: "2026-09-30",
  },
  {
    id: "b5",
    category: "Attire",
    vendor: "Atelier Sage",
    amount: 42000000,
    paid: 12000000,
    committed: 42000000,
    status: "partial",
    dueDate: "2026-09-01",
  },
  {
    id: "b6",
    category: "MUA",
    vendor: "Rara Beauty",
    amount: 18000000,
    paid: 18000000,
    committed: 18000000,
    status: "paid",
  },
  {
    id: "b7",
    category: "Entertainment",
    amount: 22000000,
    paid: 0,
    committed: 0,
    status: "planned",
  },
  { id: "b8", category: "Souvenir", amount: 15000000, paid: 0, committed: 0, status: "planned" },
];

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  packageName: string;
  quoted: number;
  final?: number;
  status: "researching" | "shortlisted" | "booked" | "cancelled";
}

export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "Padma Hall",
    category: "Venue",
    contact: "Bu Sari",
    phone: "+62 812-1100-2200",
    packageName: "Grand Ballroom",
    quoted: 110000000,
    final: 95000000,
    status: "booked",
  },
  {
    id: "v2",
    name: "Mawar Catering",
    category: "Catering",
    contact: "Pak Adi",
    phone: "+62 813-9988-1122",
    packageName: "Premium 350 pax",
    quoted: 130000000,
    final: 120000000,
    status: "booked",
  },
  {
    id: "v3",
    name: "Studio Layang",
    category: "Dekorasi",
    contact: "Lia",
    phone: "+62 811-2233-4455",
    packageName: "Soft Botanic",
    quoted: 70000000,
    final: 65000000,
    status: "booked",
  },
  {
    id: "v4",
    name: "Antara Visual",
    category: "Foto & Video",
    contact: "Dimas",
    phone: "+62 821-7766-5544",
    packageName: "Full Day + Same Day Edit",
    quoted: 52000000,
    final: 48000000,
    status: "booked",
  },
  {
    id: "v5",
    name: "Bloom & Co",
    category: "Dekorasi",
    contact: "Nina",
    phone: "+62 819-1112-3334",
    packageName: "Garden Concept",
    quoted: 78000000,
    status: "shortlisted",
  },
  {
    id: "v6",
    name: "Suara Senja",
    category: "Entertainment",
    contact: "Reza",
    phone: "+62 877-5566-7788",
    packageName: "Acoustic Trio + DJ",
    quoted: 22000000,
    status: "shortlisted",
  },
  {
    id: "v7",
    name: "Manis Manis",
    category: "Souvenir",
    contact: "Tasya",
    phone: "+62 856-9090-1010",
    packageName: "Artisan Candle x350",
    quoted: 15750000,
    status: "researching",
  },
];

export interface Guest {
  id: string;
  name: string;
  side: "Bride" | "Groom" | "Both";
  pax: number;
  invited: boolean;
  rsvp: "pending" | "yes" | "no" | "maybe";
}

export const guests: Guest[] = [
  { id: "g1", name: "Keluarga Rahardjo", side: "Bride", pax: 8, invited: true, rsvp: "yes" },
  { id: "g2", name: "Keluarga Wijaya", side: "Groom", pax: 12, invited: true, rsvp: "yes" },
  { id: "g3", name: "Tante Mira & family", side: "Bride", pax: 4, invited: true, rsvp: "pending" },
  { id: "g4", name: "Office — Andra", side: "Groom", pax: 18, invited: true, rsvp: "maybe" },
  { id: "g5", name: "Kuliah circle — Kirana", side: "Bride", pax: 14, invited: true, rsvp: "yes" },
  { id: "g6", name: "Tetangga RT 04", side: "Bride", pax: 22, invited: false, rsvp: "pending" },
  { id: "g7", name: "Komunitas lari", side: "Both", pax: 9, invited: true, rsvp: "no" },
  { id: "g8", name: "Sahabat SMA — Kirana", side: "Bride", pax: 10, invited: true, rsvp: "yes" },
];

export interface Milestone {
  id: string;
  title: string;
  date: string;
  kind: "venue" | "vendor" | "fitting" | "legal" | "payment" | "review";
  done?: boolean;
}

export const milestones: Milestone[] = [
  { id: "m1", title: "Tentukan venue akad", date: "2026-05-20", kind: "venue", done: true },
  { id: "m2", title: "DP catering", date: "2026-06-01", kind: "payment", done: true },
  { id: "m3", title: "Floor plan finalisasi", date: "2026-06-22", kind: "venue" },
  { id: "m4", title: "Fitting pertama", date: "2026-07-05", kind: "fitting" },
  { id: "m5", title: "Pelunasan dekorasi", date: "2026-08-01", kind: "payment" },
  { id: "m6", title: "Final guest count", date: "2026-09-01", kind: "review" },
  { id: "m7", title: "Rundown review", date: "2026-10-01", kind: "review" },
  { id: "m8", title: "Hari-H", date: "2026-10-17", kind: "review" },
];

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  date: string;
}

export const notes: Note[] = [
  {
    id: "n1",
    title: "Keputusan: konsep dekorasi",
    body: "Soft botanic dengan palet sage + champagne. Hindari floral berlebihan; fokus pada candle dan greenery rendah.",
    tag: "Decision",
    date: "2026-06-14",
  },
  {
    id: "n2",
    title: "Request Mama (Bride)",
    body: "Akad dimulai 08.30. Sediakan area khusus untuk sesepuh. Catering harus include menu khusus diabetes.",
    tag: "Family",
    date: "2026-06-10",
  },
  {
    id: "n3",
    title: "Meeting dengan venue",
    body: "Konfirmasi load-in jam 04.00. Genset cadangan disediakan venue. Parking valet add-on 4 juta.",
    tag: "Meeting",
    date: "2026-06-08",
  },
  {
    id: "n4",
    title: "Catatan untuk MUA",
    body: "Trial makeup terakhir 2 minggu sebelum hari-H. Bawa referensi soft glam neutral.",
    tag: "Vendor",
    date: "2026-06-05",
  },
];

export interface DocRef {
  id: string;
  title: string;
  kind: "Contract" | "Invoice" | "Moodboard" | "Reference" | "Rundown" | "Floor plan";
  vendor?: string;
  url: string;
  addedAt: string;
}

export const documents: DocRef[] = [
  {
    id: "d1",
    title: "Kontrak Padma Hall",
    kind: "Contract",
    vendor: "Padma Hall",
    url: "#",
    addedAt: "2026-05-22",
  },
  {
    id: "d2",
    title: "Invoice DP Catering",
    kind: "Invoice",
    vendor: "Mawar Catering",
    url: "#",
    addedAt: "2026-06-01",
  },
  { id: "d3", title: "Moodboard dekorasi", kind: "Moodboard", url: "#", addedAt: "2026-06-04" },
  {
    id: "d4",
    title: "Pinterest — table styling",
    kind: "Reference",
    url: "#",
    addedAt: "2026-06-06",
  },
  {
    id: "d5",
    title: "Floor plan v2",
    kind: "Floor plan",
    vendor: "Padma Hall",
    url: "#",
    addedAt: "2026-06-12",
  },
  { id: "d6", title: "Rundown draft akad", kind: "Rundown", url: "#", addedAt: "2026-06-14" },
];
