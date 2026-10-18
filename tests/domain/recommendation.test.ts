import { describe, expect, it } from "vitest";
import { nextRecommendedTask } from "@/domain/recommendation";
import type {
  Phase,
  Roadmap,
  Settings,
  Task,
  TaskStatus,
  Week,
} from "@/domain/types";

const settings: Settings = {
  roadmapStart: "2026-10-20",
  roadmapTargetEnd: "2027-07-05",
  theme: "dark",
  language: "ar",
};

function makeTask(id: string, weekNumber: number): Task {
  return {
    id,
    weekNumber,
    title: `مهمة ${id}`,
    kind: "study",
    effortMinutes: 60,
    resourceIds: [],
  };
}

function makeWeek(number: number, phaseId: string, tasks: Task[]): Week {
  return {
    number,
    phaseId,
    title: `الأسبوع ${number}`,
    objectives: [],
    topics: [],
    exercises: [],
    deliverables: [],
    masteryCriteria: [],
    tasks,
    resourceIds: [],
  };
}

function makePhase(id: string, number: number, weekNumbers: number[]): Phase {
  return {
    id,
    number,
    title: `مرحلة ${number}`,
    shortTitle: `P${number}`,
    description: "",
    objectives: [],
    weekNumbers,
  };
}

const week1 = makeWeek(1, "p1", [makeTask("t1", 1), makeTask("t2", 1)]);
const week2 = makeWeek(2, "p1", [makeTask("t3", 2), makeTask("t4", 2)]);
const week3 = makeWeek(3, "p2", [makeTask("t5", 3), makeTask("t6", 3)]);
const roadmap: Roadmap = {
  phases: [makePhase("p1", 1, [1, 2]), makePhase("p2", 2, [3])],
  weeks: [week1, week2, week3],
};

describe("nextRecommendedTask", () => {
  it("recommends the first task of week 1 before the roadmap starts", () => {
    const result = nextRecommendedTask(roadmap, {}, settings, {}, "2026-10-19");
    expect(result?.task.id).toBe("t1");
    expect(result?.week.number).toBe(1);
    expect(result?.phase.id).toBe("p1");
  });

  it("recommends the first not-done task in the current week (authored order)", () => {
    const status: Record<string, TaskStatus> = { t1: "done" };
    const result = nextRecommendedTask(
      roadmap,
      status,
      settings,
      {},
      "2026-10-23",
    );
    expect(result?.task.id).toBe("t2");
    expect(result?.week.number).toBe(1);
  });

  it("keeps recommending blocked tasks (blocker must stay visible)", () => {
    const status: Record<string, TaskStatus> = { t1: "done", t2: "blocked" };
    const result = nextRecommendedTask(
      roadmap,
      status,
      settings,
      {},
      "2026-10-23",
    );
    expect(result?.task.id).toBe("t2");
  });

  it("skips skipped tasks and moves to the next week when the current one is finished", () => {
    const status: Record<string, TaskStatus> = { t1: "skipped", t2: "done" };
    const result = nextRecommendedTask(
      roadmap,
      status,
      settings,
      {},
      "2026-10-23",
    );
    expect(result?.task.id).toBe("t3");
    expect(result?.week.number).toBe(2);
  });

  it("returns null when every task is done or skipped", () => {
    const status: Record<string, TaskStatus> = {
      t1: "done",
      t2: "done",
      t3: "done",
      t4: "done",
      t5: "done",
      t6: "done",
    };
    expect(
      nextRecommendedTask(roadmap, status, settings, {}, "2026-10-23"),
    ).toBeNull();
  });

  it("returns null after the target end date", () => {
    expect(
      nextRecommendedTask(roadmap, {}, settings, {}, "2027-07-06"),
    ).toBeNull();
  });

  it("follows an override that shifts the current week", () => {
    // 2026-10-27 is day 1 of week 2 by default…
    const withoutOverride = nextRecommendedTask(
      roadmap,
      {},
      settings,
      {},
      "2026-10-27",
    );
    expect(withoutOverride?.week.number).toBe(2);
    expect(withoutOverride?.task.id).toBe("t3");

    // …but an override that moves week 1 to 2026-10-27 keeps the focus on week 1.
    const withOverride = nextRecommendedTask(
      roadmap,
      {},
      settings,
      { "1": "2026-10-27" },
      "2026-10-27",
    );
    expect(withOverride?.week.number).toBe(1);
    expect(withOverride?.task.id).toBe("t1");
  });
});
