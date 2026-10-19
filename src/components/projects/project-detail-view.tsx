"use client";

import { FolderKanban, Plus, X } from "lucide-react";
import { useState } from "react";
import { IssuesBanner } from "@/components/roadmap/issues-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ExternalLink } from "@/components/ui/external-link";
import { Input, Textarea } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusControl } from "@/components/ui/status-control";
import type {
  Project,
  ProjectMilestone,
  ProjectStatus,
  TaskStatus,
} from "@/domain/types";
import { validateProjectTaskDates } from "@/domain/validation";
import { useT } from "@/lib/i18n";
import { useAppDispatch, useAppState } from "@/lib/state/provider";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectStatusBadge } from "./project-card";

const PROJECT_STATUSES = [
  "proposed",
  "planned",
  "in_progress",
  "paused",
  "completed",
] as const satisfies readonly ProjectStatus[];

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

function BlurEditor({
  value,
  rows = 4,
  onCommit,
}: {
  value: string;
  rows?: number;
  onCommit: (next: string) => void;
}) {
  const [text, setText] = useState(value);
  const [saved, flash] = useSavedFlash();

  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        rows={rows}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          if (text !== value) {
            onCommit(text);
            flash();
          }
        }}
      />
      <SavedHint visible={saved} />
    </div>
  );
}

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { t } = useT();
  const { state, hydration } = useAppState();

  if (hydration !== "ready") {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
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

  return <ProjectDetailContent key={project.id} project={project} />;
}

