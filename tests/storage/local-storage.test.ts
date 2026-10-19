import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/data/seed";
import { CORRUPT_BACKUP_KEY, STORAGE_KEY } from "@/domain/constants";
import {
  createLocalStorageRepository,
  isStorageAvailable,
} from "@/lib/storage/local-storage";

function createFlakyStorage(
  backing: Storage,
  state: { failing: boolean },
): Storage {
  return {
    getItem: (key: string) => backing.getItem(key),
    setItem: (key: string, value: string) => {
      if (state.failing) {
        throw new DOMException("quota exceeded", "QuotaExceededError");
      }
      backing.setItem(key, value);
    },
    removeItem: (key: string) => backing.removeItem(key),
    clear: () => backing.clear(),
    key: (index: number) => backing.key(index),
    get length() {
      return backing.length;
    },
  } as unknown as Storage;
}

describe("createLocalStorageRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts fresh when storage is empty", async () => {
    const repo = createLocalStorageRepository(window.localStorage);
    expect(repo.kind).toBe("local");
    const result = await repo.load();
    expect(result.status).toBe("fresh");
    expect(result.state).toEqual(createSeedState());
  });

  it("roundtrips a saved state through a versioned envelope", async () => {
    const repo = createLocalStorageRepository(window.localStorage);
    const state = createSeedState();
    state.taskStatus["w1-t1"] = "done";
    state.weekNotes["1"] = "أسبوع التنسورات";
    expect(await repo.save(state)).toEqual({ ok: true });

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const envelope = JSON.parse(raw ?? "{}") as {
      version?: unknown;
      savedAt?: unknown;
      state?: unknown;
    };
    expect(envelope.version).toBe(1);
    expect(typeof envelope.savedAt).toBe("string");

    const result = await repo.load();
    expect(result.status).toBe("loaded");
    expect(result.state).toEqual(state);

    await repo.reset();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect((await repo.load()).status).toBe("fresh");
  });

  it("recovers from malformed JSON: backup preserved, original key cleared", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{oops");
    const repo = createLocalStorageRepository(window.localStorage);
    const result = await repo.load();
    expect(result.status).toBe("recovered");
    expect(result.warning).toBe("malformed_backup");
    expect(result.state).toEqual(createSeedState());
    expect(window.localStorage.getItem(CORRUPT_BACKUP_KEY)).toBe("{oops");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("recovers from hand-edited JSON with the wrong shape via the same path", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        savedAt: "2026-10-19T00:00:00.000Z",
        state: { hello: "world" },
      }),
    );
    const repo = createLocalStorageRepository(window.localStorage);
    const result = await repo.load();
    expect(result.status).toBe("recovered");
    expect(result.warning).toBe("malformed_backup");
    expect(result.state).toEqual(createSeedState());
    expect(window.localStorage.getItem(CORRUPT_BACKUP_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("flags a newer envelope version as incompatible_version", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        savedAt: "2026-10-19T00:00:00.000Z",
        state: createSeedState(),
      }),
    );
    const repo = createLocalStorageRepository(window.localStorage);
    const result = await repo.load();
    expect(result.status).toBe("recovered");
    expect(result.warning).toBe("incompatible_version");
    expect(result.state).toEqual(createSeedState());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns write_failed on quota errors and keeps serving the last good state", async () => {
    const flakyState = { failing: false };
    const flaky = createFlakyStorage(window.localStorage, flakyState);
    const repo = createLocalStorageRepository(flaky);

    const first = createSeedState();
    first.weekNotes["1"] = "الملاحظة الأولى";
    expect(await repo.save(first)).toEqual({ ok: true });

    flakyState.failing = true;
    const second = createSeedState();
    second.weekNotes["1"] = "الملاحظة الثانية";
    expect(await repo.save(second)).toEqual({ ok: false, code: "write_failed" });

    const result = await repo.load();
    expect(result.status).toBe("loaded");
    expect(result.state.weekNotes["1"]).toBe("الملاحظة الأولى");
  });
});

describe("isStorageAvailable", () => {
  it("returns true on a working localStorage", () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it("returns false when the localStorage getter throws", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("denied", "SecurityError");
      },
    });
    try {
      expect(isStorageAvailable()).toBe(false);
    } finally {
      if (original) {
        Object.defineProperty(window, "localStorage", original);
      } else {
        Reflect.deleteProperty(window, "localStorage");
      }
    }
  });
});
