"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { roadmap } from "@/data/roadmap";
import { weekTaskProgress } from "@/domain/progress";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { selectDashboard } from "@/lib/state/selectors";
import { useTodayISO } from "@/lib/state/use-today";
import { BlockersPanel } from "./blockers-panel";
import { CurrentFocusCard } from "./current-focus-card";
import { MilestonesPanel } from "./milestones-panel";
import { NextTaskCard } from "./next-task-card";
import { OverduePanel } from "./overdue-panel";
import { StatGrid } from "./stat-grid";
import { WeeklyActivityChart } from "./weekly-activity-chart";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

export function DashboardView() {
  const { state, hydration } = useAppState();
  const today = useTodayISO();
  const { t } = useT();

  if (hydration !== "ready" || today === null) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const model = selectDashboard(roadmap, state, today);
  const focusProgress = model.current
    ? weekTaskProgress(model.current.week, state.taskStatus)
    : null;
  const isFresh = state.sessions.length === 0 && model.overall.completed === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("dashboard.title")} />

      {isFresh ? (
        <Card className="border-accent/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                {t("dashboard.onboarding.title")}
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">
                {t("dashboard.onboarding.body")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/log"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-accent px-3 text-xs font-medium text-app transition-colors hover:bg-accent-hover"
              >
                {t("dashboard.onboarding.cta")}
              </Link>
              {model.current ? (
                <Link
                  href={`/week/${model.current.week.number}`}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-edge bg-surface-2 px-3 text-xs font-medium text-ink transition-colors hover:border-accent/60"
                >
                  {t("common.week", { n: model.current.week.number })}
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      <StatGrid model={model} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CurrentFocusCard focus={model.current} progress={focusProgress} />
        <NextTaskCard next={model.next} />
      </div>

      <WeeklyActivityChart buckets={model.activityByWeek} />

      <div className="grid gap-4 lg:grid-cols-3">
        <OverduePanel items={model.overdue} />
        <BlockersPanel items={model.blocked} />
        <MilestonesPanel items={model.milestones} />
      </div>
    </div>
  );
}
