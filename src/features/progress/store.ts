export interface ProgressEntry {
  currentStep: number;
  completed: boolean;
}

export interface ProgressData {
  [slug: string]: ProgressEntry;
}

export interface ProgressStore {
  get(slug: string): ProgressEntry;
  saveStep(slug: string, step: number): void;
  complete(slug: string): void;
  getAll(): ProgressData;
}

const STORAGE_KEY = "dotslashlearn_progress";

function defaultEntry(): ProgressEntry {
  return { currentStep: 0, completed: false };
}

function isProgressEntry(value: unknown): value is ProgressEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ProgressEntry).currentStep === "number" &&
    typeof (value as ProgressEntry).completed === "boolean"
  );
}

function read(): ProgressData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    // Validate each entry, discard corrupted ones
    const result: ProgressData = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isProgressEntry(value)) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function write(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // QuotaExceededError or other storage failure — silently ignore
  }
}

export const progressStore: ProgressStore = {
  get(slug) {
    return read()[slug] ?? defaultEntry();
  },

  saveStep(slug, step) {
    const data = read();
    const existing = data[slug] ?? defaultEntry();
    data[slug] = { ...existing, currentStep: step };
    write(data);
  },

  // Resets currentStep to 0 so re-opening a completed lesson starts from the beginning.
  // LessonViewer's restore logic skips restoration when `completed` is true.
  complete(slug) {
    const data = read();
    data[slug] = { currentStep: 0, completed: true };
    write(data);
  },

  getAll() {
    return read();
  },
};
