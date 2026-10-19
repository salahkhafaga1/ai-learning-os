import { CalendarRange, Target } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ProgressCount } from "@/domain/progress";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

export interface CurrentFocusCardProps {
  focus: DashboardModel["current"];
  progress: ProgressCount | null;
}

export function CurrentFocusCard({ focus, progress }: CurrentFocusCardProps) {
  const { t } = useT();

  if (!focus) {
    return (
      <Card className="p-5">
        <p className="text-sm text-muted">{t("dashboard.noCurrentWeek")}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t("dashboard.focus.title")}
        actions={
          <Link
            href={`/week/${focus.week.number}`}
            className="text-xs font-medium text-accent hover:underline"
          >
            {t("dashboard.next.openWeek")}
          </Link>
        }
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Target aria-hidden="true" className="size-4 text-accent" />
          <span className="text-lg font-semibold text-ink">
            {t("common.week", { n: focus.week.number })}
          </span>
          <Badge tone="accent">{focus.phase.shortTitle}</Badge>
        </div>
        <p className="text-sm text-ink-2">{focus.week.title}</p>
        <p className="inline-flex items-center gap-1 text-xs text-muted">
          <CalendarRange aria-hidden="true" className="size-3.5" />
          <span dir="ltr">
            {t("week.range", { start: focus.range.start, end: focus.range.end })}
          </span>
        </p>
        {progress ? (
          <div className="mt-auto flex flex-col gap-1.5">
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
        ) : null}
      </div>
    </Card>
  );
}
