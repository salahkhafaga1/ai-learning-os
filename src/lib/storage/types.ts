import type { AppState } from "@/domain/types";

export type LoadWarningCode =
  | "malformed_backup"
  | "incompatible_version"
  | "storage_unavailable"
  | "remote_unavailable"
  | "write_failed";

export type LoadStatus = "fresh" | "loaded" | "recovered";

export interface LoadResult {
  status: LoadStatus;
  state: AppState;
  warning?: LoadWarningCode;
}

export type SaveResult = { ok: true } | { ok: false; code: LoadWarningCode };

export interface LearningRepository {
  readonly kind: "local" | "memory" | "supabase";
  load(): Promise<LoadResult>;
  save(state: AppState): Promise<SaveResult>;
  reset(): Promise<void>;
}
