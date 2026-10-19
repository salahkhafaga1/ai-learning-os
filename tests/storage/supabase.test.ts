import { describe, expect, it, vi } from "vitest";
import { createSeedState } from "@/data/seed";
import { CORRUPT_BACKUP_KEY, STORAGE_KEY } from "@/domain/constants";
import type { AppState } from "@/domain/types";
import {
  createSupabaseRepository,
  type RemoteEnvelopeStore,
} from "@/lib/storage/supabase";

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
    key: (index: number) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  };
}

function envelopeJson(state: AppState = createSeedState()): string {
  return JSON.stringify({
    version: 1,
    savedAt: "2026-10-19T00:00:00.000Z",
    state,
  });
}

interface SetupOptions {
  /** Stored envelope payload; null/undefined means the row is absent. */
  remote?: unknown;
  remoteError?: boolean;
  mirror?: string;
  failStore?: boolean;
  failClear?: boolean;
}

function setup(options: SetupOptions = {}) {
  const mocks = {
    fetch: vi.fn<RemoteEnvelopeStore["fetch"]>(),
    store: vi.fn<RemoteEnvelopeStore["store"]>(),
    clear: vi.fn<RemoteEnvelopeStore["clear"]>(),
  };

  if (options.remoteError) {
    mocks.fetch.mockRejectedValue(new Error("offline"));
  } else {
    mocks.fetch.mockResolvedValue(
      options.remote === undefined || options.remote === null
        ? null
        : { raw: options.remote },
    );
  }

  mocks.store.mockImplementation(async () => {
    if (options.failStore) {
      throw new Error("upload failed");
    }
  });
  mocks.clear.mockImplementation(async () => {
    if (options.failClear) {
      throw new Error("delete failed");
    }
  });

  const storage = fakeStorage();
  if (options.mirror !== undefined) {
    storage.setItem(STORAGE_KEY, options.mirror);
  }

  const repo = createSupabaseRepository({ store: mocks, storage });
  return { repo, mocks, storage };
}

describe("createSupabaseRepository", () => {
  it("loads the remote envelope when the row exists", async () => {
    const remoteState = createSeedState();
    remoteState.weekNotes["1"] = "من السحابة";
    const { repo, mocks, storage } = setup({
      remote: {
        version: 1,
        savedAt: "2026-10-19T00:00:00.000Z",
        state: remoteState,
      },
    });

    const result = await repo.load();
    expect(repo.kind).toBe("supabase");
    expect(result.status).toBe("loaded");
    expect(result.warning).toBeUndefined();
    expect(result.state.weekNotes["1"]).toBe("من السحابة");
    expect(mocks.store).not.toHaveBeenCalled();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("migrates the local mirror to the cloud when the row is empty", async () => {
    const localState = createSeedState();
    localState.weekNotes["1"] = "ملاحظة محلية";
    const { repo, mocks, storage } = setup({
      remote: null,
      mirror: envelopeJson(localState),
    });

    const result = await repo.load();
    expect(result.status).toBe("loaded");
    expect(result.state.weekNotes["1"]).toBe("ملاحظة محلية");
    expect(mocks.store).toHaveBeenCalledTimes(1);
    const uploaded = mocks.store.mock.calls[0]?.[0];
    expect(uploaded?.state.weekNotes["1"]).toBe("ملاحظة محلية");
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("starts fresh when the row is empty and there is no mirror", async () => {
    const { repo, mocks } = setup({ remote: null });
    const result = await repo.load();
    expect(result.status).toBe("fresh");
    expect(result.warning).toBeUndefined();
    expect(result.state).toEqual(createSeedState());
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it("recovers from a malformed remote payload and preserves the raw copy", async () => {
    const raw = { version: 1, savedAt: "x", state: { hello: "world" } };
    const { repo, storage } = setup({ remote: raw });

    const result = await repo.load();
    expect(result.status).toBe("recovered");
    expect(result.warning).toBe("malformed_backup");
    expect(result.state).toEqual(createSeedState());
    expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBe(JSON.stringify(raw));
  });

  it("flags a newer remote envelope version as incompatible", async () => {
    const { repo } = setup({
      remote: { version: 2, savedAt: "x", state: createSeedState() },
    });
    const result = await repo.load();
    expect(result.status).toBe("recovered");
    expect(result.warning).toBe("incompatible_version");
  });

  it("falls back to the mirror when the cloud is unreachable", async () => {
    const localState = createSeedState();
    localState.weekNotes["1"] = "نسخة محلية";
    const { repo } = setup({
      remoteError: true,
      mirror: envelopeJson(localState),
    });

    const result = await repo.load();
    expect(result.status).toBe("loaded");
    expect(result.warning).toBe("remote_unavailable");
    expect(result.state.weekNotes["1"]).toBe("نسخة محلية");
  });

  it("runs fresh with a warning when the cloud is unreachable and no mirror exists", async () => {
    const { repo } = setup({ remoteError: true });
    const result = await repo.load();
    expect(result.status).toBe("fresh");
    expect(result.warning).toBe("remote_unavailable");
    expect(result.state).toEqual(createSeedState());
  });

  it("ignores a malformed mirror when the cloud is unreachable", async () => {
    const { repo } = setup({ remoteError: true, mirror: "{oops" });
    const result = await repo.load();
    expect(result.status).toBe("fresh");
    expect(result.warning).toBe("remote_unavailable");
  });

  it("save mirrors locally first, then uploads", async () => {
    const { repo, mocks, storage } = setup({ remote: null });
    const state = createSeedState();
    state.taskStatus["w1-t1"] = "done";

    expect(await repo.save(state)).toEqual({ ok: true });

    const raw = storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const envelope = JSON.parse(raw ?? "{}") as {
      version?: unknown;
      savedAt?: unknown;
      state?: unknown;
    };
    expect(envelope.version).toBe(1);
    expect(typeof envelope.savedAt).toBe("string");
    expect(mocks.store).toHaveBeenCalledTimes(1);
    expect(mocks.store.mock.calls[0]?.[0].state.taskStatus["w1-t1"]).toBe(
      "done",
    );
  });

  it("keeps the local mirror even when the upload fails", async () => {
    const { repo, storage } = setup({ remote: null, failStore: true });
    const state = createSeedState();
    state.taskStatus["w1-t1"] = "done";

    expect(await repo.save(state)).toEqual({ ok: false, code: "write_failed" });
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("reset clears the mirror and the cloud row", async () => {
    const { repo, mocks, storage } = setup({
      remote: null,
      mirror: envelopeJson(),
    });

    await repo.reset();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(mocks.clear).toHaveBeenCalledTimes(1);
  });

  it("reset tolerates a failing cloud delete", async () => {
    const { repo, storage } = setup({
      remote: null,
      mirror: envelopeJson(),
      failClear: true,
    });

    await expect(repo.reset()).resolves.toBeUndefined();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});
