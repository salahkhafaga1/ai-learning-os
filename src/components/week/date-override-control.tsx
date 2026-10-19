import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { HelpText, Input } from "@/components/ui/field";
import type { RoadmapIssue } from "@/domain/validation";
import { useT, type Dict } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";

export interface DateOverrideControlProps {
  weekNumber: number;
  overrideISO?: string;
  conflicts: RoadmapIssue[];
}

export function DateOverrideControl({
  weekNumber,
  overrideISO,
  conflicts,
}: DateOverrideControlProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const hasOverride = typeof overrideISO === "string" && overrideISO.length > 0;

  return (
    <Card>
      <CardHeader title={t("week.dateOverride.title")} />
      <div className="flex flex-col gap-3 p-5">
        <HelpText className="mt-0">{t("week.dateOverride.hint")}</HelpText>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            aria-label={t("week.dateOverride.title")}
            value={overrideISO ?? ""}
            className="w-44"
            onChange={(event) => {
              const value = event.target.value;
              dispatch({
                type: "week/setDateOverride",
                weekNumber,
                startISO: value === "" ? null : value,
              });
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasOverride}
            onClick={() =>
              dispatch({
                type: "week/setDateOverride",
                weekNumber,
                startISO: null,
              })
            }
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            {t("week.dateOverride.reset")}
          </Button>
        </div>
        {conflicts.length > 0 ? (
          <ul className="flex flex-col gap-1.5 rounded-xl border border-warning/40 bg-warning/10 p-3">
            {conflicts.map((issue, index) => (
              <li
                key={`${issue.messageKey}-${index}`}
                className="text-xs leading-6 text-warning"
              >
                {t(`validation.${issue.messageKey}` as keyof Dict, issue.params)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
