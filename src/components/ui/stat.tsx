import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function Stat({ label, value, hint, icon: Icon, className }: StatProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-edge bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{label}</span>
        {Icon ? (
          <Icon aria-hidden="true" className="size-4 text-muted" />
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
