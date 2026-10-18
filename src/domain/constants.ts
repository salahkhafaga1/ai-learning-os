import type {
  ActivityType,
  ProjectStatus,
  ResourceKind,
  ResourceStatus,
  TaskKind,
  TaskStatus,
} from "./types";

export const WEEK_COUNT = 37;
export const DAYS_PER_WEEK = 7;
export const ROADMAP_DEFAULT_START = "2026-10-20";
export const ROADMAP_DEFAULT_TARGET_END = "2027-07-05";
export const STORAGE_KEY = "ai-learning-os.state.v1";
export const CORRUPT_BACKUP_KEY = "ai-learning-os.state.v1.corrupt";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
  "skipped",
];

export const TASK_KINDS: readonly TaskKind[] = [
  "study",
  "exercise",
  "project",
  "deliverable",
  "review",
];

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "reading",
  "coding",
  "debugging",
  "project",
  "review",
];

export const RESOURCE_STATUSES: readonly ResourceStatus[] = [
  "not_started",
  "in_progress",
  "completed",
];

export const RESOURCE_KINDS: readonly ResourceKind[] = [
  "official_docs",
  "course",
  "tutorial",
  "article",
  "book",
  "video",
  "repo",
  "tool",
];

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "proposed",
  "planned",
  "in_progress",
  "paused",
  "completed",
];

export const TASK_STATUS_LABEL_KEYS: Record<TaskStatus, string> = {
  todo: "status.todo",
  in_progress: "status.in_progress",
  blocked: "status.blocked",
  done: "status.done",
  skipped: "status.skipped",
};

export const TASK_KIND_LABEL_KEYS: Record<TaskKind, string> = {
  study: "kind.study",
  exercise: "kind.exercise",
  project: "kind.project",
  deliverable: "kind.deliverable",
  review: "kind.review",
};

export const ACTIVITY_LABEL_KEYS: Record<ActivityType, string> = {
  reading: "activity.reading",
  coding: "activity.coding",
  debugging: "activity.debugging",
  project: "activity.project",
  review: "activity.review",
};

export const RESOURCE_STATUS_LABEL_KEYS: Record<ResourceStatus, string> = {
  not_started: "resourceStatus.not_started",
  in_progress: "resourceStatus.in_progress",
  completed: "resourceStatus.completed",
};

export const RESOURCE_KIND_LABEL_KEYS: Record<ResourceKind, string> = {
  official_docs: "resourceKind.official_docs",
  course: "resourceKind.course",
  tutorial: "resourceKind.tutorial",
  article: "resourceKind.article",
  book: "resourceKind.book",
  video: "resourceKind.video",
  repo: "resourceKind.repo",
  tool: "resourceKind.tool",
};
