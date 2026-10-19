import { DAYS_PER_WEEK, WEEK_COUNT } from "./constants";
import {
  addDays,
  effectiveWeekRange,
  effectiveWeekStart,
  isWithinRoadmap,
  weekRange,
} from "./dates";
import type { Project, Roadmap, Settings, StudySession } from "./types";

export type IssueSeverity = "warning" | "error";
export type IssueScope = "roadmap" | "week" | "session" | "project-task";

export interface RoadmapIssue {
  severity: IssueSeverity;
  scope: IssueScope;
  ref?: string | number;
  messageKey: string;
  params?: Record<string, string | number>;
}

export function validateRoadmap(
  roadmap: Roadmap,
  settings: Settings,
  overrides: Record<string, string>,
): RoadmapIssue[] {
  const issues: RoadmapIssue[] = [];
  const ordered = [...roadmap.weeks].sort((a, b) => a.number - b.number);

  if (ordered.length !== WEEK_COUNT) {
    issues.push({
      severity: "error",
      scope: "roadmap",
      messageKey: "roadmap_weeks_count",
      params: { expected: WEEK_COUNT, actual: ordered.length },
    });
  }

  ordered.forEach((week, index) => {
    if (week.number !== index + 1) {
      issues.push({
        severity: "error",
        scope: "week",
        ref: week.number,
        messageKey: "roadmap_weeks_sequence",
        params: { expected: index + 1, actual: week.number },
      });
    }
  });

  const computedEnd = weekRange(WEEK_COUNT, settings.roadmapStart).end;
  if (settings.roadmapTargetEnd < computedEnd) {
    issues.push({
      severity: "warning",
      scope: "roadmap",
      messageKey: "target_before_roadmap_end",
      params: {
        targetEnd: settings.roadmapTargetEnd,
        computedEnd,
      },
    });
  }

  for (let index = 1; index < ordered.length; index += 1) {
    const prev = ordered[index - 1];
    const current = ordered[index];
    const prevRange = effectiveWeekRange(prev.number, settings, overrides);
    const currentStart = effectiveWeekStart(current.number, settings, overrides);
    const expected = addDays(prevRange.start, DAYS_PER_WEEK);
    if (currentStart !== expected) {
      issues.push({
        severity: "warning",
        scope: "week",
        ref: current.number,
        messageKey: "weekDateConflict",
        params: {
          prevWeek: prev.number,
          week: current.number,
          prevEnd: prevRange.end,
          expected,
          actual: currentStart,
        },
      });
    }
  }

  return issues;
}

export function validateSessions(
  sessions: StudySession[],
  settings: Settings,
): RoadmapIssue[] {
  const issues: RoadmapIssue[] = [];
  for (const session of sessions) {
    if (
      !isWithinRoadmap(
        session.date,
        settings.roadmapStart,
        settings.roadmapTargetEnd,
      )
    ) {
      issues.push({
        severity: "warning",
        scope: "session",
        ref: session.id,
        messageKey: "session_outside_period",
        params: { date: session.date },
      });
    }
  }
  return issues;
}

export function validateProjectTaskDates(
  projects: Project[],
  settings: Settings,
): RoadmapIssue[] {
  const issues: RoadmapIssue[] = [];
  for (const project of projects) {
    for (const task of project.tasks) {
      if (!task.dueDate) {
        continue;
      }
      if (
        !isWithinRoadmap(
          task.dueDate,
          settings.roadmapStart,
          settings.roadmapTargetEnd,
        )
      ) {
        issues.push({
          severity: "warning",
          scope: "project-task",
          ref: task.id,
          messageKey: "task_outside_period",
          params: { projectId: project.id, date: task.dueDate },
        });
      }
    }
  }
  return issues;
}
