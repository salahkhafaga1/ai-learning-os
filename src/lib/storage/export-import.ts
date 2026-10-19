import type { AppState } from "@/domain/types";
import { stateSchema } from "./schema";

export interface ImportSummary {
  tasksWithStatus: number;
  sessions: number;
  sessionDateRange: string | null;
  skillsAssessed: number;
}

export type ParseImportResult =
  | { ok: true; state: AppState; summary: ImportSummary }
  | {
      ok: false;
      code: "invalid_json" | "not_our_app" | "invalid_shape" | "unsupported_version";
    };

const APP_MARKER = "ai-learning-os";

export function buildExport(state: AppState): { json: string; fileName: string } {
  const now = new Date();
  const payload = {
    app: APP_MARKER,
    version: 1,
    exportedAt: now.toISOString(),
    state,
  };
  return {
    json: JSON.stringify(payload, null, 2),
    fileName: `ai-learning-os-backup-${now.toISOString().slice(0, 10)}.json`,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function summarize(state: AppState): ImportSummary {
  const tasksWithStatus = Object.keys(state.taskStatus).length;

  let sessionDateRange: string | null = null;
  if (state.sessions.length > 0) {
    const dates = state.sessions.map((session) => session.date).sort();
    sessionDateRange = `${dates[0]} → ${dates[dates.length - 1]}`;
  }

  const skillsAssessed = Object.values(state.skillAssessments).filter(
    (assessment) =>
      assessment.level > 0 || assessment.evidence.trim().length > 0,
  ).length;

  return {
    tasksWithStatus,
    sessions: state.sessions.length,
    sessionDateRange,
    skillsAssessed,
  };
}

export function parseImport(text: string): ParseImportResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, code: "invalid_json" };
  }

  if (!isRecord(json) || json.app !== APP_MARKER) {
    return { ok: false, code: "not_our_app" };
  }

  if (typeof json.version === "number" && json.version !== 1) {
    return { ok: false, code: "unsupported_version" };
  }

  const parsed = stateSchema.safeParse(json.state);
  if (!parsed.success) {
    return { ok: false, code: "invalid_shape" };
  }

  const state: AppState = parsed.data;
  return { ok: true, state, summary: summarize(state) };
}
