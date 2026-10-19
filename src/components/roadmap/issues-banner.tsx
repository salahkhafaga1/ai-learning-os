import { TriangleAlert } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Card } from "@/components/ui/card";
import type { RoadmapIssue } from "@/domain/validation";
import { useT, type Dict } from "@/lib/i18n";

export interface IssuesBannerProps {
  issues: RoadmapIssue[];
  className?: string;
}

export function IssuesBanner({ issues, className }: IssuesBannerProps) {
  const { t } = useT();

  if (issues.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-warning/40 p-4", className)}>
      <ul className="flex flex-col gap-2">
        {issues.map((issue, index) => (
          <li
            key={`${issue.scope}-${issue.ref ?? "x"}-${issue.messageKey}-${index}`}
            className="flex items-start gap-2"
          >
            <TriangleAlert
              aria-hidden="true"
              className={cn(
                "mt-1 size-4 shrink-0",
                issue.severity === "error" ? "text-danger" : "text-warning",
              )}
            />
            <span className="text-xs leading-6 text-ink-2">
              {t(
                `validation.${issue.messageKey}` as keyof Dict,
                issue.params,
              )}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
