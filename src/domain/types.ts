export type TaskStatus = "todo" | "in_progress" | "blocked" | "done" | "skipped";
export type TaskKind = "study" | "exercise" | "project" | "deliverable" | "review";
export type ActivityType = "reading" | "coding" | "debugging" | "project" | "review";
export type ResourceStatus = "not_started" | "in_progress" | "completed";
export type ResourceKind =
  | "official_docs"
  | "course"
  | "tutorial"
  | "article"
  | "book"
  | "video"
  | "repo"
  | "tool";
export type PhaseStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type ProjectStatus =
  | "proposed"
  | "planned"
  | "in_progress"
  | "paused"
  | "completed";
export type ThemePref = "dark" | "light" | "system";
export type LangPref = "ar" | "en";

export interface Task {
  id: string;
  weekNumber: number;
  title: string;
  kind: TaskKind;
  effortMinutes: number;
  resourceIds: string[];
}

export interface Week {
  number: number;
  phaseId: string;
  title: string;
  objectives: string[];
  topics: string[];
  exercises: string[];
  deliverables: string[];
  masteryCriteria: string[];
  tasks: Task[];
  resourceIds: string[];
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  objectives: string[];
  weekNumbers: number[];
}

export interface Roadmap {
  phases: Phase[];
  weeks: Week[];
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  kind: ResourceKind;
  official: boolean;
  phaseIds: string[];
  weekNumbers: number[];
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  businessProblem: string;
  targetUsers: string;
  technologies: string[];
  repoUrl?: string;
  status: ProjectStatus;
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  evaluation: string;
  limitations: string[];
  deliverables: string[];
  isSeedExample: boolean;
}

export interface StudySession {
  id: string;
  date: string;
  topic: string;
  minutes: number;
  activity: ActivityType;
  learned: string;
  implemented: string;
  questions: string;
  createdAt: string;
}

export interface WeekReview {
  whatWentWell: string;
  whatWasHard: string;
  adjustments: string;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  updatedAt: string;
}

export interface SkillAssessment {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  evidence: string;
  notes: string;
  nextGoal: string;
  updatedAt: string;
}

export interface ResourceUserState {
  status: ResourceStatus;
  notes: string;
  updatedAt: string;
}

export interface Settings {
  roadmapStart: string;
  roadmapTargetEnd: string;
  theme: ThemePref;
  language: LangPref;
}

export interface AppState {
  schemaVersion: 1;
  taskStatus: Record<string, TaskStatus>;
  weekNotes: Record<string, string>;
  weekBlockers: Record<string, string>;
  weekDateOverrides: Record<string, string>;
  reviews: Record<string, WeekReview>;
  sessions: StudySession[];
  skillAssessments: Record<string, SkillAssessment>;
  projects: Project[];
  resourceStatus: Record<string, ResourceUserState>;
  settings: Settings;
}
