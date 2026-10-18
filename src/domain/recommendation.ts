import { currentWeekNumber } from "./dates";
import type { Phase, Roadmap, Settings, Task, TaskStatus, Week } from "./types";

export interface Recommendation {
  task: Task;
  week: Week;
  phase: Phase;
}

export function nextRecommendedTask(
  roadmap: Roadmap,
  status: Record<string, TaskStatus>,
  settings: Settings,
  overrides: Record<string, string>,
  todayISO: string,
): Recommendation | null {
  if (todayISO > settings.roadmapTargetEnd) {
    return null;
  }

  const startWeek = currentWeekNumber(
    todayISO,
    roadmap.weeks,
    settings,
    overrides,
  );

  const ordered = [...roadmap.weeks]
    .sort((a, b) => a.number - b.number)
    .filter((week) => week.number >= startWeek);

  for (const week of ordered) {
    const phase = roadmap.phases.find((p) => p.id === week.phaseId);
    if (!phase) {
      continue;
    }
    for (const task of week.tasks) {
      const value = status[task.id] ?? "todo";
      if (value === "done" || value === "skipped") {
        continue;
      }
      return { task, week, phase };
    }
  }

  return null;
}
