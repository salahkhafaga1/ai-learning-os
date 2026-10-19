import type { Phase, Task, TaskKind } from "@/domain/types";
import type { Week } from "@/domain/types";

export interface PhaseBundle {
  phase: Phase;
  weeks: Week[];
}

export function makeTask(
  id: string,
  weekNumber: number,
  title: string,
  kind: TaskKind,
  effortMinutes: number,
  resourceIds: string[] = [],
): Task {
  return { id, weekNumber, title, kind, effortMinutes, resourceIds };
}