function ProjectDetailContent({ project }: { project: Project }) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const { state } = useAppState();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const [newMilestoneDue, setNewMilestoneDue] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  const update = (patch: Partial<Project>) => {
    dispatch({ type: "project/update", project: { ...project, ...patch } });
  };

  const done = project.tasks.filter((task) => task.status === "done").length;
  const total = project.tasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const taskIssues = validateProjectTaskDates(
    state.projects,
    state.settings,
  ).filter((issue) => issue.params?.projectId === project.id);

  const toggleMilestone = (id: string, doneFlag: boolean) => {
    update({
      milestones: project.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, done: doneFlag } : milestone,
      ),
    });
  };

  const setMilestoneDue = (id: string, due: string) => {
    update({
      milestones: project.milestones.map((milestone) => {
        if (milestone.id !== id) {
          return milestone;
        }
        const next = { ...milestone };
        if (due === "") {
          delete next.dueDate;
        } else {
          next.dueDate = due;
        }
        return next;
      }),
    });
  };

  const removeMilestone = (id: string) => {
    update({
      milestones: project.milestones.filter(
        (milestone) => milestone.id !== id,
      ),
    });
  };

  const addMilestone = () => {
    const title = newMilestone.trim();
    if (title === "") {
      return;
    }
    const milestone: ProjectMilestone = {
      id: crypto.randomUUID(),
      title,
      done: false,
    };
    if (newMilestoneDue !== "") {
      milestone.dueDate = newMilestoneDue;
    }
    update({ milestones: [...project.milestones, milestone] });
    setNewMilestone("");
    setNewMilestoneDue("");
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    update({
      tasks: project.tasks.map((task) =>
        task.id === id ? { ...task, status } : task,
      ),
    });
  };

  const setTaskDue = (id: string, due: string) => {
    update({
      tasks: project.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }
        const next = { ...task };
        if (due === "") {
          delete next.dueDate;
        } else {
          next.dueDate = due;
        }
        return next;
      }),
    });
  };

  const removeTask = (id: string) => {
    update({
      tasks: project.tasks.filter((task) => task.id !== id),
    });
  };

  const addTask = () => {
    const title = newTask.trim();
    if (title === "") {
      return;
    }
    const task: Project["tasks"][number] = {
      id: crypto.randomUUID(),
      title,
      status: "todo",
    };
    if (newTaskDue !== "") {
      task.dueDate = newTaskDue;
    }
    update({ tasks: [...project.tasks, task] });
    setNewTask("");
    setNewTaskDue("");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-ink">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.tagline !== "" ? (
              <p className="text-sm leading-7 text-ink-2">{project.tagline}</p>
            ) : null}
            {project.status === "proposed" ? (
              <p className="text-xs font-medium text-warning">
                {t("projectStatus.proposedHint")}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              {t("common.edit")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <SegmentedControl
            options={PROJECT_STATUSES.map((status) => ({
              value: status,
              label: t(`projectStatus.${status}`),
            }))}
            value={project.status}
            onChange={(status) => update({ status })}
            label={project.name}
            className="flex-wrap"
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>{t("projects.progress", { done, total })}</span>
            <span>{t("common.percent", { value: percent })}</span>
          </div>
          <ProgressBar
            value={done}
            max={total}
            label={t("projects.progress", { done, total })}
          />
        </div>

        {project.technologies.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1">
            {project.technologies.map((tech) => (
              <Badge key={tech} tone="neutral">
                {tech}
              </Badge>
            ))}
          </div>
        ) : null}

        {project.repoUrl ? (
          <div className="mt-4">
            <ExternalLink href={project.repoUrl}>
              {t("projects.repo")}
            </ExternalLink>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("projects.businessProblem")} />
          <p className="p-4 text-sm leading-7 text-ink-2">
            {project.businessProblem !== "" ? project.businessProblem : "—"}
          </p>
        </Card>
        <Card>
          <CardHeader title={t("projects.targetUsers")} />
          <p className="p-4 text-sm leading-7 text-ink-2">
            {project.targetUsers !== "" ? project.targetUsers : "—"}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader title={t("projects.milestones")} />
        <div className="flex flex-col gap-3 p-4">
          {project.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-edge p-3"
            >
              <input
                type="checkbox"
                checked={milestone.done}
                onChange={(event) =>
                  toggleMilestone(milestone.id, event.target.checked)
                }
                aria-label={milestone.title}
                className="size-4 shrink-0 accent-accent"
              />
              <span
                className={cn(
                  "text-sm",
                  milestone.done ? "text-muted line-through" : "text-ink-2",
                )}
              >
                {milestone.title}
              </span>
              <div className="ms-auto flex items-center gap-2">
                <div className="w-40 shrink-0">
                  <Input
                    type="date"
                    value={milestone.dueDate ?? ""}
                    onChange={(event) =>
                      setMilestoneDue(milestone.id, event.target.value)
                    }
                    aria-label={t("projects.milestone.due")}
                  />
                </div>
                <IconButton
                  icon={X}
                  label={t("common.delete")}
                  size="sm"
                  onClick={() => removeMilestone(milestone.id)}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-edge p-3">
            <div className="min-w-40 flex-1">
              <Input
                value={newMilestone}
                onChange={(event) => setNewMilestone(event.target.value)}
                placeholder={t("projects.milestones.add")}
                aria-label={t("projects.milestones.add")}
              />
            </div>
            <div className="w-40 shrink-0">
              <Input
                type="date"
                value={newMilestoneDue}
                onChange={(event) => setNewMilestoneDue(event.target.value)}
                aria-label={t("projects.milestone.due")}
              />
            </div>
            <Button
              variant="secondary"
              onClick={addMilestone}
              disabled={newMilestone.trim() === ""}
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("common.add")}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={t("projects.tasks")} />
        <div className="flex flex-col gap-3 p-4">
          <IssuesBanner issues={taskIssues} />
          {project.tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-xl border border-edge p-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-ink">
                  {task.title}
                </span>
                {task.dueDate ? (
                  <span className="text-[11px] text-muted">
                    {t("projects.task.due", {
                      date: `\u2066${task.dueDate}\u2069`,
                    })}
                  </span>
                ) : null}
                <div className="ms-auto flex items-center gap-2">
                  <div className="w-40 shrink-0">
                    <Input
                      type="date"
                      value={task.dueDate ?? ""}
                      onChange={(event) =>
                        setTaskDue(task.id, event.target.value)
                      }
                      aria-label={t("projects.milestone.due")}
                    />
                  </div>
                  <IconButton
                    icon={X}
                    label={t("common.delete")}
                    size="sm"
                    onClick={() => removeTask(task.id)}
                  />
                </div>
              </div>
              <StatusControl
                value={task.status}
                onChange={(status) => setTaskStatus(task.id, status)}
                label={task.title}
              />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-edge p-3">
            <div className="min-w-40 flex-1">
              <Input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder={t("projects.tasks.add")}
                aria-label={t("projects.tasks.add")}
              />
            </div>
            <div className="w-40 shrink-0">
              <Input
                type="date"
                value={newTaskDue}
                onChange={(event) => setNewTaskDue(event.target.value)}
                aria-label={t("projects.milestone.due")}
              />
            </div>
            <Button
              variant="secondary"
              onClick={addTask}
              disabled={newTask.trim() === ""}
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("common.add")}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("projects.evaluation")} />
          <div className="p-4">
            <BlurEditor
              value={project.evaluation}
              onCommit={(next) => update({ evaluation: next })}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title={t("projects.limitations")} />
          <div className="p-4">
            <BlurEditor
              value={project.limitations.join("\n")}
              onCommit={(next) => update({ limitations: splitLines(next) })}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title={t("projects.deliverables")} />
          <div className="p-4">
            <BlurEditor
              value={project.deliverables.join("\n")}
              onCommit={(next) => update({ deliverables: splitLines(next) })}
            />
          </div>
        </Card>
      </div>

      {editOpen ? (
        <ProjectFormDialog project={project} onClose={() => setEditOpen(false)} />
      ) : null}

      {deleteOpen ? (
        <Dialog
          open
          onClose={() => setDeleteOpen(false)}
          title={t("projects.delete.confirm")}
          actions={
            <>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  dispatch({
                    type: "project/delete",
                    projectId: project.id,
                  });
                  setDeleteOpen(false);
                }}
              >
                {t("common.delete")}
              </Button>
            </>
          }
        >
          {project.isSeedExample ? (
            <p className="text-xs leading-6 text-warning">
              {t("projects.seedWarning")}
            </p>
          ) : (
            <p className="text-xs leading-6 text-ink-2">{project.name}</p>
          )}
        </Dialog>
      ) : null}
    </div>
  );
}
