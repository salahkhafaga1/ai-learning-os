import { describe, expect, it } from "vitest";
import {
  validateProjectTaskDates,
  validateRoadmap,
  validateSessions,
} from "@/domain/validation";
import type {
  Phase,
  Project,
  Roadmap,
  Settings,
  StudySession,
  Task,
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

function makeWeek(number: number): Week {
  return {
    number,
    phaseId: "p1",
    title: `الأسبوع ${number}`,
    objectives: [],
    topics: [],
    exercises: [],
    deliverables: [],
    masteryCriteria: [],
    tasks: [makeTask(`t${number}`, number)],
    resourceIds: [],
  };
}

function makePhase(weekNumbers: number[]): Phase {
  return {
    id: "p1",
    number: 1,
    title: "مرحلة",
    shortTitle: "P1",
    description: "",
    objectives: [],
    weekNumbers,
  };
}

function fullRoadmap(): Roadmap {
  const weeks = Array.from({ length: 37 }, (_, i) => makeWeek(i + 1));
  return { phases: [makePhase(weeks.map((w) => w.number))], weeks };
}

function makeSession(id: string, date: string): StudySession {
  return {
    id,
    date,
    topic: "موضوع",
    minutes: 30,
    activity: "reading",
    learned: "",
    implemented: "",
    questions: "",
    createdAt: `${date}T10:00:00.000Z`,
  };
}

function makeProject(tasks: Project["tasks"]): Project {
  return {
    id: "proj-1",
    name: "مشروع",
    tagline: "",
    businessProblem: "",
    targetUsers: "",
    technologies: [],
    status: "proposed",
    milestones: [],
    tasks,
    evaluation: "",
    limitations: [],
    deliverables: [],
    isSeedExample: true,
  };
}

describe("validateRoadmap", () => {
  it("returns no issues for the healthy full roadmap", () => {
    expect(validateRoadmap(fullRoadmap(), settings, {})).toEqual([]);
  });

  it("flags a wrong week count as an error", () => {
    const roadmap = fullRoadmap();
    roadmap.weeks = roadmap.weeks.slice(0, 36);
    const issues = validateRoadmap(roadmap, settings, {});
    const issue = issues.find((i) => i.messageKey === "roadmap_weeks_count");
    expect(issue?.severity).toBe("error");
    expect(issue?.scope).toBe("roadmap");
    expect(issue?.params).toEqual({ expected: 37, actual: 36 });
  });

  it("flags non-sequential week numbers as an error", () => {
    const roadmap = fullRoadmap();
    roadmap.weeks[36] = makeWeek(36); // duplicate 36, nothing is week 37
    const issues = validateRoadmap(roadmap, settings, {});
    const issue = issues.find((i) => i.messageKey === "roadmap_weeks_sequence");
    expect(issue?.severity).toBe("error");
    expect(issue?.ref).toBe(36);
    expect(issue?.params).toEqual({ expected: 37, actual: 36 });
  });

  it("warns when the target end precedes the computed roadmap end", () => {
    const issues = validateRoadmap(
      fullRoadmap(),
      { ...settings, roadmapTargetEnd: "2027-06-01" },
      {},
    );
    const issue = issues.find(
      (i) => i.messageKey === "target_before_roadmap_end",
    );
    expect(issue?.severity).toBe("warning");
    expect(issue?.params).toEqual({
      targetEnd: "2027-06-01",
      computedEnd: "2027-07-05",
    });
  });

  it("warns with params for every non-contiguous boundary an override creates", () => {
    // week 2 pushed to 2026-11-05: gap after week 1 and overlap with week 3
    const issues = validateRoadmap(fullRoadmap(), settings, {
      "2": "2026-11-05",
    });
    const conflicts = issues.filter((i) => i.messageKey === "weekDateConflict");
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0]).toMatchObject({
      severity: "warning",
      scope: "week",
      ref: 2,
    });
    expect(conflicts[0]?.params).toEqual({
      prevWeek: 1,
      week: 2,
      prevEnd: "2026-10-26",
      expected: "2026-10-27",
      actual: "2026-11-05",
    });
    expect(conflicts[1]?.ref).toBe(3);
    expect(conflicts[1]?.params).toEqual({
      prevWeek: 2,
      week: 3,
      prevEnd: "2026-11-11",
      expected: "2026-11-12",
      actual: "2026-11-03",
    });
  });

  it("warns when an override creates an overlap between weeks", () => {
    // week 2 pulled back to 2026-10-25: overlaps week 1, gaps before week 3
    const issues = validateRoadmap(fullRoadmap(), settings, {
      "2": "2026-10-25",
    });
    const conflicts = issues.filter((i) => i.messageKey === "weekDateConflict");
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0]?.params).toEqual({
      prevWeek: 1,
      week: 2,
      prevEnd: "2026-10-26",
      expected: "2026-10-27",
      actual: "2026-10-25",
    });
    expect(conflicts[1]?.params).toEqual({
      prevWeek: 2,
      week: 3,
      prevEnd: "2026-10-31",
      expected: "2026-11-01",
      actual: "2026-11-03",
    });
  });
});

describe("validateSessions", () => {
  it("flags sessions outside the roadmap period", () => {
    const sessions = [
      makeSession("s1", "2026-10-19"),
      makeSession("s2", "2026-10-20"),
      makeSession("s3", "2027-07-05"),
      makeSession("s4", "2027-07-06"),
    ];
    const issues = validateSessions(sessions, settings);
    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({
      severity: "warning",
      scope: "session",
      ref: "s1",
      messageKey: "session_outside_period",
    });
    expect(issues[1]?.ref).toBe("s4");
  });

  it("returns no issues for sessions inside the period", () => {
    expect(
      validateSessions([makeSession("s1", "2026-10-20")], settings),
    ).toEqual([]);
  });
});

describe("validateProjectTaskDates", () => {
  it("flags project tasks with due dates outside the roadmap period", () => {
    const projects = [
      makeProject([
        { id: "pt1", title: "مهمة داخلية", status: "todo", dueDate: "2026-10-20" },
        { id: "pt2", title: "مهمة متأخرة", status: "todo", dueDate: "2027-08-01" },
        { id: "pt3", title: "بدون تاريخ", status: "todo" },
      ]),
    ];
    const issues = validateProjectTaskDates(projects, settings);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "warning",
      scope: "project-task",
      ref: "pt2",
      messageKey: "task_outside_period",
    });
  });
});
