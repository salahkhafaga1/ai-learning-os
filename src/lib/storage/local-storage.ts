import { createSeedState } from "@/data/seed";
import { CORRUPT_BACKUP_KEY, STORAGE_KEY } from "@/domain/constants";
import type { AppState } from "@/domain/types";
import { parseEnvelope } from "./schema";
import type {
  LearningRepository,
  LoadResult,
  LoadWarningCode,
  SaveResult,
} from "./types";

export function resolveWindowStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  const storage = resolveWindowStorage();
  if (!storage) {
    return false;
  }
  const probeKey = "__ai_learning_os_storage_probe__";
  try {
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

function recover(
  storage: Storage,
  raw: string,
  code: LoadWarningCode,
): LoadResult {
  try {
    storage.setItem(CORRUPT_BACKUP_KEY, raw);
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Best effort: the fresh state is still returned even if backup fails.
  }
  return { status: "recovered", state: createSeedState(), warning: code };
}

export function createLocalStorageRepository(
  storage?: Storage,
): LearningRepository {
  const target = storage ?? resolveWindowStorage();

  return {
    kind: "local",

    async load(): Promise<LoadResult> {
      if (!target) {
        return {
          status: "fresh",
          state: createSeedState(),
          warning: "storage_unavailable",
        };
      }

      let raw: string | null;
      try {
        raw = target.getItem(STORAGE_KEY);
      } catch {
        return {
          status: "fresh",
          state: createSeedState(),
          warning: "storage_unavailable",
        };
      }

      if (raw === null) {
        return { status: "fresh", state: createSeedState() };
      }

      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        return recover(target, raw, "malformed_backup");
      }

      const parsed = parseEnvelope(json);
      if (!parsed.ok) {
        const code: LoadWarningCode =
          parsed.code === "unsupported_version"
            ? "incompatible_version"
            : "malformed_backup";
        return recover(target, raw, code);
      }

      return { status: "loaded", state: parsed.state };
    },

    async save(state: AppState): Promise<SaveResult> {
      if (!target) {
        return { ok: false, code: "storage_unavailable" };
      }
      const envelope = {
        version: 1,
        savedAt: new Date().toISOString(),
        state,
      };
      try {
        target.setItem(STORAGE_KEY, JSON.stringify(envelope));
        return { ok: true };
      } catch {
        return { ok: false, code: "write_failed" };
      }
    },

    async reset(): Promise<void> {
      if (!target) {
        return;
      }
      try {
        target.removeItem(STORAGE_KEY);
      } catch {
        // Nothing sensible to do if removal fails; next save overwrites.
      }
    },
  };
}
