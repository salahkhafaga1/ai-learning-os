import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import type { DashboardModel } from "@/lib/state/selectors";

export function BlockersPanel({
  items,
}: {
  items: DashboardModel["blocked"];
}) {
  const { t } = useT();

  return (
    <Card>
      <CardHeader title={t("dashboard.blockers.title")} />
      <div className="p-5">
        {items.length === 0 ? (
          <p className="text-sm text-muted">{t("dashboard.blockers.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.task.id} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldAlert
                    aria-hidden="true"
                    className="size-4 shrink-0 text-danger"
                  />
                  <span className="text-sm text-ink">{item.task.title}</span>
                </div>
                <Link
                  href={`/week/${item.weekNumber}`}
                  className="text-xs text-accent hover:underline"
                >
                  {t("common.week", { n: item.weekNumber })}
                </Link>
                {item.note ? (
                  <p className="text-xs leading-6 text-muted">{item.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
