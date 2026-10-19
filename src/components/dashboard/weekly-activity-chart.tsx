import { Card, CardHeader } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

export function WeeklyActivityChart({
  buckets,
}: {
  buckets: DashboardModel["activityByWeek"];
}) {
  const { t } = useT();
  const max = Math.max(1, ...buckets.map((bucket) => bucket.minutes));

  return (
    <Card>
      <CardHeader title={t("dashboard.activity.title")} />
      <div className="p-5">
        {buckets.length === 0 ? (
          <p className="text-sm text-muted">{t("dashboard.activity.empty")}</p>
        ) : (
          <div className="flex items-end gap-2 sm:gap-3">
            {buckets.map((bucket) => {
              const percent = Math.max(
                4,
                Math.round((bucket.minutes / max) * 100),
              );
              const name =
                bucket.weekNumber === null
                  ? t("dashboard.activity.outside")
                  : t("common.week", { n: bucket.weekNumber });
              const tooltip = [
                name,
                bucket.label,
                t("common.minutes", { minutes: bucket.minutes }),
              ]
                .filter((part) => part.length > 0)
                .join(" · ");
              return (
                <div
                  key={bucket.weekNumber ?? "outside"}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[11px] font-medium text-ink-2">
                    {t("common.minutesShort", { minutes: bucket.minutes })}
                  </span>
                  <div className="flex h-32 w-full items-end">
                    <div
                      role="img"
                      aria-label={tooltip}
                      title={tooltip}
                      className="w-full rounded-t-md bg-accent/80 transition-colors hover:bg-accent"
                      style={{ height: `${percent}%` }}
                    />
                  </div>
                  <span className="w-full truncate text-center text-[11px] text-muted">
                    {bucket.weekNumber ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
