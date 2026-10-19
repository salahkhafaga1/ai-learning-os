import { SegmentedControl } from "@/components/ui/segmented-control";
import type { TaskStatus } from "@/domain/types";
import { useT } from "@/lib/i18n";

const TASK_STATUSES = [
  "todo",
  "in_progress",
  "blocked",
  "done",
  "skipped",
] as const satisfies readonly TaskStatus[];

export interface StatusControlProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  label?: string;
}

export function StatusControl({ value, onChange, label }: StatusControlProps) {
  const { t } = useT();

  return (
    <SegmentedControl
      options={TASK_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      value={value}
      onChange={onChange}
      label={label ?? t("week.tasks")}
      className="flex-wrap"
    />
  );
}
