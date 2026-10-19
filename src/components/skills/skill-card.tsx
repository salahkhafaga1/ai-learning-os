import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { Skill, SkillAssessment } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";

type LevelValue = "0" | "1" | "2" | "3" | "4" | "5";

const LEVEL_VALUES = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
] as const satisfies readonly LevelValue[];

function formatUpdatedAt(iso: string): string {
  return `\u2066${iso.slice(0, 16).replace("T", " ")}\u2069`;
}

export interface SkillCardProps {
  skill: Skill;
  assessment: SkillAssessment;
}

export function SkillCard({ skill, assessment }: SkillCardProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const id = useId();
  const [level, setLevel] = useState<LevelValue>(
    String(assessment.level) as LevelValue,
  );
  const [evidence, setEvidence] = useState(assessment.evidence);
  const [notes, setNotes] = useState(assessment.notes);
  const [nextGoal, setNextGoal] = useState(assessment.nextGoal);
  const [saved, flash] = useSavedFlash();

  const evidenceEmpty = evidence.trim() === "";
  const blocked = level === "5" && evidenceEmpty;
  const dirty =
    level !== String(assessment.level) ||
    evidence !== assessment.evidence ||
    notes !== assessment.notes ||
    nextGoal !== assessment.nextGoal;

  const save = () => {
    if (blocked || !dirty) {
      return;
    }
    dispatch({
      type: "skill/setAssessment",
      skillId: skill.id,
      assessment: {
        level: Number(level) as SkillAssessment["level"],
        evidence: evidence.trim(),
        notes: notes.trim(),
        nextGoal: nextGoal.trim(),
        updatedAt: new Date().toISOString(),
      },
    });
    flash();
  };

  return (
    <Card>
      <CardHeader title={skill.name} subtitle={skill.description} />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1.5">
          <SegmentedControl
            options={LEVEL_VALUES.map((value) => ({
              value,
              label: t(`skill.level${value}`),
            }))}
            value={level}
            onChange={(value) => setLevel(value)}
            label={t("skills.title")}
            disabledValues={evidenceEmpty ? (["5"] as const) : undefined}
            className="flex-wrap"
          />
          {evidenceEmpty ? (
            <p className="text-[11px] text-muted">{t("skill.guardHint")}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${id}-evidence`}>{t("skill.evidenceLabel")}</Label>
          <Textarea
            id={`${id}-evidence`}
            rows={2}
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-notes`}>{t("skill.notesLabel")}</Label>
          <Textarea
            id={`${id}-notes`}
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-goal`}>{t("skill.nextGoalLabel")}</Label>
          <Input
            id={`${id}-goal`}
            value={nextGoal}
            onChange={(event) => setNextGoal(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={blocked || !dirty}>
            {t("skill.save")}
          </Button>
          <SavedHint visible={saved} />
          {assessment.updatedAt !== "" ? (
            <span className="text-xs text-muted">
              {t("common.updatedAt", {
                date: formatUpdatedAt(assessment.updatedAt),
              })}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
