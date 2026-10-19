import { ArrowLeft, CalendarRange } from "lucide-react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { PhaseStatus } from "@/domain/types";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

const STATUS_TONE: Record<PhaseStatus, BadgeTone> = {
  not_started: "neutral",
  in_progress: "accent",
  blocked: "danger",
  completed: "success",
};

export function PhaseCard({
  entry,
}: {
  entry: DashboardModel["phases"][number];
}) {
  const { t } = useT();
  const { phase, status, progress, range } = entry;

  return (
    <Card className="flex flex-col">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{t("common.phase", { n: phase.number })}</Badge>
          <span dir="ltr" className="text-xs text-muted">
            {phase.shortTitle}
          </span>
          <Badge tone={STATUS_TONE[status]} className="ms-auto">
            {t(`phaseStatus.${status}`)}
          </Badge>
        </div>
        <Link
          href={`/roadmap/${phase.id}`}
          className="text-base font-semibold text-ink transition-colors hover:text-accent"
        >
          {phase.title}
        </Link>
        <p className="inline-flex items-center gap-1 text-xs text-muted">
          <CalendarRange aria-hidden="true" className="size-3.5" />
          <span dir="ltr">
            {t("week.range", { start: range.start, end: range.end })}
          </span>
        </p>
        <p className="text-xs text-muted">
          {t("roadmap.weeks", { count: phase.weekNumbers.length })}
        </p>
        <ul className="flex flex-col gap-1">
          {phase.objectives.slice(0, 2).map((objective) => (
            <li
              key={objective}
              className="flex gap-1.5 text-xs leading-6 text-ink-2"
            >
              <span aria-hidden="true" className="text-accent">
                •
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-1.5 pt-2">
          <ProgressBar
            value={progress.completed}
            max={progress.eligible}
            label={t("dashboard.overall")}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted">
              {t("common.progress", {
                done: progress.completed,
                total: progress.eligible,
              })}
            </span>
            <Link
              href={`/roadmap/${phase.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              {t("roadmap.openPhase")}
              <ArrowLeft aria-hidden="true" className="size-3.5 ltr:-scale-x-100" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
