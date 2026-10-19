import { describe, expect, it } from "vitest";
import { createSeedState } from "@/data/seed";
import { parseEnvelope } from "@/lib/storage/schema";

function validEnvelope() {
  return {
    version: 1,
    savedAt: "2026-10-19T10:00:00.000Z",
    state: createSeedState(),
  };
}

function validSession() {
  return {
    id: "s1",
    date: "2026-10-20",
    topic: "أساسيات التنسورات",
    minutes: 45,
    activity: "reading",
    learned: "تعلّمت قواعد الـ broadcasting",
    implemented: "تنفيذ تمارين",
    questions: "",
    createdAt: "2026-10-20T10:00:00.000Z",
  };
}

describe("parseEnvelope", () => {
  it("accepts a valid envelope and returns the seed state", () => {
    const result = parseEnvelope(validEnvelope());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state).toEqual(createSeedState());
    }
  });

  it("rejects a state missing settings as invalid_shape", () => {
    const env = validEnvelope();
    const brokenState = {
      schemaVersion: env.state.schemaVersion,
      taskStatus: env.state.taskStatus,
      weekNotes: env.state.weekNotes,
      weekBlockers: env.state.weekBlockers,
      weekDateOverrides: env.state.weekDateOverrides,
      reviews: env.state.reviews,
      sessions: env.state.sessions,
      skillAssessments: env.state.skillAssessments,
      projects: env.state.projects,
      resourceStatus: env.state.resourceStatus,
    };
    expect(parseEnvelope({ ...env, state: brokenState })).toEqual({
      ok: false,
      code: "invalid_shape",
    });
  });

  it("reports unsupported_version for numeric versions other than 1", () => {
    expect(parseEnvelope({ ...validEnvelope(), version: 0 })).toEqual({
      ok: false,
      code: "unsupported_version",
    });
    expect(parseEnvelope({ ...validEnvelope(), version: 2 })).toEqual({
      ok: false,
      code: "unsupported_version",
    });
  });

  it("rejects invalid session minutes: negative, zero, string, and too large", () => {
    for (const minutes of [-5, 0, "60", 1441]) {
      const env = validEnvelope();
      const payload = {
        ...env,
        state: {
          ...env.state,
          sessions: [{ ...validSession(), minutes }],
        },
      };
      expect(parseEnvelope(payload), String(minutes)).toEqual({
        ok: false,
        code: "invalid_shape",
      });
    }
    const good = validEnvelope();
    const okPayload = {
      ...good,
      state: { ...good.state, sessions: [validSession()] },
    };
    const result = parseEnvelope(okPayload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.sessions[0]?.minutes).toBe(45);
    }
  });

  it("strips unknown extra keys instead of rejecting", () => {
    const env = validEnvelope();
    const payload = {
      ...env,
      extraTopLevel: true,
      state: { ...env.state, extraneous: { deep: 1 } },
    };
    const result = parseEnvelope(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state).toEqual(createSeedState());
      expect("extraneous" in result.state).toBe(false);
    }
  });

  it("rejects unknown task status values", () => {
    const env = validEnvelope();
    const payload = {
      ...env,
      state: { ...env.state, taskStatus: { "w1-t1": "nearly-done" } },
    };
    expect(parseEnvelope(payload)).toEqual({
      ok: false,
      code: "invalid_shape",
    });
  });

  it("enforces ISO dates, rating bounds, and review shape", () => {
    const env = validEnvelope();
    const badDate = {
      ...env,
      state: { ...env.state, weekDateOverrides: { "2": "11/05/2026" } },
    };
    expect(parseEnvelope(badDate)).toEqual({
      ok: false,
      code: "invalid_shape",
    });

    const badRating = {
      ...env,
      state: {
        ...env.state,
        reviews: {
          "1": {
            whatWentWell: "أسبوع جيد",
            whatWasHard: "",
            adjustments: "",
            rating: 7,
            updatedAt: "2026-10-20T00:00:00.000Z",
          },
        },
      },
    };
    expect(parseEnvelope(badRating)).toEqual({
      ok: false,
      code: "invalid_shape",
    });

    const goodRating = {
      ...env,
      state: {
        ...env.state,
        reviews: {
          "1": {
            whatWentWell: "أسبوع جيد",
            whatWasHard: "",
            adjustments: "",
            rating: null,
            updatedAt: "2026-10-20T00:00:00.000Z",
          },
        },
      },
    };
    const result = parseEnvelope(goodRating);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.reviews["1"]?.rating).toBeNull();
    }
  });

  it("accepts a huge-but-valid notes string", () => {
    const env = validEnvelope();
    const huge = "ملاحظة ".repeat(20_000);
    const payload = {
      ...env,
      state: { ...env.state, weekNotes: { "1": huge } },
    };
    const result = parseEnvelope(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.weekNotes["1"]).toBe(huge);
    }
  });
});
