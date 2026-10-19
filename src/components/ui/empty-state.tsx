import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-edge bg-surface p-8 text-center",
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-6 text-muted" /> : null}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {body ? (
        <p className="max-w-sm text-xs leading-6 text-muted">{body}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
