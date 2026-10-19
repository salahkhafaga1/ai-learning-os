import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { Project } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";

export interface ProjectFormDialogProps {
  onClose: () => void;
  project?: Project;
}

export function ProjectFormDialog({ onClose, project }: ProjectFormDialogProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const id = useId();
  const editing = project !== undefined;

  const [name, setName] = useState(project?.name ?? "");
  const [tagline, setTagline] = useState(project?.tagline ?? "");
  const [problem, setProblem] = useState(project?.businessProblem ?? "");
  const [users, setUsers] = useState(project?.targetUsers ?? "");
  const [technologies, setTechnologies] = useState(
    project ? project.technologies.join(", ") : "",
  );
  const [repo, setRepo] = useState(project?.repoUrl ?? "");

  const nameEmpty = name.trim() === "";

  const submit = () => {
    if (nameEmpty) {
      return;
    }

    const next: Project = {
      id: project?.id ?? crypto.randomUUID(),
      name: name.trim(),
      tagline: tagline.trim(),
      businessProblem: problem.trim(),
      targetUsers: users.trim(),
      technologies: technologies
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
      status: project?.status ?? "proposed",
      milestones: project?.milestones ?? [],
      tasks: project?.tasks ?? [],
      evaluation: project?.evaluation ?? "",
      limitations: project?.limitations ?? [],
      deliverables: project?.deliverables ?? [],
      isSeedExample: project?.isSeedExample ?? false,
    };
    const repoUrl = repo.trim();
    if (repoUrl !== "") {
      next.repoUrl = repoUrl;
    }

    dispatch(
      editing
        ? { type: "project/update", project: next }
        : { type: "project/add", project: next },
    );
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={editing ? t("projects.form.editTitle") : t("projects.add")}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor={`${id}-name`}>{t("projects.form.name")}</Label>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-tagline`}>{t("projects.form.tagline")}</Label>
          <Input
            id={`${id}-tagline`}
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-problem`}>{t("projects.form.problem")}</Label>
          <Textarea
            id={`${id}-problem`}
            rows={2}
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-users`}>{t("projects.form.users")}</Label>
          <Textarea
            id={`${id}-users`}
            rows={2}
            value={users}
            onChange={(event) => setUsers(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-tech`}>
            {t("projects.form.technologies")}
          </Label>
          <Input
            id={`${id}-tech`}
            value={technologies}
            onChange={(event) => setTechnologies(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-repo`}>{t("projects.form.repo")}</Label>
          <Input
            id={`${id}-repo`}
            dir="ltr"
            value={repo}
            onChange={(event) => setRepo(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={nameEmpty}>
            {t("projects.form.submit")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
