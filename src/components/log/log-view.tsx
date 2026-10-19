"use client";

import { NotebookPen, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { allWeeks } from "@/data/phases";
import {
  currentWeekNumber,
  effectiveWeekRange,
  formatDate,
} from "@/domain/dates";
import type { ActivityType, StudySession } from "@/domain/types";
import { validateSessions } from "@/domain/validation";
import { useT, type Dict } from "@/lib/i18n";
import { useAppDispatch, useAppState } from "@/lib/state/provider";
import {
  sessionsInRange,
  sessionsToday,
  sumMinutes,
} from "@/lib/state/selectors";
import { useTodayISO } from "@/lib/state/use-today";
import { SessionCard } from "./session-card";
import { SessionForm } from "./session-form";
import { TotalsStrip } from "./totals-strip";

const ACTIVITY_TYPES = [
  "reading",
  "coding",
  "debugging",
  "project",
  "review",
] as const satisfies readonly ActivityType[];

export function LogView() {
  const { state, hydration } = useAppState();
  const dispatch = useAppDispatch();
  const today = useTodayISO();
  const { t, lang } = useT();
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">(
    "all",
  );

  if (hydration !== "ready" || today === null) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const sessions = state.sessions;
  const todayMinutes = sumMinutes(sessionsToday(sessions, today));
  const weekNumber = currentWeekNumber(
    today,
    allWeeks,
    state.settings,
    state.weekDateOverrides,
  );
  const weekRange = effectiveWeekRange(
    weekNumber,
    state.settings,
    state.weekDateOverrides,
  );
  const weekMinutes = sumMinutes(
    sessionsInRange(sessions, weekRange.start, weekRange.end),
  );
  const allMinutes = sumMinutes(sessions);
  const issues = validateSessions(sessions, state.settings);

  const query = search.trim().toLowerCase();
  const filtered = sessions
    .filter(
      (session) =>
        activityFilter === "all" || session.activity === activityFilter,
    )
    .filter(
      (session) =>
        query === "" ||
        [
          session.topic,
          session.learned,
          session.implemented,
          session.questions,
        ].some((field) => field.toLowerCase().includes(query)),
    );

  const byDay = new Map<string, StudySession[]>();
  for (const session of filtered) {
    const list = byDay.get(session.date);
    if (list) {
      list.push(session);
    } else {
      byDay.set(session.date, [session]);
    }
  }
  const days = [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(
      ([date, list]) =>
        [
          date,
          [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        ] as const,
    );

  return (
    <div className="flex flex-col gap-6">
      <TotalsStrip
        todayMinutes={todayMinutes}
        weekMinutes={weekMinutes}
        allMinutes={allMinutes}
      />

      <Card>
        <CardHeader title={t("log.add")} />
        <div className="p-5">
          <SessionForm
            defaultDate={today}
            onSubmit={(values) =>
              dispatch({
                type: "session/add",
                session: {
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  ...values,
                },
              })
            }
          />
        </div>
      </Card>

      {issues.length > 0 ? (
        <Card className="border-warning/40 p-4">
          <div className="flex items-start gap-2">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-warning"
            />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-warning">
                {t("log.warning.outsidePeriod")}
              </p>
              {issues.map((issue, index) => (
                <p
                  key={issue.ref ?? index}
                  className="text-xs leading-6 text-warning"
                >
                  {t(`validation.${issue.messageKey}` as keyof Dict, issue.params)}
                </p>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader title={t("log.list.title")} />
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="log-search">{t("common.search")}</Label>
              <Input
                id="log-search"
                value={search}
                placeholder={t("log.filter.search")}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="log-activity">{t("log.filter.activity")}</Label>
              <Select
                id="log-activity"
                value={activityFilter}
                onChange={(event) =>
                  setActivityFilter(event.target.value as ActivityType | "all")
                }
              >
                <option value="all">{t("common.all")}</option>
                {ACTIVITY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(`activity.${value}`)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title={t("log.list.empty")}
              body={t("log.list.emptyBody")}
            />
          ) : days.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              {t("common.noResults")}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {days.map(([date, daySessions]) => (
                <div key={date} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ink-2">
                      {formatDate(date, lang)}
                    </span>
                    <span className="text-xs text-muted">
                      {t("log.dayTotal", {
                        minutes: sumMinutes(daySessions),
                      })}
                    </span>
                  </div>
                  {daySessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
