import { createSeedState } from "@/data/seed";
import type { AppState } from "@/domain/types";
import type { LearningRepository, LoadResult, SaveResult } from "./types";

export function createMemoryRepository(): LearningRepository {
  let stored: AppState | null = null;

  return {
    kind: "memory",

    load(): LoadResult {
      if (stored === null) {
        return { status: "fresh", state: createSeedState() };
      }
      return { status: "loaded", state: structuredClone(stored) };
    },

    save(state: AppState): SaveResult {
      stored = structuredClone(state);
      return { ok: true };
    },

    reset(): void {
      stored = null;
    },
  };
}
