"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { WEEK_COUNT } from "@/domain/constants";
import { weekRange } from "@/domain/dates";
import { useT } from "@/lib/i18n";
import { useAppDispatch, useAppState } from "@/lib/state/provider";

export function ScheduleSection() {
  const { t } = useT();
  const { state } = useAppState();
  const dispatch = useAppDispatch();
  const { roadmapStart, roadmapTargetEnd } = state.settings;

  const computedEnd = weekRange(WEEK_COUNT, roadmapStart).end;
  const targetBeforeEnd =
    roadmapTargetEnd !== "" && roadmapTargetEnd < computedEnd;

  return (
    <Card>
      <CardHeader
        title={t("settings.roadmap")}
        subtitle={t("settings.roadmapHint")}
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="settings-roadmap-start">
              {t("settings.roadmapStart")}
            </Label>
            <Input
              id="settings-roadmap-start"
              type="date"
              dir="ltr"
              value={roadmapStart}
              onChange={(event) => {
                if (event.target.value !== "") {
                  dispatch({
                    type: "settings/patch",
                    patch: { roadmapStart: event.target.value },
                  });
                }
              }}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="settings-roadmap-target">
              {t("settings.roadmapTargetEnd")}
            </Label>
            <Input
              id="settings-roadmap-target"
              type="date"
              dir="ltr"
              value={roadmapTargetEnd}
              onChange={(event) => {
                if (event.target.value !== "") {
                  dispatch({
                    type: "settings/patch",
                    patch: { roadmapTargetEnd: event.target.value },
                  });
                }
              }}
            />
          </div>
        </div>
        <p className="text-xs text-muted">
          {t("settings.computedEnd", {
            date: `\u2066${computedEnd}\u2069`,
          })}
        </p>
        {targetBeforeEnd ? (
          <p className="flex items-start gap-2 text-xs leading-6 text-warning">
            <TriangleAlert
              aria-hidden="true"
              className="mt-1 size-4 shrink-0"
            />
            <span>
              {t("validation.target_before_roadmap_end", {
                targetEnd: `\u2066${roadmapTargetEnd}\u2069`,
                computedEnd: `\u2066${computedEnd}\u2069`,
              })}
            </span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}
