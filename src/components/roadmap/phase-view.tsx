"use client";

import { ArrowLeft, ArrowRight, CalendarRange } from "lucide-react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { roadmap } from "@/data/roadmap";
import { effectiveWeekRange } from "@/domain/dates";
import {
  phaseStatusFor,
  phaseTaskProgress,
  weekStatusFor,
  weekTaskProgress,
} from "@/domain/progress";
import type { PhaseStatus } from "@/domain/types";
import { validateRoadmap } from "@/domain/validation";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { IssuesBanner } from "./issues-banner";
import { WeekRow } from "./week-row";

const STATUS_TONE: Record<PhaseStatus, BadgeTone> = {
  not_started: "neutral",
  in_progress: "accent",
  blocked: "danger",
  completed: "success",
};

const NAV_LINK_CLASS =
  "inline-flex h-8 items-center gap-1 rounded-lg border border-edge bg-surface-2 px-3 text-xs font-medium text-ink transition-colors hover:border-accent/60";

export function PhaseView({ phaseId }: { phaseId: string }) {
  const { state, hydration } = useAppState();
  const { t } = useT();

  if (hydration !== "ready") {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const phase = roadmap.phases.find((candidate) => candidate.id === phaseId);
  if (!phase) {
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

  const phaseIndex = roadmap.phases.findIndex(
    (candidate) => candidate.id === phase.id,
  );
  const prevPhase = phaseIndex > 0 ? roadmap.phases[phaseIndex - 1] : null;
  const nextPhase =
    phaseIndex < roadmap.phases.length - 1
      ? roadmap.phases[phaseIndex + 1]
      : null;

  const phaseWeeks = [...roadmap.weeks]
    .filter((week) => week.phaseId === phase.id)
    .sort((a, b) => a.number - b.number);
  const { settings, weekDateOverrides: overrides } = state;
  const first = phaseWeeks[0];
  const last = phaseWeeks[phaseWeeks.length - 1];
  const range =
    first && last
      ? {
          start: effectiveWeekRange(first.number, settings, overrides).start,
          end: effectiveWeekRange(last.number, settings, overrides).end,
        }
      : { start: settings.roadmapStart, end: settings.roadmapStart };
  const status = phaseStatusFor(phase, roadmap.weeks, state.taskStatus);
  const progress = phaseTaskProgress(phase, roadmap.weeks, state.taskStatus);

  const weekNumbers = new Set(phaseWeeks.map((week) => week.number));
  const issues = validateRoadmap(roadmap, settings, overrides).filter(
    (issue) =>
      issue.scope === "roadmap" ||
      (issue.scope === "week" &&
        typeof issue.ref === "number" &&
        weekNumbers.has(issue.ref)),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={phase.title}
        subtitle={`${t("common.phase", { n: phase.number })} · ${phase.shortTitle}`}
        actions={
          <>
            {prevPhase ? (
              <Link href={`/roadmap/${prevPhase.id}`} className={NAV_LINK_CLASS}>
                <ArrowRight aria-hidden="true" className="size-3.5" />
                {t("phase.prevPhase")}
              </Link>
            ) : null}
            {nextPhase ? (
              <Link href={`/roadmap/${nextPhase.id}`} className={NAV_LINK_CLASS}>
                {t("phase.nextPhase")}
                <ArrowLeft aria-hidden="true" className="size-3.5" />
              </Link>
            ) : null}
          </>
        }
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[status]}>{t(`phaseStatus.${status}`)}</Badge>
          <span className="text-xs text-muted">
            {t("roadmap.weeks", { count: phaseWeeks.length })}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <CalendarRange aria-hidden="true" className="size-3.5" />
            <span dir="ltr">{t("week.range", range)}</span>
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink-2">{phase.description}</p>
        <div className="mt-4 flex flex-col gap-1.5">
          <ProgressBar
            value={progress.completed}
            max={progress.eligible}
            label={t("dashboard.overall")}
          />
          <span className="text-xs text-muted">
            {t("common.progress", {
              done: progress.completed,
              total: progress.eligible,
            })}
          </span>
        </div>
      </Card>

      <IssuesBanner issues={issues} />

      <Card>
        <CardHeader title={t("phase.objectives")} />
        <ul className="flex flex-col gap-2 p-5">
          {phase.objectives.map((objective) => (
            <li
              key={objective}
              className="flex gap-2 text-sm leading-6 text-ink-2"
            >
              <span aria-hidden="true" className="text-accent">
                •
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title={t("phase.weeksTable")} />
        <div className="flex flex-col gap-2 p-5">
          {phaseWeeks.map((week) => (
            <WeekRow
              key={week.number}
              week={week}
              range={effectiveWeekRange(week.number, settings, overrides)}
              progress={weekTaskProgress(week, state.taskStatus)}
              status={weekStatusFor(week, state.taskStatus)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
