"use client";

import { ArrowLeft, ArrowRight, CalendarRange, ListTodo } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExternalLink } from "@/components/ui/external-link";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { allPhases, allWeeks } from "@/data/phases";
import { roadmap } from "@/data/roadmap";
import { resourceById } from "@/data/resources";
import { effectiveWeekRange } from "@/domain/dates";
import {
  overdueTasks,
  weekStatusFor,
  weekTaskProgress,
} from "@/domain/progress";
import type { Resource } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch, useAppState } from "@/lib/state/provider";
import { useTodayISO } from "@/lib/state/use-today";
import { TaskRow } from "./task-row";

const NAV_LINK_CLASS =
  "inline-flex h-8 items-center gap-1 rounded-lg border border-edge bg-surface-2 px-3 text-xs font-medium text-ink transition-colors hover:border-accent/60";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 p-5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-ink-2">
          <span aria-hidden="true" className="text-accent">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader title={title} />
      <BulletList items={items} />
    </Card>
  );
}

export function WeekView({ weekNumber }: { weekNumber: number }) {
  const { state, hydration } = useAppState();
  const dispatch = useAppDispatch();
  const today = useTodayISO();
  const { t } = useT();

  if (hydration !== "ready" || today === null) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const week = allWeeks.find((candidate) => candidate.number === weekNumber);
  if (!week) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted">{t("notFound.title")}</p>
        <Link
          href="/roadmap"
          className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
        >
          {t("nav.roadmap")}
        </Link>
      </Card>
    );
  }

  const phase = allPhases.find((candidate) => candidate.id === week.phaseId);
  const range = effectiveWeekRange(
    week.number,
    state.settings,
    state.weekDateOverrides,
  );
  const progress = weekTaskProgress(week, state.taskStatus);
  const status = weekStatusFor(week, state.taskStatus);
  const overdueIds = new Set(
    overdueTasks(
      roadmap,
      state.taskStatus,
      state.settings,
      state.weekDateOverrides,
      today,
    )
      .filter((entry) => entry.weekNumber === week.number)
      .map((entry) => entry.task.id),
  );
  const resources = week.resourceIds
    .map((id) => resourceById[id])
    .filter((resource): resource is Resource => Boolean(resource));
  const prevWeek = weekNumber > 1 ? weekNumber - 1 : null;
  const nextWeek = weekNumber < allWeeks.length ? weekNumber + 1 : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.week", { n: week.number })}
        subtitle={week.title}
        actions={
          <>
            {prevWeek !== null ? (
              <Link href={`/week/${prevWeek}`} className={NAV_LINK_CLASS}>
                <ArrowRight aria-hidden="true" className="size-3.5" />
                {t("week.prevWeek")}
              </Link>
            ) : null}
            {nextWeek !== null ? (
              <Link href={`/week/${nextWeek}`} className={NAV_LINK_CLASS}>
                {t("week.nextWeek")}
                <ArrowLeft aria-hidden="true" className="size-3.5" />
              </Link>
            ) : null}
          </>
        }
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {phase ? (
            <Link
              href={`/roadmap/${phase.id}`}
              className="text-xs font-medium text-accent hover:underline"
            >
              {t("common.phase", { n: phase.number })} · {phase.shortTitle}
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <CalendarRange aria-hidden="true" className="size-3.5" />
            <span dir="ltr">{t("week.range", range)}</span>
          </span>
          <StatusBadge status={status} />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <ProgressBar
            value={progress.completed}
            max={progress.eligible}
            label={t("week.tasks")}
          />
          <span className="text-xs text-muted">
            {t("week.progress", {
              done: progress.completed,
              total: progress.eligible,
            })}
          </span>
        </div>
      </Card>

      <Card>
        <CardHeader title={t("week.tasks")} />
        <div className="flex flex-col gap-3 p-5">
          {week.tasks.length === 0 ? (
            <EmptyState icon={ListTodo} title={t("week.noEligibleTasks")} />
          ) : (
            <>
              {progress.eligible === 0 ? (
                <p className="rounded-xl border border-dashed border-edge bg-surface-2/40 p-3 text-center text-xs text-muted">
                  {t("week.noEligibleTasks")}
                </p>
              ) : null}
              <ul className="flex flex-col gap-2">
                {week.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    status={state.taskStatus[task.id] ?? "todo"}
                    overdue={overdueIds.has(task.id)}
                    onStatusChange={(next) =>
                      dispatch({
                        type: "task/setStatus",
                        taskId: task.id,
                        status: next,
                      })
                    }
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title={t("week.topics")} />
        <div className="flex flex-wrap gap-1.5 p-5">
          {week.topics.map((topic) => (
            <Badge key={topic} tone="neutral">
              {topic}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("week.objectives")} items={week.objectives} />
        <SectionCard title={t("week.mastery")} items={week.masteryCriteria} />
        <SectionCard title={t("week.exercises")} items={week.exercises} />
        <SectionCard title={t("week.deliverables")} items={week.deliverables} />
      </div>

      {resources.length > 0 ? (
        <Card>
          <CardHeader title={t("week.resources")} />
          <ul className="flex flex-col">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex flex-col gap-1 border-b border-edge p-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ExternalLink
                    href={resource.url}
                    className="text-sm font-medium"
                  >
                    {resource.title}
                  </ExternalLink>
                  <Badge tone="neutral">
                    {t(`resourceKind.${resource.kind}`)}
                  </Badge>
                  {resource.official ? (
                    <Badge tone="accent">{t("resources.official")}</Badge>
                  ) : null}
                </div>
                <p className="text-xs leading-6 text-muted">
                  {resource.description}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
