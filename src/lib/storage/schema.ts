import { z } from "zod";
import {
  ACTIVITY_TYPES,
  PROJECT_STATUSES,
  RESOURCE_STATUSES,
  TASK_STATUSES,
} from "@/domain/constants";
import type { AppState } from "@/domain/types";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const skillLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const ratingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.null(),
]);

const sessionSchema = z.object({
  id: z.string().min(1),
  date: isoDateSchema,
  topic: z.string(),
  minutes: z.number().int().min(1).max(1440),
  activity: z.enum(ACTIVITY_TYPES),
  learned: z.string(),
  implemented: z.string(),
  questions: z.string(),
  createdAt: z.string(),
});

const weekReviewSchema = z.object({
  whatWentWell: z.string(),
  whatWasHard: z.string(),
  adjustments: z.string(),
  rating: ratingSchema,
  updatedAt: z.string(),
});

const skillAssessmentSchema = z.object({
  level: skillLevelSchema,
  evidence: z.string(),
  notes: z.string(),
  nextGoal: z.string(),
  updatedAt: z.string(),
});

const resourceUserStateSchema = z.object({
  status: z.enum(RESOURCE_STATUSES),
  notes: z.string(),
  updatedAt: z.string(),
});

const projectMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  done: z.boolean(),
  dueDate: isoDateSchema.optional(),
});

const projectTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  status: z.enum(TASK_STATUSES),
  dueDate: isoDateSchema.optional(),
});

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  tagline: z.string(),
  businessProblem: z.string(),
  targetUsers: z.string(),
  technologies: z.array(z.string()),
  repoUrl: z.string().optional(),
  status: z.enum(PROJECT_STATUSES),
  milestones: z.array(projectMilestoneSchema),
  tasks: z.array(projectTaskSchema),
  evaluation: z.string(),
  limitations: z.array(z.string()),
  deliverables: z.array(z.string()),
  isSeedExample: z.boolean(),
});

const settingsSchema = z.object({
  roadmapStart: isoDateSchema,
  roadmapTargetEnd: isoDateSchema,
  theme: z.enum(["dark", "light", "system"]),
  language: z.enum(["ar", "en"]),
});

export const stateSchema = z.object({
  schemaVersion: z.literal(1),
  taskStatus: z.record(z.string().min(1), z.enum(TASK_STATUSES)),
  weekNotes: z.record(z.string(), z.string()),
  weekBlockers: z.record(z.string(), z.string()),
  weekDateOverrides: z.record(z.string(), isoDateSchema),
  reviews: z.record(z.string(), weekReviewSchema),
  sessions: z.array(sessionSchema),
  skillAssessments: z.record(z.string(), skillAssessmentSchema),
  projects: z.array(projectSchema),
  resourceStatus: z.record(z.string(), resourceUserStateSchema),
  settings: settingsSchema,
});

export const envelopeSchema = z.object({
  version: z.literal(1),
  savedAt: z.string(),
  state: stateSchema,
});

export type EnvelopeParseResult =
  | { ok: true; state: AppState }
  | { ok: false; code: "invalid_shape" | "unsupported_version" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseEnvelope(json: unknown): EnvelopeParseResult {
  if (isRecord(json) && typeof json.version === "number" && json.version !== 1) {
    return { ok: false, code: "unsupported_version" };
  }

  const parsed = envelopeSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, code: "invalid_shape" };
  }

  return { ok: true, state: parsed.data.state };
}
