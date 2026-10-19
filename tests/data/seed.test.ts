import { describe, expect, it } from "vitest";
import { allPhases, allWeeks } from "@/data/phases";

const NON_EMPTY = (value: string) => value.trim().length > 0;

describe("seed integrity", () => {
  it("has no duplicate week numbers and they are contiguous from 1", () => {
    const numbers = allWeeks.map((w) => w.number).sort((a, b) => a - b);
    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
    expect(numbers).toEqual(
      Array.from({ length: numbers.length }, (_, i) => i + 1),
    );
  });

  it("resolves every week's phaseId to an authored phase", () => {
    const phaseIds = new Set(allPhases.map((p) => p.id));
    for (const week of allWeeks) {
      expect(phaseIds.has(week.phaseId), `week ${week.number}`).toBe(true);
    }
  });

  it("has unique week ids across phases", () => {
    const phaseIds = allPhases.map((p) => p.id);
    expect(new Set(phaseIds).size).toBe(phaseIds.length);
  });

  it("has globally unique task ids, consistent week numbers, and sane effort", () => {
    const taskIds = allWeeks.flatMap((w) => w.tasks.map((t) => t.id));
    expect(new Set(taskIds).size).toBe(taskIds.length);
    for (const week of allWeeks) {
      for (const task of week.tasks) {
        expect(task.weekNumber, task.id).toBe(week.number);
        expect(task.effortMinutes, task.id).toBeGreaterThanOrEqual(20);
        expect(task.effortMinutes, task.id).toBeLessThanOrEqual(600);
        expect(NON_EMPTY(task.title), task.id).toBe(true);
      }
    }
  });

  it("meets the per-week content requirements for every authored week", () => {
    for (const week of allWeeks) {
      const label = `week ${week.number}`;
      expect(NON_EMPTY(week.title), label).toBe(true);
      expect(week.objectives.length, label).toBeGreaterThanOrEqual(2);
      expect(week.topics.length, label).toBeGreaterThanOrEqual(3);
      expect(week.tasks.length, label).toBeGreaterThanOrEqual(3);
      expect(week.exercises.length, label).toBeGreaterThanOrEqual(1);
      expect(week.deliverables.length, label).toBeGreaterThanOrEqual(1);
      expect(week.masteryCriteria.length, label).toBeGreaterThanOrEqual(2);
      expect(week.resourceIds.length, label).toBeGreaterThanOrEqual(1);

      const kinds = week.tasks.map((t) => t.kind);
      expect(kinds, label).toContain("exercise");
      expect(kinds, label).toContain("deliverable");

      for (const list of [
        week.objectives,
        week.topics,
        week.exercises,
        week.deliverables,
        week.masteryCriteria,
      ]) {
        for (const item of list) {
          expect(NON_EMPTY(item), label).toBe(true);
        }
      }

      expect(new Set(week.resourceIds).size, label).toBe(
        week.resourceIds.length,
      );
    }
  });

  it("contains no placeholder text in any authored week", () => {
    const serialized = JSON.stringify(allWeeks);
    expect(serialized).not.toMatch(/TODO|TBD|lorem|placeholder|xxx/i);
  });
});
