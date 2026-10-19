"use client";

import { Award } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { defaultAssessment } from "@/data/seed";
import { skills } from "@/data/skills";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { SkillCard } from "./skill-card";

const LEVEL_VALUES = ["0", "1", "2", "3", "4", "5"] as const;

export function SkillsView() {
  const { state, hydration } = useAppState();
  const { t } = useT();

  if (hydration !== "ready") {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const assessments = skills.map(
    (skill) => state.skillAssessments[skill.id] ?? defaultAssessment(),
  );
  const counts = LEVEL_VALUES.map(
    (level) =>
      assessments.filter((assessment) => String(assessment.level) === level)
        .length,
  );
  const withEvidence = assessments.filter(
    (assessment) => assessment.evidence.trim() !== "",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-4">
        <div className="flex items-start gap-2">
          <Award
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-accent"
          />
          <p className="text-xs leading-6 text-ink-2">
            {t("skill.masteryBanner")}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title={t("skill.summary")} />
        <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-6">
          {LEVEL_VALUES.map((level, index) => (
            <div
              key={level}
              className="rounded-xl border border-edge bg-surface-2/40 p-3 text-center"
            >
              <div className="text-lg font-semibold text-ink">
                {counts[index]}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {t(`skill.level${level}`)}
              </div>
            </div>
          ))}
        </div>
        <p className="px-4 pb-4 text-xs text-muted">
          {t("skill.completedCount", { count: withEvidence })}
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            assessment={state.skillAssessments[skill.id] ?? defaultAssessment()}
          />
        ))}
      </div>
    </div>
  );
}
