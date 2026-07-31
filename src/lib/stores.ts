import {
  budgetItems as initialBudget,
  guests as initialGuests,
  milestones as initialMilestones,
  vendors as initialVendors,
  notes as initialNotes,
  type BudgetItem,
  type Guest,
  type Milestone,
  type Vendor,
  type Note,
} from "./mock-data";

function createStore<T>(key: string, initial: T[]) {
  return {
    load: (): T[] => {
      if (typeof window === "undefined") return initial;
      try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved) as T[];
      } catch {
        // ignore corrupt storage
      }
      return initial;
    },
    save: (items: T[]) => localStorage.setItem(key, JSON.stringify(items)),
  };
}

export const budgetStore = createStore<BudgetItem>("wedding_budget", initialBudget);
export const guestStore = createStore<Guest>("wedding_guests", initialGuests);
export const milestoneStore = createStore<Milestone>("wedding_milestones", initialMilestones);
export const vendorStore = createStore<Vendor>("wedding_vendors", initialVendors);
export const notesStore = createStore<Note>("wedding_notes", initialNotes);
