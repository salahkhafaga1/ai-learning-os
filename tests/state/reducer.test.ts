import { describe, expect, it } from "vitest";
import { createSeedState, defaultAssessment } from "@/data/seed";
import type {
  Project,
  SkillAssessment,
  StudySession,
  WeekReview,
} from "@/domain/types";
import type { Action } from "@/lib/state/actions";
import { reducer } from "@/lib/state/reducer";

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  Object.freeze(value);
  for (const key of Object.keys(value)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}

function sampleSession(): StudySession {
  return {
    id: "sess-1",
    date: "2026-10-25",
    topic: "تدريب على الحلقات",
    minutes: 50,
    activity: "coding",
    learned: "",
    implemented: "حلقة تدريب كاملة",
    questions: "",
    createdAt: "2026-10-25T12:00:00.000Z",
  };
}

function sampleProject(): Project {
  return {
    id: "p-new",
    name: "مشروع جديد",
    tagline: "",
    businessProblem: "",
    targetUsers: "",
    technologies: [],
    status: "planned",
    milestones: [],
    tasks: [],
    evaluation: "",
    limitations: [],
    deliverables: [],
    isSeedExample: false,
  };
}

function sampleReview(): WeekReview {
  return {
    whatWentWell: "التزام جيد",
    whatWasHard: "",
    adjustments: "",
    rating: 4,
    updatedAt: "2026-10-26T00:00:00.000Z",
  };
}

function assessmentWithLevel(level: number): SkillAssessment {
  return { ...defaultAssessment(), level: level as SkillAssessment["level"] };
}

