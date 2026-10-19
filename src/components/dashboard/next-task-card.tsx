import { ArrowLeft, ListChecks } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

export function NextTaskCard({ next }: { next: DashboardModel["next"] }) {
  const { t } = useT();

  return (
    <Card className="flex flex-col">
      <CardHeader title={t("dashboard.next.title")} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {next ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <ListChecks aria-hidden="true" className="size-4 text-accent" />
              <span className="text-sm font-medium text-ink">
                {next.task.title}
              </span>
              <Badge tone="neutral">{t(`kind.${next.task.kind}`)}</Badge>
            </div>
            <p className="text-xs text-muted">
              {t("common.week", { n: next.week.number })} ·{" "}
              {next.phase.shortTitle} ·{" "}
              {t("week.task.effort", { minutes: next.task.effortMinutes })}
            </p>
            <div className="mt-auto">
              <Link
                href={`/week/${next.week.number}`}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-accent px-3 text-xs font-medium text-app transition-colors hover:bg-accent-hover"
              >
                {t("dashboard.next.openWeek")}
                <ArrowLeft aria-hidden="true" className="size-3.5 ltr:-scale-x-100" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">{t("dashboard.next.empty")}</p>
        )}
      </div>
    </Card>
  );
}
