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
  link?: string;
}

export interface RundownItem {
  id: string;
  time: string;
  title: string;
  location?: string;
  pic?: string;
  notes?: string;
  status: "planned" | "done";
}

export interface BudgetItem {
  id: string;
  category: string;
  vendor?: string;
  amount: number;
  paid: number;
  committed: number;
  status: "paid" | "partial" | "due" | "planned";
  dueDate?: string;
  payer?: Payer;
  payments?: BudgetPayment[];
}

export interface BudgetPayment {
  id: string;
  amount: number;
  date: string;
  payer?: Payer;
  note?: string;
}

export type Payer = "couple" | "bride_family" | "groom_family" | "shared" | "other";

export type SeserahanStatus = "to_buy" | "bought" | "wrapped" | "ready";

export interface SeserahanItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedCost: number;
  actualCost: number;
  status: SeserahanStatus;
  payer?: Payer;
  assignedTo?: string;
  link?: string;
  notes?: string;
}

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

export interface Guest {
  id: string;
  name: string;
  side: "Bride" | "Groom" | "Both";
  pax: number;
  invited: boolean;
  rsvp: "pending" | "yes" | "no" | "maybe";
  phone?: string;
  email?: string;
  table?: string;
  dietaryNotes?: string;
  checkedIn?: boolean;
  gift?: GuestGift | null;
}

export interface GuestGift {
  status: "received" | "thanked" | "estimated";
  amount: number;
  note?: string;
}

export interface CommandContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  type: "vendor" | "family" | "emergency";
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  kind: "venue" | "vendor" | "fitting" | "legal" | "payment" | "review";
  done?: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  date: string;
}

export interface DocRef {
  id: string;
  title: string;
  kind: "Contract" | "Invoice" | "Moodboard" | "Reference" | "Rundown" | "Floor plan";
  vendor?: string;
  url: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  addedAt: string;
}

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

export const parseIDRInput = (value: string | number | null | undefined) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

export const formatIDRInput = (value: string | number | null | undefined) => {
  const amount = parseIDRInput(value);
  return amount ? new Intl.NumberFormat("id-ID").format(amount) : "";
};

export const taskCategories = [
  "Venue",
  "Catering",
  "Attire",
  "Dekorasi",
  "Foto & Video",
  "Legal",
  "Invitation",
  "Souvenir",
  "Entertainment",
  "Family",
  "Guests",
];
