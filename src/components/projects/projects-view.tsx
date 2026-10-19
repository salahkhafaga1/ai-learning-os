"use client";

import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { ProjectCard } from "./project-card";
import { ProjectFormDialog } from "./project-form-dialog";

export function ProjectsView() {
  const { state, hydration } = useAppState();
  const { t } = useT();
  const [addOpen, setAddOpen] = useState(false);

  if (hydration !== "ready") {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-10 w-40" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" className="size-4" />
          {t("projects.add")}
        </Button>
      </div>

      {state.projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("projects.empty")}
          body={t("projects.emptyBody")}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {addOpen ? (
        <ProjectFormDialog onClose={() => setAddOpen(false)} />
      ) : null}
    </div>
  );
}
