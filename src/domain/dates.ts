import { DAYS_PER_WEEK, WEEK_COUNT } from "./constants";
import type { LangPref, Settings, Week } from "./types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

function toUTCEpoch(iso: string): number {
  if (!ISO_DATE_PATTERN.test(iso)) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  const [year, month, day] = iso.split("-").map(Number);
  const epoch = Date.UTC(year, month - 1, day);
  const check = new Date(epoch);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${iso}`);
  }
  return epoch;
}

function fromUTCEpoch(epoch: number): string {
  const d = new Date(epoch);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromISODate(iso: string): Date {
  const utc = new Date(toUTCEpoch(iso));
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso: string, days: number): string {
  return fromUTCEpoch(toUTCEpoch(iso) + days * MS_PER_DAY);
}

export function diffDays(aISO: string, bISO: string): number {
  return Math.round((toUTCEpoch(bISO) - toUTCEpoch(aISO)) / MS_PER_DAY);
}

export function weekRange(
  weekNumber: number,
  startISO: string,
): { start: string; end: string } {
  const start = addDays(startISO, DAYS_PER_WEEK * (weekNumber - 1));
  return { start, end: addDays(start, DAYS_PER_WEEK - 1) };
}

export function effectiveWeekStart(
  weekNumber: number,
  settings: Settings,
  overrides: Record<string, string>,
): string {
  return (
    overrides[String(weekNumber)] ??
    weekRange(weekNumber, settings.roadmapStart).start
  );
}

export function effectiveWeekRange(
  weekNumber: number,
  settings: Settings,
  overrides: Record<string, string>,
): { start: string; end: string } {
  const start = effectiveWeekStart(weekNumber, settings, overrides);
  return { start, end: addDays(start, DAYS_PER_WEEK - 1) };
}

export function weekNumberFor(
  dateISO: string,
  startISO: string,
): number | null {
  const offset = diffDays(startISO, dateISO);
  if (offset < 0) {
    return null;
  }
  const weekNumber = Math.floor(offset / DAYS_PER_WEEK) + 1;
  return weekNumber <= WEEK_COUNT ? weekNumber : null;
}

export function effectiveWeekFor(
  dateISO: string,
  weeks: Week[],
  settings: Settings,
  overrides: Record<string, string>,
): number | null {
  const ordered = [...weeks].sort((a, b) => a.number - b.number);
  for (const week of ordered) {
    const range = effectiveWeekRange(week.number, settings, overrides);
    if (dateISO >= range.start && dateISO <= range.end) {
      return week.number;
    }
  }
  return null;
}

export function currentWeekNumber(
  todayISO: string,
  weeks: Week[],
  settings: Settings,
  overrides: Record<string, string>,
): number {
  const containing = effectiveWeekFor(todayISO, weeks, settings, overrides);
  if (containing !== null) {
    return containing;
  }
  const ordered = [...weeks].sort((a, b) => a.number - b.number);
  for (const week of ordered) {
    if (effectiveWeekStart(week.number, settings, overrides) > todayISO) {
      return week.number;
    }
  }
  return WEEK_COUNT;
}

export function isWithinRoadmap(
  dateISO: string,
  startISO: string,
  targetEndISO: string,
): boolean {
  return dateISO >= startISO && dateISO <= targetEndISO;
}

export function formatDate(iso: string, lang: LangPref): string {
  const locale = lang === "ar" ? "ar-u-nu-latn" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fromISODate(iso));
}

export function formatRange(
  startISO: string,
  endISO: string,
  lang: LangPref,
): string {
  return `${formatDate(startISO, lang)} – ${formatDate(endISO, lang)}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}
