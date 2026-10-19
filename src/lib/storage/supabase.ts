import { createClient } from "@supabase/supabase-js";
import { createSeedState } from "@/data/seed";
import { CORRUPT_BACKUP_KEY, STORAGE_KEY } from "@/domain/constants";
import type { AppState } from "@/domain/types";
import { resolveWindowStorage } from "./local-storage";
import { parseEnvelope } from "./schema";
import type {
  LearningRepository,
  LoadResult,
  LoadWarningCode,
  SaveResult,
} from "./types";

export const SUPABASE_TABLE = "learning_state";
export const SUPABASE_ROW_ID = "default";

export interface SupabaseConfig {
  url: string;
  key: string;
}

/** Reads the Supabase configuration from the environment; null disables remote mode. */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return null;
  }
  return { url, key };
}

/**
 * Minimal seam over the remote row. Kept injectable so the repository adapter
 * can be unit-tested without the network (or the SDK).
 */
export interface RemoteEnvelopeStore {
  /** Returns the stored envelope, `null` when the row is absent; throws on any transport/auth error. */
  fetch(): Promise<{ raw: unknown } | null>;
  store(envelope: { version: 1; savedAt: string; state: AppState }): Promise<void>;
  clear(): Promise<void>;
}

export function createSupabaseEnvelopeStore({
  url,
  key,
}: SupabaseConfig): RemoteEnvelopeStore {
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async fetch() {
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .select("envelope")
        .eq("id", SUPABASE_ROW_ID)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return data ? { raw: data.envelope as unknown } : null;
    },

    async store(envelope) {
      const { error } = await client.from(SUPABASE_TABLE).upsert({
        id: SUPABASE_ROW_ID,
        envelope,
        saved_at: new Date().toISOString(),
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    async clear() {
      const { error } = await client
        .from(SUPABASE_TABLE)
        .delete()
        .eq("id", SUPABASE_ROW_ID);
      if (error) {
        throw new Error(error.message);
      }
    },
  };
}

function readMirror(storage: Storage | null): string | null {
  try {
    return storage ? storage.getItem(STORAGE_KEY) : null;
  } catch {
    return null;
  }
}

function parseStoredState(raw: string): AppState | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = parseEnvelope(json);
  return parsed.ok ? parsed.state : null;
}

export interface SupabaseRepositoryDeps {
  store: RemoteEnvelopeStore;
  /** Local mirror; `undefined` resolves the browser's localStorage, `null` disables the mirror. */
  storage?: Storage | null;
}

/**
 * Supabase-backed repository. The cloud row is the source of truth, with the
 * previous localStorage key kept as a best-effort offline mirror:
 *
 * - load: cloud row missing → migrate the local mirror up; cloud unreachable →
 *   serve the mirror with a `remote_unavailable` warning; malformed cloud data →
 *   preserve the raw payload and recover like the local adapter does.
 * - save: mirror first (never lose data to an outage), then upload.
 * - reset: clear the mirror and the cloud row (a later save recreates the row).
 */
export function createSupabaseRepository({
  store,
  storage,
}: SupabaseRepositoryDeps): LearningRepository {
  const mirror = storage === undefined ? resolveWindowStorage() : storage;

  const buildEnvelope = (state: AppState) => ({
    version: 1 as const,
    savedAt: new Date().toISOString(),
    state,
  });

  return {
    kind: "supabase",

    async load(): Promise<LoadResult> {
      let remote: { raw: unknown } | null;
      try {
        remote = await store.fetch();
      } catch {
        const mirrorRaw = readMirror(mirror);
        const mirrorState = mirrorRaw === null ? null : parseStoredState(mirrorRaw);
        return mirrorState
          ? {
              status: "loaded",
              state: mirrorState,
              warning: "remote_unavailable",
            }
          : {
              status: "fresh",
              state: createSeedState(),
              warning: "remote_unavailable",
            };
      }

      if (remote === null) {
        // First run against the cloud: carry over anything stored locally.
        const mirrorRaw = readMirror(mirror);
        const mirrorState = mirrorRaw === null ? null : parseStoredState(mirrorRaw);
        if (mirrorState) {
          try {
            await store.store(buildEnvelope(mirrorState));
          } catch {
            // Best effort; the provider saves again on the next state change.
          }
          return { status: "loaded", state: mirrorState };
        }
        return { status: "fresh", state: createSeedState() };
      }

      const parsed = parseEnvelope(remote.raw);
      if (!parsed.ok) {
        try {
          mirror?.setItem(CORRUPT_BACKUP_KEY, JSON.stringify(remote.raw));
        } catch {
          // Preserving the raw payload is best effort.
        }
        const code: LoadWarningCode =
          parsed.code === "unsupported_version"
            ? "incompatible_version"
            : "malformed_backup";
        return { status: "recovered", state: createSeedState(), warning: code };
      }

      return { status: "loaded", state: parsed.state };
    },

    async save(state: AppState): Promise<SaveResult> {
      const envelope = buildEnvelope(state);
      try {
        mirror?.setItem(STORAGE_KEY, JSON.stringify(envelope));
      } catch {
        // Mirroring is best effort; the cloud upload below still runs.
      }
      try {
        await store.store(envelope);
        return { ok: true };
      } catch {
        return { ok: false, code: "write_failed" };
      }
    },

    async reset(): Promise<void> {
      try {
        mirror?.removeItem(STORAGE_KEY);
      } catch {
        // Best effort.
      }
      try {
        await store.clear();
      } catch {
        // The next successful save overwrites the row anyway.
      }
    },
  };
}
