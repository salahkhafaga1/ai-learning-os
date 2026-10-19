import { describe, expect, it } from "vitest";
import { allWeeks } from "@/data/phases";
import { seedProjects } from "@/data/projects";
import { resources } from "@/data/resources";
import { createSeedState, defaultAssessment } from "@/data/seed";
import { skills } from "@/data/skills";

describe("skills seed", () => {
  it("authors all eleven skill ids from the roadmap with English terms", () => {
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(11);
    expect([...ids].sort()).toEqual([
      "agentic-ai",
      "apis-backend",
      "deep-learning-pytorch",
      "embedded-iot",
      "llms-transformers",
      "machine-learning",
      "mlops-deployment",
      "nextjs-typescript",
      "python-engineering",
      "rag-evaluation",
      "sql-databases",
    ]);
    for (const skill of skills) {
      expect(skill.name.trim().length, skill.id).toBeGreaterThan(0);
      expect(skill.description.trim().length, skill.id).toBeGreaterThan(0);
      expect(skill.description, skill.id).toMatch(/[A-Za-z]{3}/);
    }
  });
});

describe("createSeedState", () => {
  it("starts every roadmap task at todo with no extra keys", () => {
    const state = createSeedState();
    const taskIds = allWeeks.flatMap((w) => w.tasks.map((t) => t.id));
    expect(Object.keys(state.taskStatus).sort()).toEqual([...taskIds].sort());
    for (const id of taskIds) {
      expect(state.taskStatus[id], id).toBe("todo");
    }
  });

  it("has no done statuses and an empty study log", () => {
    const state = createSeedState();
    expect(Object.values(state.taskStatus)).not.toContain("done");
    expect(state.sessions).toEqual([]);
    const totalMinutes = state.sessions.reduce((sum, s) => sum + s.minutes, 0);
    expect(totalMinutes).toBe(0);
  });

  it("initializes every skill at level 0 with empty evidence text", () => {
    const state = createSeedState();
    expect(Object.keys(state.skillAssessments).sort()).toEqual(
      skills.map((s) => s.id).sort(),
    );
    for (const skill of skills) {
      const assessment = state.skillAssessments[skill.id];
      expect(assessment?.level, skill.id).toBe(0);
      expect(assessment?.evidence, skill.id).toBe("");
      expect(assessment?.notes, skill.id).toBe("");
      expect(assessment?.nextGoal, skill.id).toBe("");
    }
  });

  it("initializes every resource as not_started", () => {
    const state = createSeedState();
    expect(Object.keys(state.resourceStatus).sort()).toEqual(
      resources.map((r) => r.id).sort(),
    );
    for (const resource of resources) {
      expect(state.resourceStatus[resource.id]?.status, resource.id).toBe(
        "not_started",
      );
    }
  });

  it("keeps notes, blockers, overrides, and reviews empty", () => {
    const state = createSeedState();
    expect(state.weekNotes).toEqual({});
    expect(state.weekBlockers).toEqual({});
    expect(state.weekDateOverrides).toEqual({});
    expect(state.reviews).toEqual({});
  });

  it("seeds exactly one proposed example project with all tasks todo", () => {
    const state = createSeedState();
    expect(state.projects).toHaveLength(1);
    const project = state.projects[0];
    expect(project?.id).toBe("ai-business-copilot");
    expect(project?.status).toBe("proposed");
    expect(project?.isSeedExample).toBe(true);
    expect(project?.milestones).toHaveLength(4);
    expect(project?.tasks).toHaveLength(6);
    expect(project?.evaluation).toBe("");
    expect(project?.repoUrl).toBeUndefined();
    expect(
      project?.limitations.some((line) => line.includes("لم يُبنَ")),
    ).toBe(true);
    for (const task of project?.tasks ?? []) {
      expect(task.status, task.id).toBe("todo");
    }
  });

  it("uses the default window and preferences, and applies overrides", () => {
    const state = createSeedState();
    expect(state.settings).toEqual({
      roadmapStart: "2026-10-20",
      roadmapTargetEnd: "2027-07-05",
      theme: "dark",
      language: "ar",
    });
    const custom = createSeedState({
      roadmapStart: "2026-11-01",
      theme: "light",
    });
    expect(custom.settings.roadmapStart).toBe("2026-11-01");
    expect(custom.settings.theme).toBe("light");
    expect(custom.settings.roadmapTargetEnd).toBe("2027-07-05");
    expect(custom.settings.language).toBe("ar");
  });

  it("produces deep-equal but independent states on every call", () => {
    const first = createSeedState();
    const second = createSeedState();
    expect(first).toEqual(second);

    const project = first.projects[0];
    const milestone = project?.milestones[0];
    const projectTask = project?.tasks[0];
    const assessment = first.skillAssessments["python-engineering"];
    const resourceState = first.resourceStatus["pytorch-basics"];
    if (!project || !milestone || !projectTask || !assessment || !resourceState) {
      throw new Error("seed state missing expected entries");
    }
    first.taskStatus["w1-t1"] = "done";
    first.weekNotes["1"] = "ملاحظة اختبار";
    projectTask.status = "done";
    milestone.done = true;
    assessment.level = 3;
    resourceState.status = "completed";

    const third = createSeedState();
    expect(third.taskStatus["w1-t1"]).toBe("todo");
    expect(third.weekNotes).toEqual({});
    expect(third.projects[0]?.tasks[0]?.status).toBe("todo");
    expect(third.projects[0]?.milestones[0]?.done).toBe(false);
    expect(third.skillAssessments["python-engineering"]?.level).toBe(0);
    expect(third.resourceStatus["pytorch-basics"]?.status).toBe(
      "not_started",
    );
  });

  it("does not alias the static seedProjects module data", () => {
    const state = createSeedState();
    const stateTask = state.projects[0]?.tasks[0];
    const seedTask = seedProjects[0]?.tasks[0];
    if (!stateTask || !seedTask) {
      throw new Error("seed project tasks missing");
    }
    stateTask.status = "done";
    expect(seedTask.status).toBe("todo");
  });

  it("returns a fresh zeroed default assessment each call", () => {
    const first = defaultAssessment();
    expect(first).toEqual({
      level: 0,
      evidence: "",
      notes: "",
      nextGoal: "",
      updatedAt: "",
    });
    const second = defaultAssessment();
    expect(second).not.toBe(first);
  });
});
