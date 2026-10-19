import type {
  AppState,
  Project,
  ResourceUserState,
  Settings,
  SkillAssessment,
  StudySession,
  TaskStatus,
  WeekReview,
} from "@/domain/types";

export type Action =
  | { type: "data/load"; state: AppState }
  | { type: "data/import"; state: AppState }
  | { type: "data/reset" }
  | { type: "task/setStatus"; taskId: string; status: TaskStatus }
  | { type: "week/setNote"; weekNumber: number; text: string }
  | { type: "week/setBlocker"; weekNumber: number; text: string }
  | { type: "week/setDateOverride"; weekNumber: number; startISO: string | null }
  | { type: "week/saveReview"; weekNumber: number; review: WeekReview }
  | { type: "session/add"; session: StudySession }
  | { type: "session/update"; session: StudySession }
  | { type: "session/delete"; id: string }
  | { type: "skill/setAssessment"; skillId: string; assessment: SkillAssessment }
  | { type: "project/add"; project: Project }
  | { type: "project/update"; project: Project }
  | { type: "project/delete"; projectId: string }
  | { type: "resource/setState"; resourceId: string; value: ResourceUserState }
  | { type: "settings/patch"; patch: Partial<Settings> };
