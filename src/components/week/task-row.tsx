import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import type { Task, TaskStatus } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { ResourceChips } from "./resource-chips";
import { StatusControl } from "@/components/ui/status-control";

export interface TaskRowProps {
  task: Task;
  status: TaskStatus;
  overdue: boolean;
  onStatusChange: (status: TaskStatus) => void;
}

export function TaskRow({
  task,
  status,
  overdue,
  onStatusChange,
}: TaskRowProps) {
  const { t } = useT();
  const done = status === "done";
  const skipped = status === "skipped";

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-edge bg-surface-2/40 p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={skipped}
          onChange={(event) =>
            onStatusChange(event.target.checked ? "done" : "todo")
          }
          aria-label={done ? t("week.task.markTodo") : t("week.task.markDone")}
          className="mt-0.5 size-4 shrink-0 accent-accent disabled:opacity-40"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-sm",
                done || skipped ? "text-muted line-through" : "text-ink",
              )}
            >
              {task.title}
            </span>
            {overdue ? (
              <Badge tone="danger">{t("week.task.overdue")}</Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Badge tone="neutral">{t(`kind.${task.kind}`)}</Badge>
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" />
              {t("week.task.effort", { minutes: task.effortMinutes })}
            </span>
          </div>
          <ResourceChips resourceIds={task.resourceIds} />
        </div>
      </div>
      <StatusControl value={status} onChange={onStatusChange} />
    </li>
  );
}
