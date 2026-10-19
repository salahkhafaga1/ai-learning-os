import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon: LucideIcon;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md";
}

const variantClasses = {
  ghost: "text-muted hover:bg-surface-2 hover:text-ink",
  secondary:
    "border border-edge bg-surface-2 text-ink-2 hover:border-accent/60 hover:text-ink",
} as const;

const sizeClasses = {
  sm: "size-8 [&>svg]:size-4",
  md: "size-10 [&>svg]:size-5",
} as const;

export function IconButton({
  label,
  icon: Icon,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}
