"use client";

import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { t } = useT();
  const { state, hydration } = useAppState();

  if (hydration === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const project = state.projects.find(
    (candidate) => candidate.id === projectId,
  );

  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title={t("projects.notFound.title")}
        body={t("projects.notFound.body")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
      <p className="text-sm text-muted">{project.tagline}</p>
    </div>
  );
}
