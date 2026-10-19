import { describe, expect, it } from "vitest";
import { allPhases, allWeeks } from "@/data/phases";
import { resourceById, resources } from "@/data/resources";

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

  it("covers the entire roadmap: exactly 8 phases and 37 sequential weeks", () => {
    expect(allPhases).toHaveLength(8);
    expect(allWeeks).toHaveLength(37);

    const weekNumbers = allWeeks.map((w) => w.number).sort((a, b) => a - b);
    expect(weekNumbers).toEqual(Array.from({ length: 37 }, (_, i) => i + 1));

    const covered = allPhases
      .flatMap((p) => p.weekNumbers)
      .sort((a, b) => a - b);
    expect(covered).toEqual(Array.from({ length: 37 }, (_, i) => i + 1));

    for (const phase of allPhases) {
      expect(phase.objectives.length, phase.id).toBeGreaterThanOrEqual(2);
      expect(phase.weekNumbers.length, phase.id).toBeGreaterThan(0);
      const fromWeeks = allWeeks
        .filter((w) => w.phaseId === phase.id)
        .map((w) => w.number)
        .sort((a, b) => a - b);
      expect(fromWeeks, phase.id).toEqual(
        [...phase.weekNumbers].sort((a, b) => a - b),
      );
    }
  });

  it("contains no placeholder text in any authored week", () => {
    const serialized = JSON.stringify(allWeeks);
    expect(serialized).not.toMatch(/TODO|TBD|lorem|placeholder|xxx/i);
  });
});

describe("resource library", () => {
  it("has unique resource ids and a matching by-id index", () => {
    const ids = resources.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(resourceById).sort()).toEqual([...ids].sort());
  });

  it("includes the ten owner-vetted resources with their exact URLs and official flag", () => {
    const expected: Array<[string, string]> = [
      [
        "pytorch-basics",
        "https://docs.pytorch.org/tutorials/beginner/basics/intro.html",
      ],
      ["python-tutorial", "https://docs.python.org/3/tutorial/"],
      ["fastapi-tutorial", "https://fastapi.tiangolo.com/tutorial/"],
      [
        "postgresql-tutorial",
        "https://www.postgresql.org/docs/17/tutorial.html",
      ],
      ["nextjs-docs", "https://nextjs.org/docs/app"],
      [
        "hf-llm-course",
        "https://huggingface.co/learn/llm-course/en/chapter1/1",
      ],
      [
        "hf-agents-course",
        "https://huggingface.co/learn/agents-course/en/unit1/introduction",
      ],
      ["mlflow", "https://mlflow.org/docs/latest/ml/"],
      ["docker-get-started", "https://docs.docker.com/get-started/"],
      ["esp32-arduino", "https://github.com/espressif/arduino-esp32"],
    ];
    for (const [id, url] of expected) {
      expect(resourceById[id], id).toBeDefined();
      expect(resourceById[id]?.url, id).toBe(url);
      expect(resourceById[id]?.official, id).toBe(true);
    }
  });

  it("resolves every week-level and task-level resource reference", () => {
    for (const week of allWeeks) {
      for (const id of week.resourceIds) {
        expect(resourceById[id], `week ${week.number} -> ${id}`).toBeDefined();
      }
      for (const task of week.tasks) {
        for (const id of task.resourceIds) {
          expect(resourceById[id], `${task.id} -> ${id}`).toBeDefined();
        }
      }
    }
  });

  it("is fully referenced: every resource appears in the seed at least once", () => {
    const referenced = new Set<string>();
    for (const week of allWeeks) {
      week.resourceIds.forEach((id) => referenced.add(id));
      week.tasks.forEach((task) =>
        task.resourceIds.forEach((id) => referenced.add(id)),
      );
    }
    for (const resource of resources) {
      expect(referenced.has(resource.id), resource.id).toBe(true);
    }
  });

  it("derives weekNumbers from the weeks and tasks that reference each resource", () => {
    for (const resource of resources) {
      const weeks = new Set<number>();
      for (const week of allWeeks) {
        const usesWeek = week.resourceIds.includes(resource.id);
        const usesTask = week.tasks.some((t) =>
          t.resourceIds.includes(resource.id),
        );
        if (usesWeek || usesTask) {
          weeks.add(week.number);
        }
      }
      expect(
        [...resource.weekNumbers].sort((a, b) => a - b),
        resource.id,
      ).toEqual([...weeks].sort((a, b) => a - b));
    }
  });

  it("derives phaseIds from the mapped weeks and keeps titles and descriptions authored", () => {
    for (const resource of resources) {
      const phases = new Set<string>();
      for (const weekNumber of resource.weekNumbers) {
        const week = allWeeks.find((w) => w.number === weekNumber);
        expect(week, `${resource.id} -> week ${weekNumber}`).toBeDefined();
        if (week) {
          phases.add(week.phaseId);
        }
      }
      expect([...resource.phaseIds].sort(), resource.id).toEqual(
        [...phases].sort(),
      );
      expect(resource.title.trim().length, resource.id).toBeGreaterThan(0);
      expect(resource.description.trim().length, resource.id).toBeGreaterThan(
        0,
      );
      expect(resource.url, resource.id).toMatch(/^https:\/\//);
    }
  });
});
