import { describe, expect, it } from "vitest";
import {
  ACTIVITY_TYPES,
  ACTIVITY_LABEL_KEYS,
  CORRUPT_BACKUP_KEY,
  DAYS_PER_WEEK,
  RESOURCE_KINDS,
  RESOURCE_KIND_LABEL_KEYS,
  RESOURCE_STATUSES,
  RESOURCE_STATUS_LABEL_KEYS,
  ROADMAP_DEFAULT_START,
  ROADMAP_DEFAULT_TARGET_END,
  STORAGE_KEY,
  TASK_KINDS,
  TASK_KIND_LABEL_KEYS,
  TASK_STATUSES,
  TASK_STATUS_LABEL_KEYS,
  WEEK_COUNT,
} from "@/domain/constants";
import type { AppState } from "@/domain/types";

describe("roadmap constants", () => {
  it("defines the 37-week roadmap dimensions", () => {
    expect(WEEK_COUNT).toBe(37);
    expect(DAYS_PER_WEEK).toBe(7);
    expect(ROADMAP_DEFAULT_START).toBe("2026-10-20");
    expect(ROADMAP_DEFAULT_TARGET_END).toBe("2027-07-05");
  });

  it("defines versioned storage keys", () => {
    expect(STORAGE_KEY).toBe("ai-learning-os.state.v1");
    expect(CORRUPT_BACKUP_KEY).toBe("ai-learning-os.state.v1.corrupt");
  });
});

describe("enum value lists", () => {
  it("lists every task status", () => {
    expect(TASK_STATUSES).toEqual([
      "todo",
      "in_progress",
      "blocked",
      "done",
      "skipped",
    ]);
  });

  it("lists every task kind", () => {
    expect(TASK_KINDS).toEqual([
      "study",
      "exercise",
      "project",
      "deliverable",
      "review",
    ]);
  });

  it("lists every activity type", () => {
    expect(ACTIVITY_TYPES).toEqual([
      "reading",
      "coding",
      "debugging",
      "project",
      "review",
    ]);
  });

  it("lists every resource status and kind", () => {
    expect(RESOURCE_STATUSES).toEqual([
      "not_started",
      "in_progress",
      "completed",
    ]);
    expect(RESOURCE_KINDS).toEqual([
      "official_docs",
      "course",
      "tutorial",
      "article",
      "book",
      "video",
      "repo",
      "tool",
    ]);
  });
});

describe("label key maps", () => {
  it("maps every task status to a unique dictionary key", () => {
    const keys = TASK_STATUSES.map((s) => TASK_STATUS_LABEL_KEYS[s]);
    expect(new Set(keys).size).toBe(TASK_STATUSES.length);
    for (const key of keys) {
      expect(key).toMatch(/^status\./);
    }
  });

  it("maps every task kind to a unique dictionary key", () => {
    const keys = TASK_KINDS.map((k) => TASK_KIND_LABEL_KEYS[k]);
    expect(new Set(keys).size).toBe(TASK_KINDS.length);
    for (const key of keys) {
      expect(key).toMatch(/^kind\./);
    }
  });

  it("maps every activity type to a unique dictionary key", () => {
    const keys = ACTIVITY_TYPES.map((a) => ACTIVITY_LABEL_KEYS[a]);
    expect(new Set(keys).size).toBe(ACTIVITY_TYPES.length);
    for (const key of keys) {
      expect(key).toMatch(/^activity\./);
    }
  });

  it("maps every resource status and kind to dictionary keys", () => {
    for (const s of RESOURCE_STATUSES) {
      expect(RESOURCE_STATUS_LABEL_KEYS[s]).toMatch(/^resourceStatus\./);
    }
    for (const k of RESOURCE_KINDS) {
      expect(RESOURCE_KIND_LABEL_KEYS[k]).toMatch(/^resourceKind\./);
    }
  });
});

describe("AppState contract", () => {
  it("accepts a minimal valid state literal", () => {
    const minimalState: AppState = {
      schemaVersion: 1,
      taskStatus: {},
      weekNotes: {},
      weekBlockers: {},
      weekDateOverrides: {},
      reviews: {},
      sessions: [],
      skillAssessments: {},
      projects: [],
      resourceStatus: {},
      settings: {
        roadmapStart: ROADMAP_DEFAULT_START,
        roadmapTargetEnd: ROADMAP_DEFAULT_TARGET_END,
        theme: "dark",
        language: "ar",
      },
    };

    expect(minimalState.schemaVersion).toBe(1);
    expect(Object.keys(minimalState.taskStatus)).toHaveLength(0);
    expect(minimalState.settings.roadmapStart).toBe("2026-10-20");
  });
});
