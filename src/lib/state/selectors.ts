import { addDays, currentWeekNumber, effectiveWeekFor, effectiveWeekRange } from "@/domain/dates";
import {
  completedWeekCount,
  overallTaskProgress,
  overdueTasks,
  phaseStatusFor,
  phaseTaskProgress,
  type OverdueTask,
  type ProgressCount,
} from "@/domain/progress";
import { nextRecommendedTask, type Recommendation } from "@/domain/recommendation";
import type {
  AppState,
  Phase,
  PhaseStatus,
  Roadmap,
  StudySession,
  Task,
  Week,
} from "@/domain/types";
import { validateRoadmap, validateSessions, type RoadmapIssue } from "@/domain/validation";

export interface DashboardModel {
  overall: ProgressCount;
  weeks: { completed: number; total: number };
  phases: Array<{
    phase: Phase;
    status: PhaseStatus;
    progress: ProgressCount;
    range: { start: string; end: string };
  }>;
  current: { week: Week; phase: Phase; range: { start: string; end: string } } | null;
  taskCounts: { done: number; pending: number; blocked: number };
  time: {
    totalMinutes: number;
    todayMinutes: number;
    thisWeekMinutes: number;
    last7DaysMinutes: number;
  };
  activityByWeek: Array<{ weekNumber: number | null; minutes: number; label: string }>;
  overdue: OverdueTask[];
  blocked: Array<{ task: Task; weekNumber: number; note?: string }>;
  next: Recommendation | null;
  milestones: Array<{ task: Task; week: Week; weekEnd: string }>;
  issues: RoadmapIssue[];
}

export function sumMinutes(sessions: StudySession[]): number {
  let total = 0;
  for (const session of sessions) {
    total += session.minutes;
  }
  return total;
}

export function sessionsToday(
  sessions: StudySession[],
  todayISO: string,
): StudySession[] {
  return sessions.filter((session) => session.date === todayISO);
}

export function sessionsInRange(
  sessions: StudySession[],
  startISO: string,
  endISO: string,
): StudySession[] {
  return sessions.filter(
    (session) => session.date >= startISO && session.date <= endISO,
  );
}

export function selectDashboard(
  roadmap: Roadmap,
  state: AppState,
  todayISO: string,
): DashboardModel {
  const { settings, weekDateOverrides: overrides, taskStatus } = state;
  const weeks = [...roadmap.weeks].sort((a, b) => a.number - b.number);
  const phases = [...roadmap.phases].sort((a, b) => a.number - b.number);
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));

  const phaseModels: DashboardModel["phases"] = phases.map((phase) => {
    const phaseWeeks = weeks.filter((week) => week.phaseId === phase.id);
    const first = phaseWeeks[0];
    const last = phaseWeeks[phaseWeeks.length - 1];
    const range =
      first && last
        ? {
            start: effectiveWeekRange(first.number, settings, overrides).start,
            end: effectiveWeekRange(last.number, settings, overrides).end,
          }
        : { start: settings.roadmapStart, end: settings.roadmapStart };
    return {
      phase,
      status: phaseStatusFor(phase, weeks, taskStatus),
      progress: phaseTaskProgress(phase, weeks, taskStatus),
      range,
    };
  });

  const currentNumber = currentWeekNumber(todayISO, weeks, settings, overrides);
  const currentWeek = weeks.find((week) => week.number === currentNumber) ?? null;
  const currentPhase = currentWeek
    ? (phaseById.get(currentWeek.phaseId) ?? null)
    : null;
  const current =
    currentWeek && currentPhase
      ? {
          week: currentWeek,
          phase: currentPhase,
          range: effectiveWeekRange(currentWeek.number, settings, overrides),
        }
      : null;

  let done = 0;
  let blockedCount = 0;
  let pending = 0;
  for (const week of weeks) {
    for (const task of week.tasks) {
      const value = taskStatus[task.id] ?? "todo";
      if (value === "done") {
        done += 1;
      } else if (value === "blocked") {
        blockedCount += 1;
      } else if (value !== "skipped") {
        pending += 1;
      }
    }
  }

  const currentRange = current ? current.range : null;
  const time = {
    totalMinutes: sumMinutes(state.sessions),
    todayMinutes: sumMinutes(sessionsToday(state.sessions, todayISO)),
    thisWeekMinutes: currentRange
      ? sumMinutes(sessionsInRange(state.sessions, currentRange.start, currentRange.end))
      : 0,
    last7DaysMinutes: sumMinutes(
      sessionsInRange(state.sessions, addDays(todayISO, -6), todayISO),
    ),
  };

  const minutesByWeek = new Map<number, number>();
  let outsideMinutes = 0;
  for (const session of state.sessions) {
    const weekNumber = effectiveWeekFor(
      session.date,
      weeks,
      settings,
      overrides,
    );
    if (weekNumber === null) {
      outsideMinutes += session.minutes;
    } else {
      minutesByWeek.set(
        weekNumber,
        (minutesByWeek.get(weekNumber) ?? 0) + session.minutes,
      );
    }
  }
  const activityByWeek: DashboardModel["activityByWeek"] = [];
  const windowStart = Math.max(1, currentNumber - 7);
  for (let number = windowStart; number <= currentNumber; number += 1) {
    const minutes = minutesByWeek.get(number) ?? 0;
    if (minutes <= 0) {
      continue;
    }
    const range = effectiveWeekRange(number, settings, overrides);
    activityByWeek.push({
      weekNumber: number,
      minutes,
      label: `${range.start} → ${range.end}`,
    });
  }
  if (outsideMinutes > 0) {
    activityByWeek.push({ weekNumber: null, minutes: outsideMinutes, label: "" });
  }

  const blocked: DashboardModel["blocked"] = [];
  const milestones: DashboardModel["milestones"] = [];
  for (const week of weeks) {
    const note = state.weekBlockers[String(week.number)];
    const { end } = effectiveWeekRange(week.number, settings, overrides);
    for (const task of week.tasks) {
      const value = taskStatus[task.id] ?? "todo";
      if (value === "blocked") {
        blocked.push(note ? { task, weekNumber: week.number, note } : { task, weekNumber: week.number });
      }
      if (
        task.kind === "deliverable" &&
        value !== "done" &&
        value !== "skipped"
      ) {
        milestones.push({ task, week, weekEnd: end });
      }
    }
  }
  milestones.sort(
    (a, b) =>
      a.weekEnd.localeCompare(b.weekEnd) ||
      a.week.number - b.week.number ||
      a.task.id.localeCompare(b.task.id),
  );

  return {
    overall: overallTaskProgress(roadmap, taskStatus),
    weeks: { completed: completedWeekCount(roadmap, taskStatus), total: weeks.length },
    phases: phaseModels,
    current,
    taskCounts: { done, pending, blocked: blockedCount },
    time,
    activityByWeek,
    overdue: overdueTasks(roadmap, taskStatus, settings, overrides, todayISO),
    blocked,
    next: nextRecommendedTask(roadmap, taskStatus, settings, overrides, todayISO),
    milestones: milestones.slice(0, 3),
    issues: [...validateRoadmap(roadmap, settings, overrides), ...validateSessions(state.sessions, settings)],
  };
}
