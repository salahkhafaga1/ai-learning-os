import { allWeeks } from "@/data/phases";
import { seedProjects } from "@/data/projects";
import { resources } from "@/data/resources";
import { skills } from "@/data/skills";
import {
  ROADMAP_DEFAULT_START,
  ROADMAP_DEFAULT_TARGET_END,
} from "@/domain/constants";
import type {
  AppState,
  ResourceUserState,
  Settings,
  SkillAssessment,
  TaskStatus,
} from "@/domain/types";

export function defaultAssessment(): SkillAssessment {
  return {
    level: 0,
    evidence: "",
    notes: "",
    nextGoal: "",
    updatedAt: "",
  };
}

export function createSeedState(
  overrides?: Partial<
    Pick<Settings, "roadmapStart" | "roadmapTargetEnd" | "theme" | "language">
  >,
): AppState {
  const taskStatus: Record<string, TaskStatus> = {};
  for (const week of allWeeks) {
    for (const task of week.tasks) {
      taskStatus[task.id] = "todo";
    }
  }

  const skillAssessments: Record<string, SkillAssessment> = {};
  for (const skill of skills) {
    skillAssessments[skill.id] = defaultAssessment();
  }

  const resourceStatus: Record<string, ResourceUserState> = {};
  for (const resource of resources) {
    resourceStatus[resource.id] = {
      status: "not_started",
      notes: "",
      updatedAt: "",
    };
  }

  return {
    schemaVersion: 1,
    taskStatus,
    weekNotes: {},
    weekBlockers: {},
    weekDateOverrides: {},
    reviews: {},
    sessions: [],
    skillAssessments,
    projects: structuredClone(seedProjects),
    resourceStatus,
    settings: {
      roadmapStart: ROADMAP_DEFAULT_START,
      roadmapTargetEnd: ROADMAP_DEFAULT_TARGET_END,
      theme: "dark",
      language: "ar",
      ...overrides,
    },
  };
}
