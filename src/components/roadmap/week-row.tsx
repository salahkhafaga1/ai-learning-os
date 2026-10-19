import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProgressCount } from "@/domain/progress";
import type { PhaseStatus, Week } from "@/domain/types";
import { useT } from "@/lib/i18n";

export interface WeekRowProps {
  week: Week;
  range: { start: string; end: string };
  progress: ProgressCount;
  status: PhaseStatus;
}

export function WeekRow({ week, range, progress, status }: WeekRowProps) {
  const { t } = useT();

  return (
    <Link
      href={`/week/${week.number}`}
      className="flex flex-col gap-2 rounded-xl border border-edge p-3 transition-colors hover:border-accent/50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{t("common.week", { n: week.number })}</Badge>
        <span className="flex-1 text-sm font-medium text-ink">{week.title}</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span dir="ltr" className="text-xs text-muted">
          {t("week.range", { start: range.start, end: range.end })}
        </span>
        <div className="min-w-32 flex-1">
          <ProgressBar
            value={progress.completed}
            max={progress.eligible}
            label={t("week.tasks")}
          />
        </div>
        <span className="text-xs text-muted">
          {t("week.progress", {
            done: progress.completed,
            total: progress.eligible,
          })}
        </span>
      </div>
    </Link>
  );
}
