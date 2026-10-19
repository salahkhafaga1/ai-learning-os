import { Flag } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

export function MilestonesPanel({
  items,
}: {
  items: DashboardModel["milestones"];
}) {
  const { t } = useT();

  return (
    <Card>
      <CardHeader title={t("dashboard.milestones.title")} />
      <div className="p-5">
        {items.length === 0 ? (
          <p className="text-sm text-muted">
            {t("dashboard.milestones.empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.task.id} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Flag
                    aria-hidden="true"
                    className="size-4 shrink-0 text-accent"
                  />
                  <span className="text-sm text-ink">{item.task.title}</span>
                </div>
                <Link
                  href={`/week/${item.week.number}`}
                  className="text-xs text-muted hover:text-accent hover:underline"
                >
                  {t("common.week", { n: item.week.number })} ·{" "}
                  <span dir="ltr">{item.weekEnd}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
