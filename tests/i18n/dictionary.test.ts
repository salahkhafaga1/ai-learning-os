import { describe, expect, it } from "vitest";
import { ar } from "@/lib/i18n/ar";
import { en } from "@/lib/i18n/en";

function placeholderSet(template: string): string[] {
  return [...template.matchAll(/\{(\w+)\}/g)]
    .map((match) => match[1] ?? "")
    .sort();
}

describe("i18n dictionaries", () => {
  const arEntries = new Map(Object.entries(ar));
  const enEntries = new Map(Object.entries(en));

  it("has identical key sets in Arabic and English", () => {
    expect([...enEntries.keys()].sort()).toEqual([...arEntries.keys()].sort());
  });

  it("has non-empty values in both languages", () => {
    for (const [key, value] of arEntries) {
      expect(value.trim().length, `ar.${key}`).toBeGreaterThan(0);
    }
    for (const [key, value] of enEntries) {
      expect(value.trim().length, `en.${key}`).toBeGreaterThan(0);
    }
  });

  it("has no untranslated TODO markers in keys or values", () => {
    for (const [key, value] of [...arEntries, ...enEntries]) {
      expect(key, key).not.toMatch(/TODO/);
      expect(value, key).not.toMatch(/TODO/);
    }
  });

  it("uses identical interpolation placeholders per key", () => {
    for (const [key, arValue] of arEntries) {
      const enValue = enEntries.get(key) ?? "";
      expect(placeholderSet(arValue), key).toEqual(placeholderSet(enValue));
    }
  });

  it("covers every validation message key emitted by the domain layer", () => {
    const required = [
      "validation.roadmap_weeks_count",
      "validation.roadmap_weeks_sequence",
      "validation.target_before_roadmap_end",
      "validation.weekDateConflict",
      "validation.session_outside_period",
      "validation.task_outside_period",
    ];
    for (const key of required) {
      expect(arEntries.has(key), key).toBe(true);
      expect(enEntries.has(key), key).toBe(true);
    }
  });
});
