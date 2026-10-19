import { CalendarCheck, CalendarRange, Clock } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import { useT } from "@/lib/i18n";

export interface TotalsStripProps {
  todayMinutes: number;
  weekMinutes: number;
  allMinutes: number;
}

export function TotalsStrip({
  todayMinutes,
  weekMinutes,
  allMinutes,
}: TotalsStripProps) {
  const { t } = useT();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        icon={CalendarCheck}
        label={t("log.totals.today")}
        value={t("common.minutes", { minutes: todayMinutes })}
      />
      <Stat
        icon={CalendarRange}
        label={t("log.totals.thisWeek")}
        value={t("common.minutes", { minutes: weekMinutes })}
      />
      <Stat
        icon={Clock}
        label={t("log.totals.allTime")}
        value={t("common.minutes", { minutes: allMinutes })}
      />
    </div>
  );
}
