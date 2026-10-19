import { CalendarDays, CalendarClock, Clock, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

export function StatGrid({ model }: { model: DashboardModel }) {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Gauge}
          label={t("dashboard.overall")}
          value={t("common.percent", { value: model.overall.percent })}
          hint={t("common.progress", {
            done: model.overall.completed,
            total: model.overall.eligible,
          })}
        />
        <Stat
          icon={CalendarDays}
          label={t("dashboard.weeksProgress")}
          value={t("common.progress", {
            done: model.weeks.completed,
            total: model.weeks.total,
          })}
        />
        <Stat
          icon={Clock}
          label={t("dashboard.stats.studyTime")}
          value={t("common.minutes", { minutes: model.time.totalMinutes })}
          hint={`${t("dashboard.stats.today")}: ${t("common.minutes", {
            minutes: model.time.todayMinutes,
          })}`}
        />
        <Stat
          icon={CalendarClock}
          label={t("dashboard.stats.last7")}
          value={t("common.minutes", { minutes: model.time.last7DaysMinutes })}
          hint={`${t("dashboard.stats.thisWeek")}: ${t("common.minutes", {
            minutes: model.time.thisWeekMinutes,
          })}`}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="success">
          {t("dashboard.tasks.done")}: {model.taskCounts.done}
        </Badge>
        <Badge tone="neutral">
          {t("dashboard.tasks.pending")}: {model.taskCounts.pending}
        </Badge>
        <Badge tone="danger">
          {t("dashboard.tasks.blocked")}: {model.taskCounts.blocked}
        </Badge>
      </div>
    </div>
  );
}
