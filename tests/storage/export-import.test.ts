import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/data/seed";
import { STORAGE_KEY } from "@/domain/constants";
import { buildExport, parseImport } from "@/lib/storage/export-import";

function sampleState() {
  const state = createSeedState();
  state.taskStatus["w1-t1"] = "done";
  state.taskStatus["w1-t2"] = "in_progress";
  state.sessions.push(
    {
      id: "s2",
      date: "2026-12-01",
      topic: "جلسة ديسمبر",
      minutes: 30,
      activity: "coding",
      learned: "",
      implemented: "شيء بسيط",
      questions: "",
      createdAt: "2026-12-01T09:00:00.000Z",
    },
    {
      id: "s1",
      date: "2026-10-20",
      topic: "جلسة أكتوبر",
      minutes: 60,
      activity: "reading",
      learned: "تعلّمت",
      implemented: "",
      questions: "",
      createdAt: "2026-10-20T09:00:00.000Z",
    },
  );
  state.skillAssessments["python-engineering"] = {
    level: 3,
    evidence: "مراجعة كود مقبولة",
    notes: "",
    nextGoal: "",
    updatedAt: "2026-10-21T00:00:00.000Z",
  };
  state.skillAssessments["sql-databases"] = {
    level: 1,
    evidence: "",
    notes: "بداية الاستكشاف",
    nextGoal: "",
    updatedAt: "2026-10-21T00:00:00.000Z",
  };
  return state;
}

describe("buildExport", () => {
  it("produces a pretty-printed, app-tagged backup with a dated file name", () => {
    const { json, fileName } = buildExport(createSeedState());
    expect(fileName).toMatch(/^ai-learning-os-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(json).toContain("\n  ");
    const parsed = JSON.parse(json) as {
      app?: unknown;
      version?: unknown;
      exportedAt?: unknown;
    };
    expect(parsed.app).toBe("ai-learning-os");
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe("string");
  });
});

describe("parseImport", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("roundtrips buildExport output to a deep-equal state", () => {
    const state = sampleState();
    const { json } = buildExport(state);
    const result = parseImport(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state).toEqual(state);
    }
  });

  it("computes the import summary before any write", () => {
    const state = sampleState();
    const { json } = buildExport(state);
    const result = parseImport(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.tasksWithStatus).toBe(
        Object.keys(state.taskStatus).length,
      );
      expect(result.summary.sessions).toBe(2);
      expect(result.summary.sessionDateRange).toBe(
        "2026-10-20 → 2026-12-01",
      );
      expect(result.summary.skillsAssessed).toBe(2);
    }
  });

  it("reports a null date range when there are no sessions", () => {
    const { json } = buildExport(createSeedState());
    const result = parseImport(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.sessions).toBe(0);
      expect(result.summary.sessionDateRange).toBeNull();
    }
  });

  it("rejects broken JSON as invalid_json", () => {
    expect(parseImport("{oops")).toEqual({ ok: false, code: "invalid_json" });
  });

  it("rejects files that are not our backups", () => {
    expect(parseImport("{}")).toEqual({ ok: false, code: "not_our_app" });
    expect(
      parseImport(JSON.stringify({ app: "other-app", version: 1 })),
    ).toEqual({ ok: false, code: "not_our_app" });
  });

  it("reports unsupported_version for newer backup versions", () => {
    const payload = {
      app: "ai-learning-os",
      version: 2,
      exportedAt: "2026-10-19T00:00:00.000Z",
      state: createSeedState(),
    };
    expect(parseImport(JSON.stringify(payload))).toEqual({
      ok: false,
      code: "unsupported_version",
    });
  });

  it("rejects our app marker with a broken state shape", () => {
    const payload = {
      app: "ai-learning-os",
      version: 1,
      exportedAt: "2026-10-19T00:00:00.000Z",
      state: { hello: "world" },
    };
    expect(parseImport(JSON.stringify(payload))).toEqual({
      ok: false,
      code: "invalid_shape",
    });
  });

  it("never mutates storage while parsing", () => {
    window.localStorage.setItem(STORAGE_KEY, "sentinel");
    const { json } = buildExport(sampleState());
    parseImport(json);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("sentinel");
    expect(window.localStorage.length).toBe(1);
  });
});
