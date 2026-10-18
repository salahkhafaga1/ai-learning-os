import { effectiveWeekRange } from "./dates";
import type {
  Phase,
  PhaseStatus,
  Roadmap,
  Settings,
  Task,
  TaskStatus,
  Week,
} from "./types";

export interface ProgressCount {
  completed: number;
  eligible: number;
  percent: number;
}

export function taskProgress(
  taskIds: string[],
  status: Record<string, TaskStatus>,
): ProgressCount {
  let completed = 0;
  let eligible = 0;
  for (const id of taskIds) {
    const value = status[id] ?? "todo";
    if (value === "skipped") {
      continue;
    }
    eligible += 1;
    if (value === "done") {
      completed += 1;
    }
  }
  return {
    completed,
    eligible,
    percent: eligible === 0 ? 0 : Math.round((completed / eligible) * 100),
  };
}

function weekTaskIds(week: Week): string[] {
  return week.tasks.map((task) => task.id);
}

export function weekTaskProgress(
  week: Week,
  status: Record<string, TaskStatus>,
): ProgressCount {
  return taskProgress(weekTaskIds(week), status);
}

export function phaseTaskProgress(
  phase: Phase,
  weeks: Week[],
  status: Record<string, TaskStatus>,
): ProgressCount {
  const ids = weeks
    .filter((week) => week.phaseId === phase.id)
    .flatMap(weekTaskIds);
  return taskProgress(ids, status);
}

export function overallTaskProgress(
  roadmap: Roadmap,
  status: Record<string, TaskStatus>,
): ProgressCount {
  return taskProgress(roadmap.weeks.flatMap(weekTaskIds), status);
}

export function completedWeekCount(
  roadmap: Roadmap,
  status: Record<string, TaskStatus>,
): number {
  return roadmap.weeks.filter((week) => {
    const progress = weekTaskProgress(week, status);
    return progress.eligible > 0 && progress.completed === progress.eligible;
  }).length;
}

export function phaseStatusFor(
  phase: Phase,
  weeks: Week[],
  status: Record<string, TaskStatus>,
): PhaseStatus {
  const phaseWeeks = weeks.filter((week) => week.phaseId === phase.id);
  const progress = taskProgress(phaseWeeks.flatMap(weekTaskIds), status);
  if (progress.eligible > 0 && progress.completed === progress.eligible) {
    return "completed";
  }

  let sawBlocked = false;
  let sawStarted = false;
  for (const week of phaseWeeks) {
    for (const task of week.tasks) {
      const value = status[task.id] ?? "todo";
      if (value === "blocked") {
        sawBlocked = true;
      } else if (value === "in_progress" || value === "done") {
        sawStarted = true;
      }
    }
  }

  if (sawBlocked) {
    return "blocked";
  }
  if (sawStarted) {
    return "in_progress";
  }
  return "not_started";
}

export interface OverdueTask {
  task: Task;
  weekNumber: number;
}

export function overdueTasks(
  roadmap: Roadmap,
  status: Record<string, TaskStatus>,
  settings: Settings,
  overrides: Record<string, string>,
  todayISO: string,
): OverdueTask[] {
  const ordered = [...roadmap.weeks].sort((a, b) => a.number - b.number);
  const result: OverdueTask[] = [];
  for (const week of ordered) {
    const { end } = effectiveWeekRange(week.number, settings, overrides);
    if (end >= todayISO) {
      continue;
    }
    for (const task of week.tasks) {
      const value = status[task.id] ?? "todo";
      if (value === "done" || value === "skipped") {
        continue;
      }
      result.push({ task, weekNumber: week.number });
    }
  }
  return result;
}
