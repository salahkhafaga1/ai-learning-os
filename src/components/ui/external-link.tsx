import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function ExternalLink({
  href,
  children,
  showIcon = true,
  className,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-accent hover:text-accent-hover hover:underline",
        className,
      )}
    >
      <span>{children}</span>
      {showIcon ? (
        <ExternalLinkIcon aria-hidden="true" className="size-3.5 shrink-0" />
      ) : null}
    </a>
  );
}
