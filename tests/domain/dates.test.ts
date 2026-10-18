import { describe, expect, it } from "vitest";
import {
  addDays,
  currentWeekNumber,
  diffDays,
  effectiveWeekFor,
  effectiveWeekRange,
  effectiveWeekStart,
  formatDate,
  formatRange,
  fromISODate,
  isWithinRoadmap,
  todayISO,
  toISODate,
  weekNumberFor,
  weekRange,
} from "@/domain/dates";
import type { Settings, Week } from "@/domain/types";

const START = "2026-10-20";
const TARGET_END = "2027-07-05";

const settings: Settings = {
  roadmapStart: START,
  roadmapTargetEnd: TARGET_END,
  theme: "dark",
  language: "ar",
};

function testWeek(number: number): Week {
  return {
    number,
    phaseId: "phase-1",
    title: `الأسبوع ${number}`,
    objectives: [],
    topics: [],
    exercises: [],
    deliverables: [],
    masteryCriteria: [],
    tasks: [],
    resourceIds: [],
  };
}

const weeks = Array.from({ length: 37 }, (_, i) => testWeek(i + 1));

describe("fromISODate / toISODate", () => {
  it("round-trips a valid ISO date", () => {
    expect(toISODate(fromISODate("2026-10-20"))).toBe("2026-10-20");
    expect(toISODate(fromISODate("2027-07-05"))).toBe("2027-07-05");
  });

  it("throws on malformed or impossible dates", () => {
    expect(() => fromISODate("nope")).toThrow();
    expect(() => fromISODate("2026-13-01")).toThrow();
    expect(() => fromISODate("2026-02-30")).toThrow();
    expect(() => fromISODate("2026-10-20T00:00:00Z")).toThrow();
  });
});

describe("weekRange", () => {
  it("computes week 1 as start … start + 6", () => {
    expect(weekRange(1, START)).toEqual({
      start: "2026-10-20",
      end: "2026-10-26",
    });
  });

  it("computes week 37 ending exactly on the target date", () => {
    expect(weekRange(37, START)).toEqual({
      start: "2027-06-29",
      end: TARGET_END,
    });
  });
});

describe("weekNumberFor", () => {
  it("maps boundary dates to the right week", () => {
    expect(weekNumberFor("2026-10-19", START)).toBeNull();
    expect(weekNumberFor("2026-10-20", START)).toBe(1);
    expect(weekNumberFor("2026-10-26", START)).toBe(1);
    expect(weekNumberFor("2026-10-27", START)).toBe(2);
    expect(weekNumberFor("2027-07-05", START)).toBe(37);
    expect(weekNumberFor("2027-07-06", START)).toBeNull();
  });

  it("survives a DST-crossing range without off-by-one", () => {
    // Europe/DST: 2027-03-28; US/DST: 2027-03-14 — both inside week 23.
    expect(weekNumberFor("2027-03-27", START)).toBe(23);
    expect(weekNumberFor("2027-03-29", START)).toBe(23);
  });
});

describe("addDays / diffDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDays("2026-10-20", 0)).toBe("2026-10-20");
  });

  it("counts whole days including leap-February of 2027 (non-leap)", () => {
    expect(diffDays("2026-10-20", "2027-07-05")).toBe(258);
    expect(diffDays("2027-02-01", "2027-03-01")).toBe(28);
    expect(diffDays("2027-03-01", "2027-02-01")).toBe(-28);
  });

  it("is DST-proof (UTC-normalized)", () => {
    expect(diffDays("2027-03-27", "2027-03-29")).toBe(2);
    expect(diffDays("2027-10-29", "2027-11-01")).toBe(3);
  });
});

describe("effective week ranges", () => {
  it("returns the override when present, derived otherwise", () => {
    expect(effectiveWeekStart(2, settings, {})).toBe("2026-10-27");
    expect(effectiveWeekStart(2, settings, { "2": "2026-10-28" })).toBe(
      "2026-10-28",
    );
    expect(effectiveWeekRange(2, settings, { "2": "2026-10-28" })).toEqual({
      start: "2026-10-28",
      end: "2026-11-03",
    });
  });
});

describe("effectiveWeekFor (override-aware, D13)", () => {
  it("finds the week containing a date", () => {
    expect(effectiveWeekFor("2026-10-20", weeks, settings, {})).toBe(1);
    expect(effectiveWeekFor("2027-07-05", weeks, settings, {})).toBe(37);
    expect(effectiveWeekFor("2026-10-19", weeks, settings, {})).toBeNull();
    expect(effectiveWeekFor("2027-07-06", weeks, settings, {})).toBeNull();
  });

  it("follows an override-shifted week", () => {
    // week 2 shifted one day later: 2026-10-28 … 2026-11-03
    expect(
      effectiveWeekFor("2026-11-03", weeks, settings, { "2": "2026-10-28" }),
    ).toBe(2);
  });

  it("returns null for dates inside a created gap", () => {
    // week 2 pushed to 2026-11-05 → gap 2026-10-27 … 2026-11-04
    expect(
      effectiveWeekFor("2026-11-01", weeks, settings, { "2": "2026-11-05" }),
    ).toBeNull();
  });

  it("resolves overlaps to the lower week number", () => {
    // week 2 pulled back to 2026-10-25 → overlaps week 1 on 2026-10-25/26
    expect(
      effectiveWeekFor("2026-10-25", weeks, settings, { "2": "2026-10-25" }),
    ).toBe(1);
    expect(
      effectiveWeekFor("2026-10-27", weeks, settings, { "2": "2026-10-25" }),
    ).toBe(2);
  });
});

describe("currentWeekNumber (override-aware)", () => {
  it("returns the containing week", () => {
    expect(currentWeekNumber("2026-10-20", weeks, settings, {})).toBe(1);
    expect(currentWeekNumber("2027-07-05", weeks, settings, {})).toBe(37);
  });

  it("returns the next week for a gap date", () => {
    expect(
      currentWeekNumber("2026-11-01", weeks, settings, { "2": "2026-11-05" }),
    ).toBe(2);
  });

  it("clamps before and after the roadmap", () => {
    expect(currentWeekNumber("2026-01-01", weeks, settings, {})).toBe(1);
    expect(currentWeekNumber("2030-01-01", weeks, settings, {})).toBe(37);
  });
});

describe("isWithinRoadmap", () => {
  it("checks the inclusive roadmap window", () => {
    expect(isWithinRoadmap("2026-10-19", START, TARGET_END)).toBe(false);
    expect(isWithinRoadmap("2026-10-20", START, TARGET_END)).toBe(true);
    expect(isWithinRoadmap("2027-07-05", START, TARGET_END)).toBe(true);
    expect(isWithinRoadmap("2027-07-06", START, TARGET_END)).toBe(false);
  });
});

describe("formatDate / formatRange", () => {
  it("formats Arabic with Latin digits (no Arabic-Indic digits)", () => {
    const out = formatDate("2026-10-20", "ar");
    expect(out).toMatch(/\d/);
    expect(out).not.toMatch(/[\u0660-\u0669]/);
  });

  it("formats English with Latin digits", () => {
    const out = formatDate("2027-07-05", "en");
    expect(out).toMatch(/\d/);
  });

  it("joins a range with an en dash between both formatted dates", () => {
    expect(formatRange(START, "2026-10-26", "ar")).toBe(
      `${formatDate(START, "ar")} – ${formatDate("2026-10-26", "ar")}`,
    );
  });
});

describe("todayISO", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
