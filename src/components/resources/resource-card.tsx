import Link from "next/link";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "@/components/ui/external-link";
import { Textarea } from "@/components/ui/field";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { allPhases } from "@/data/phases";
import type {
  Resource,
  ResourceStatus,
  ResourceUserState,
} from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";

const RESOURCE_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
] as const satisfies readonly ResourceStatus[];

const chipClasses =
  "inline-flex items-center rounded-full border border-edge bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2 transition-colors hover:border-accent/60 hover:text-ink";

const phaseById = new Map(allPhases.map((phase) => [phase.id, phase]));

export interface ResourceCardProps {
  resource: Resource;
  userState: ResourceUserState;
}

export function ResourceCard({ resource, userState }: ResourceCardProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const notesId = useId();
  const [notes, setNotes] = useState(userState.notes);
  const [saved, flash] = useSavedFlash();

  const setStatus = (status: ResourceStatus) => {
    dispatch({
      type: "resource/setState",
      resourceId: resource.id,
      value: {
        status,
        notes: userState.notes,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const commitNotes = () => {
    if (notes === userState.notes) {
      return;
    }
    dispatch({
      type: "resource/setState",
      resourceId: resource.id,
      value: {
        status: userState.status,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      },
    });
    flash();
  };

  const phases = resource.phaseIds.flatMap((phaseId) => {
    const phase = phaseById.get(phaseId);
    return phase ? [phase] : [];
  });

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{resource.title}</h3>
        <div className="flex flex-wrap items-center gap-1">
          <Badge tone="neutral">{t(`resourceKind.${resource.kind}`)}</Badge>
          {resource.official ? (
            <Badge tone="accent">{t("resources.official")}</Badge>
          ) : null}
        </div>
      </div>
      <p className="text-xs leading-6 text-ink-2">{resource.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {phases.map((phase) => (
          <Link
            key={phase.id}
            href={`/roadmap/${phase.id}`}
            className={chipClasses}
          >
            {phase.shortTitle}
          </Link>
        ))}
        {resource.weekNumbers.map((weekNumber) => (
          <Link
            key={weekNumber}
            href={`/week/${weekNumber}`}
            className={chipClasses}
          >
            {t("common.week", { n: weekNumber })}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-2">
          {t("resources.status")}
        </span>
        <SegmentedControl
          options={RESOURCE_STATUSES.map((status) => ({
            value: status,
            label: t(`resourceStatus.${status}`),
          }))}
          value={userState.status}
          onChange={setStatus}
          label={resource.title}
          className="flex-wrap"
        />
      </div>
      <div>
        <label
          htmlFor={notesId}
          className="mb-1 block text-xs font-medium text-ink-2"
        >
          {t("resources.notes")}
        </label>
        <Textarea
          id={notesId}
          rows={2}
          placeholder={t("resources.notes.placeholder")}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={commitNotes}
        />
        <SavedHint visible={saved} />
      </div>
      <div className="mt-auto">
        <ExternalLink href={resource.url} className="text-xs">
          {t("resources.openLink")}
        </ExternalLink>
      </div>
    </Card>
  );
}