describe("reducer", () => {
  it("sets task status and ignores unknown task ids", () => {
    const state = createSeedState();
    const next = reducer(state, {
      type: "task/setStatus",
      taskId: "w1-t1",
      status: "done",
    });
    expect(next).not.toBe(state);
    expect(next.taskStatus["w1-t1"]).toBe("done");
    expect(
      reducer(state, {
        type: "task/setStatus",
        taskId: "nope",
        status: "done",
      }),
    ).toBe(state);
  });

  it("sets week notes and blockers under string keys", () => {
    const state = createSeedState();
    const withNote = reducer(state, {
      type: "week/setNote",
      weekNumber: 1,
      text: "ملاحظة الأسبوع",
    });
    expect(withNote.weekNotes["1"]).toBe("ملاحظة الأسبوع");
    const withBlocker = reducer(withNote, {
      type: "week/setBlocker",
      weekNumber: 2,
      text: "انتظار مورد",
    });
    expect(withBlocker.weekBlockers["2"]).toBe("انتظار مورد");
    expect(
      reducer(state, { type: "week/setNote", weekNumber: 99, text: "خارج" }),
    ).toBe(state);
  });

  it("sets and deletes date overrides", () => {
    const state = createSeedState();
    const withOverride = reducer(state, {
      type: "week/setDateOverride",
      weekNumber: 2,
      startISO: "2026-11-05",
    });
    expect(withOverride.weekDateOverrides["2"]).toBe("2026-11-05");
    const deleted = reducer(withOverride, {
      type: "week/setDateOverride",
      weekNumber: 2,
      startISO: null,
    });
    expect("2" in deleted.weekDateOverrides).toBe(false);
  });

  it("saves week reviews", () => {
    const state = createSeedState();
    const next = reducer(state, {
      type: "week/saveReview",
      weekNumber: 3,
      review: sampleReview(),
    });
    expect(next.reviews["3"]).toEqual(sampleReview());
  });

  it("adds, updates, and deletes sessions with id guards", () => {
    const state = createSeedState();
    const added = reducer(state, { type: "session/add", session: sampleSession() });
    expect(added.sessions).toHaveLength(1);
    const updated = reducer(added, {
      type: "session/update",
      session: { ...sampleSession(), minutes: 90 },
    });
    expect(updated.sessions[0]?.minutes).toBe(90);
    expect(
      reducer(added, {
        type: "session/update",
        session: { ...sampleSession(), id: "missing" },
      }),
    ).toBe(added);
    const deleted = reducer(updated, { type: "session/delete", id: "sess-1" });
    expect(deleted.sessions).toHaveLength(0);
    expect(reducer(added, { type: "session/delete", id: "missing" })).toBe(
      added,
    );
  });

  it("enforces the mastery guard on skill assessments", () => {
    const state = createSeedState();
    const stored = reducer(state, {
      type: "skill/setAssessment",
      skillId: "python-engineering",
      assessment: {
        ...defaultAssessment(),
        level: 3,
        evidence: "مراجعة كود",
      },
    });
    expect(stored.skillAssessments["python-engineering"]?.level).toBe(3);

    const blankEvidenceLevel5 = reducer(state, {
      type: "skill/setAssessment",
      skillId: "python-engineering",
      assessment: { ...assessmentWithLevel(5), evidence: "   " },
    });
    expect(blankEvidenceLevel5).toBe(state);

    const evidenceLevel5 = reducer(state, {
      type: "skill/setAssessment",
      skillId: "python-engineering",
      assessment: { ...assessmentWithLevel(5), evidence: "أدلة ملموسة" },
    });
    expect(evidenceLevel5.skillAssessments["python-engineering"]?.level).toBe(5);

    expect(
      reducer(state, {
        type: "skill/setAssessment",
        skillId: "python-engineering",
        assessment: assessmentWithLevel(7),
      }),
    ).toBe(state);
    expect(
      reducer(state, {
        type: "skill/setAssessment",
        skillId: "python-engineering",
        assessment: assessmentWithLevel(2.5),
      }),
    ).toBe(state);
    expect(
      reducer(state, {
        type: "skill/setAssessment",
        skillId: "unknown-skill",
        assessment: assessmentWithLevel(2),
      }),
    ).toBe(state);
  });

  it("adds, updates, and deletes projects with id guards", () => {
    const state = createSeedState();
    const added = reducer(state, { type: "project/add", project: sampleProject() });
    expect(added.projects).toHaveLength(2);
    const renamed: Project = { ...sampleProject(), name: "اسم محدث" };
    const updated = reducer(added, { type: "project/update", project: renamed });
    expect(updated.projects[1]?.name).toBe("اسم محدث");
    expect(
      reducer(added, {
        type: "project/update",
        project: { ...sampleProject(), id: "missing" },
      }),
    ).toBe(added);
    const deleted = reducer(updated, {
      type: "project/delete",
      projectId: "p-new",
    });
    expect(deleted.projects).toHaveLength(1);
    expect(
      reducer(added, { type: "project/delete", projectId: "missing" }),
    ).toBe(added);
  });

  it("sets resource state and rejects unknown resource ids", () => {
    const state = createSeedState();
    const next = reducer(state, {
      type: "resource/setState",
      resourceId: "pytorch-basics",
      value: { status: "in_progress", notes: "بدأت", updatedAt: "" },
    });
    expect(next.resourceStatus["pytorch-basics"]?.status).toBe("in_progress");
    expect(
      reducer(state, {
        type: "resource/setState",
        resourceId: "missing",
        value: { status: "completed", notes: "", updatedAt: "" },
      }),
    ).toBe(state);
  });

  it("patches settings while preserving other keys", () => {
    const state = createSeedState();
    const next = reducer(state, {
      type: "settings/patch",
      patch: { theme: "light", roadmapStart: "2026-11-01" },
    });
    expect(next.settings.theme).toBe("light");
    expect(next.settings.roadmapStart).toBe("2026-11-01");
    expect(next.settings.language).toBe("ar");
    expect(next.settings.roadmapTargetEnd).toBe("2027-07-05");
  });

  it("resets to a fresh seed state", () => {
    const state = createSeedState();
    state.taskStatus["w1-t1"] = "done";
    state.sessions.push(sampleSession());
    const reset = reducer(state, { type: "data/reset" });
    expect(reset).toEqual(createSeedState());
    expect(reset.sessions).toHaveLength(0);
  });

  it("replaces everything on load and import", () => {
    const imported = createSeedState();
    imported.taskStatus["w3-t1"] = "blocked";
    imported.weekNotes["4"] = "مستورد";
    imported.settings.language = "en";
    const loaded = reducer(createSeedState(), { type: "data/load", state: imported });
    expect(loaded).toEqual(imported);
    const reimported = reducer(loaded, { type: "data/import", state: imported });
    expect(reimported).toEqual(imported);
  });

  it("never mutates its input: deep-frozen states survive full action sweeps", () => {
    const frozen = deepFreeze(createSeedState());
    const snapshot = structuredClone(createSeedState());

    const actions: Action[] = [
      { type: "task/setStatus", taskId: "w1-t1", status: "done" },
      { type: "week/setNote", weekNumber: 1, text: "ملاحظة" },
      { type: "week/setBlocker", weekNumber: 1, text: "عائق" },
      { type: "week/setDateOverride", weekNumber: 2, startISO: null },
      { type: "week/saveReview", weekNumber: 1, review: sampleReview() },
      { type: "session/add", session: sampleSession() },
      {
        type: "skill/setAssessment",
        skillId: "python-engineering",
        assessment: { ...defaultAssessment(), level: 2 },
      },
      { type: "project/add", project: sampleProject() },
      {
        type: "resource/setState",
        resourceId: "pytorch-basics",
        value: { status: "in_progress", notes: "", updatedAt: "" },
      },
      { type: "settings/patch", patch: { language: "en" } },
    ];

    let next = frozen;
    for (const action of actions) {
      next = reducer(next, action);
    }

    expect(frozen).toEqual(snapshot);
    expect(next).not.toEqual(snapshot);
  });
});
