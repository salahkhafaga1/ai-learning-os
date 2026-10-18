import { describe, expect, it } from "vitest";
import {
  completedWeekCount,
  overallTaskProgress,
  overdueTasks,
  phaseStatusFor,
  phaseTaskProgress,
  taskProgress,
  weekTaskProgress,
} from "@/domain/progress";
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

describe("taskProgress", () => {
  it("returns zeros for an empty list", () => {
    expect(taskProgress([], {})).toEqual({ completed: 0, eligible: 0, percent: 0 });
  });

  it("returns zeros when every task is skipped (zero eligible, no NaN)", () => {
    expect(
      taskProgress(["a", "b"], { a: "skipped", b: "skipped" }),
    ).toEqual({ completed: 0, eligible: 0, percent: 0 });
  });

  it("treats absent status keys as todo (eligible, not completed)", () => {
    expect(taskProgress(["a"], {})).toEqual({
      completed: 0,
      eligible: 1,
      percent: 0,
    });
  });

  it("rounds the percent and excludes skipped tasks from the denominator", () => {
    expect(
      taskProgress(["a", "b", "c"], { a: "done", b: "done", c: "todo" }),
    ).toEqual({ completed: 2, eligible: 3, percent: 67 });
    expect(
      taskProgress(["a", "b", "c"], { a: "done", b: "todo", c: "skipped" }),
    ).toEqual({ completed: 1, eligible: 2, percent: 50 });
  });
});

const w1 = makeWeek(1, "p1", [makeTask("t1", 1), makeTask("t2", 1)]);
const w2 = makeWeek(2, "p1", [
  makeTask("t3", 2),
  makeTask("t4", 2),
  makeTask("t5", 2),
]);
const w3 = makeWeek(3, "p2", []);
const roadmap: Roadmap = {
  phases: [makePhase("p1", 1, [1, 2]), makePhase("p2", 2, [3])],
  weeks: [w1, w2, w3],
};

describe("week / phase / overall aggregation", () => {
  const status: Record<string, TaskStatus> = {
    t1: "done",
    t2: "done",
    t3: "skipped",
    t4: "skipped",
    t5: "skipped",
  };

  it("aggregates a week", () => {
    expect(weekTaskProgress(w1, status)).toEqual({
      completed: 2,
      eligible: 2,
      percent: 100,
    });
    expect(weekTaskProgress(w2, status)).toEqual({
      completed: 0,
      eligible: 0,
      percent: 0,
    });
  });

  it("aggregates a phase from its weeks", () => {
    expect(phaseTaskProgress(makePhase("p1", 1, [1, 2]), roadmap.weeks, status)).toEqual({
      completed: 2,
      eligible: 2,
      percent: 100,
    });
  });

  it("aggregates the whole roadmap", () => {
    expect(overallTaskProgress(roadmap, status)).toEqual({
      completed: 2,
      eligible: 2,
      percent: 100,
    });
  });
});

describe("completedWeekCount", () => {
  it("counts only weeks with ≥1 eligible task and all eligible done", () => {
    const status: Record<string, TaskStatus> = {
      t1: "done",
      t2: "done",
      t3: "skipped",
      t4: "skipped",
      t5: "skipped",
    };
    expect(completedWeekCount(roadmap, status)).toBe(1);
  });

  it("does not count a week whose eligible tasks are not all done", () => {
    const status: Record<string, TaskStatus> = { t1: "done", t2: "todo" };
    expect(completedWeekCount(roadmap, status)).toBe(0);
  });

  it("never counts a week with zero eligible tasks", () => {
    const allSkipped: Record<string, TaskStatus> = {
      t1: "skipped",
      t2: "skipped",
    };
    expect(completedWeekCount(roadmap, allSkipped)).toBe(0);
  });
});

describe("phaseStatusFor precedence", () => {
  const pWeeks = [
    makeWeek(9, "p9", [
      makeTask("a", 9),
      makeTask("b", 9),
      makeTask("c", 9),
    ]),
  ];
  const p9 = makePhase("p9", 9, [9]);

  it("not_started when nothing started", () => {
    expect(phaseStatusFor(p9, pWeeks, {})).toBe("not_started");
  });

  it("in_progress when any task is in_progress", () => {
    expect(phaseStatusFor(p9, pWeeks, { a: "in_progress" })).toBe("in_progress");
  });

  it("in_progress when some are done but not all eligible", () => {
    expect(phaseStatusFor(p9, pWeeks, { a: "done", b: "todo" })).toBe(
      "in_progress",
    );
  });

  it("blocked when any task is blocked and not everything is done", () => {
    expect(
      phaseStatusFor(p9, pWeeks, { a: "done", b: "blocked", c: "todo" }),
    ).toBe("blocked");
  });

  it("completed when all eligible tasks are done (skipped does not block)", () => {
    expect(
      phaseStatusFor(p9, pWeeks, { a: "done", b: "done", c: "skipped" }),
    ).toBe("completed");
  });

  it("not_started for a phase with zero tasks", () => {
    expect(phaseStatusFor(p9, [], {})).toBe("not_started");
  });
});

describe("overdueTasks", () => {
  const o1 = makeWeek(1, "p1", [
    makeTask("t1", 1),
    makeTask("t2", 1),
    makeTask("t3", 1),
  ]);
  const o2 = makeWeek(2, "p1", [makeTask("t4", 2)]);
  const oRoadmap: Roadmap = {
    phases: [makePhase("p1", 1, [1, 2])],
    weeks: [o1, o2],
  };

  const ids = (result: Array<{ task: Task; weekNumber: number }>) =>
    result.map((r) => [r.task.id, r.weekNumber]);

  it("includes only tasks from weeks whose effective end is before today", () => {
    const status: Record<string, TaskStatus> = {
      t1: "done",
      t3: "skipped",
    };
    expect(ids(overdueTasks(oRoadmap, status, settings, {}, "2026-10-30"))).toEqual([
      ["t2", 1],
    ]);
  });

  it("is not overdue on the last day of the week (strict boundary)", () => {
    expect(ids(overdueTasks(oRoadmap, {}, settings, {}, "2026-10-26"))).toEqual(
      [],
    );
  });

  it("includes tasks from multiple past weeks in week order", () => {
    expect(ids(overdueTasks(oRoadmap, {}, settings, {}, "2026-11-03"))).toEqual([
      ["t1", 1],
      ["t2", 1],
      ["t3", 1],
      ["t4", 2],
    ]);
  });

  it("counts blocked tasks as overdue", () => {
    const status: Record<string, TaskStatus> = { t2: "blocked" };
    expect(ids(overdueTasks(oRoadmap, status, settings, {}, "2026-10-30"))).toEqual([
      ["t1", 1],
      ["t2", 1],
      ["t3", 1],
    ]);
  });

  it("follows a date override that shifts the overdue window", () => {
    const status: Record<string, TaskStatus> = {};
    expect(
      ids(
        overdueTasks(oRoadmap, status, settings, { "1": "2026-11-01" }, "2026-10-30"),
      ),
    ).toEqual([]);
  });
});
