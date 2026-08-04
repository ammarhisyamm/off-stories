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
  payments?: BudgetPayment[];
}

export interface BudgetPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
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
