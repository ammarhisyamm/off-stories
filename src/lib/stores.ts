import {
  budgetItems as initialBudget,
  guests as initialGuests,
  milestones as initialMilestones,
  vendors as initialVendors,
  notes as initialNotes,
  event as initialEvent,
  type BudgetItem,
  type Guest,
  type Milestone,
  type Vendor,
  type Note,
} from "./mock-data";
import { getBrowserStorage } from "./browser-storage";

function createStore<T>(key: string, initial: T[]) {
  return {
    load: (): T[] => {
      if (typeof window === "undefined") return initial;
      try {
        const saved = getBrowserStorage("local").getItem(key);
        if (saved) return JSON.parse(saved) as T[];
      } catch {
        // ignore corrupt storage
      }
      return initial;
    },
    save: (items: T[]) => getBrowserStorage("local").setItem(key, JSON.stringify(items)),
  };
}

export const budgetStore = createStore<BudgetItem>("wedding_budget", initialBudget);
export const guestStore = createStore<Guest>("wedding_guests", initialGuests);
export const milestoneStore = createStore<Milestone>("wedding_milestones", initialMilestones);
export const vendorStore = createStore<Vendor>("wedding_vendors", initialVendors);
export const notesStore = createStore<Note>("wedding_notes", initialNotes);

type EventData = typeof initialEvent;

type Listener = () => void;
const listeners = new Set<Listener>();

export const eventStore = {
  load: (): EventData => {
    if (typeof window === "undefined") return initialEvent;
    try {
      const saved = getBrowserStorage("local").getItem("wedding_event");
      if (saved) return { ...initialEvent, ...(JSON.parse(saved) as Partial<EventData>) };
    } catch {
      // ignore corrupt storage
    }
    return initialEvent;
  },
  save: (data: EventData) => {
    getBrowserStorage("local").setItem("wedding_event", JSON.stringify(data));
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
