import { tasks as initialTasks, type Task } from "./mock-data";
import { getBrowserStorage } from "./browser-storage";

const STORAGE_KEY = "wedding_tasks";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return initialTasks;
  try {
    const saved = getBrowserStorage("local").getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Task[];
  } catch {
    // ignore corrupt storage
  }
  return initialTasks;
}

export function saveTasks(newTasks: Task[]) {
  getBrowserStorage("local").setItem(STORAGE_KEY, JSON.stringify(newTasks));
}

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
