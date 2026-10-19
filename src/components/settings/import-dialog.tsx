import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import type { ImportSummary } from "@/lib/storage/export-import";

export interface ImportDialogProps {
  summary: ImportSummary;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImportDialog({
  summary,
  onCancel,
  onConfirm,
}: ImportDialogProps) {
  const { t } = useT();

  return (
    <Dialog
      open
      onClose={onCancel}
      title={t("settings.import.confirmTitle")}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onConfirm}>{t("common.confirm")}</Button>
        </>
      }
    >
      <p className="text-xs leading-6 text-ink-2">
        {t("settings.import.confirmBody", {
          tasks: summary.tasksWithStatus,
          sessions: summary.sessions,
          skills: summary.skillsAssessed,
        })}
      </p>
      {summary.sessionDateRange ? (
        <p className="mt-2 text-xs text-muted">
          <span dir="ltr">{summary.sessionDateRange}</span>
        </p>
      ) : null}
    </Dialog>
  );
}
