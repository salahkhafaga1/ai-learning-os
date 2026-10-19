"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { roadmap } from "@/data/roadmap";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { selectDashboard } from "@/lib/state/selectors";
import { useTodayISO } from "@/lib/state/use-today";
import { IssuesBanner } from "./issues-banner";
import { PhaseCard } from "./phase-card";

const SKELETON_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"];

export function RoadmapView() {
  const { state, hydration } = useAppState();
  const today = useTodayISO();
  const { t } = useT();

  if (hydration !== "ready" || today === null) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const model = selectDashboard(roadmap, state, today);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("roadmap.title")}
        subtitle={t("roadmap.subtitle")}
      />
      <IssuesBanner issues={model.issues} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {model.phases.map((entry) => (
          <PhaseCard key={entry.phase.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
