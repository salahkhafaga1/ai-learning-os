import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "@/components/ui/external-link";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Project, ProjectStatus } from "@/domain/types";
import { useT } from "@/lib/i18n";

const PROJECT_STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  proposed: "neutral",
  planned: "accent",
  in_progress: "warning",
  paused: "danger",
  completed: "success",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useT();
  return (
    <Badge tone={PROJECT_STATUS_TONE[status]}>
      {t(`projectStatus.${status}`)}
    </Badge>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useT();
  const done = project.tasks.filter((task) => task.status === "done").length;
  const total = project.tasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm font-semibold text-ink hover:text-accent"
        >
          {project.name}
        </Link>
        <ProjectStatusBadge status={project.status} />
      </div>
      {project.status === "proposed" ? (
        <p className="-mt-1 text-[11px] font-medium text-warning">
          {t("projectStatus.proposedHint")}
        </p>
      ) : null}
      {project.tagline !== "" ? (
        <p className="text-xs leading-6 text-ink-2">{project.tagline}</p>
      ) : null}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <span>{t("projects.progress", { done, total })}</span>
          <span>{t("common.percent", { value: percent })}</span>
        </div>
        <ProgressBar
          value={done}
          max={total}
          label={t("projects.progress", { done, total })}
          className="mt-1.5"
        />
      </div>
      {project.technologies.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {project.technologies.map((tech) => (
            <Badge key={tech} tone="neutral">
              {tech}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        {project.repoUrl ? (
          <ExternalLink href={project.repoUrl} className="text-xs">
            {t("projects.repo")}
          </ExternalLink>
        ) : (
          <span aria-hidden="true" />
        )}
        <Link
          href={`/projects/${project.id}`}
          className="text-xs font-medium text-accent hover:underline"
        >
          {t("common.view")}
        </Link>
      </div>
    </Card>
  );
}
