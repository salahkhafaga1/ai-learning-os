import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-4 w-full animate-pulse rounded-lg bg-surface-2", className)}
    />
  );
}
