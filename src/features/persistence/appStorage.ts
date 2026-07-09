import type { AppPersistedState, Harbor } from "../../types";

const STORAGE_KEY = "labor-harbor-agent:v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadAppState(storage: StorageLike | undefined, fallbackHarbors: Harbor[]): AppPersistedState {
  if (!storage) {
    return createFallbackState(fallbackHarbors);
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return createFallbackState(fallbackHarbors);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppPersistedState>;
    if (!isPersistedState(parsed)) {
      return createFallbackState(fallbackHarbors);
    }

    return {
      ...parsed,
      recommendationLogs: parsed.recommendationLogs ?? [],
    };
  } catch {
    return createFallbackState(fallbackHarbors);
  }
}

export function saveAppState(storage: StorageLike | undefined, state: AppPersistedState) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAppState(storage: StorageLike | undefined) {
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

export function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function createFallbackState(fallbackHarbors: Harbor[]): AppPersistedState {
  return {
    schemaVersion: 1,
    harbors: fallbackHarbors,
    tickets: [],
    recommendationLogs: [],
  };
}

function isPersistedState(value: Partial<AppPersistedState>): value is AppPersistedState {
  return value.schemaVersion === 1 && Array.isArray(value.harbors) && Array.isArray(value.tickets);
}
