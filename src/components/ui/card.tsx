import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Card({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-edge bg-surface", className)}
      {...rest}
    />
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-edge px-4 py-3",
        className,
      )}
    >
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
