import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import { useT } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";

export interface WeekNotesProps {
  weekNumber: number;
  initialNote: string;
}

export function WeekNotes({ weekNumber, initialNote }: WeekNotesProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const [note, setNote] = useState(initialNote);
  const [saved, flash] = useSavedFlash();

  return (
    <Card className="h-full">
      <CardHeader
        title={t("week.notes.title")}
        actions={<SavedHint visible={saved} />}
      />
      <div className="p-5">
        <Textarea
          value={note}
          rows={5}
          placeholder={t("week.notes.placeholder")}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => {
            if (note !== initialNote) {
              dispatch({ type: "week/setNote", weekNumber, text: note });
              flash();
            }
          }}
        />
      </div>
    </Card>
  );
}

export interface WeekBlockerProps {
  weekNumber: number;
  initialBlocker: string;
}

export function WeekBlocker({ weekNumber, initialBlocker }: WeekBlockerProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const [blocker, setBlocker] = useState(initialBlocker);
  const [saved, flash] = useSavedFlash();

  return (
    <Card className="h-full">
      <CardHeader
        title={t("week.blocker.title")}
        actions={<SavedHint visible={saved} />}
      />
      <div className="p-5">
        <Textarea
          value={blocker}
          rows={5}
          placeholder={t("week.blocker.placeholder")}
          onChange={(event) => setBlocker(event.target.value)}
          onBlur={() => {
            if (blocker !== initialBlocker) {
              dispatch({ type: "week/setBlocker", weekNumber, text: blocker });
              flash();
            }
          }}
        />
      </div>
    </Card>
  );
}
