import type { BadgeTone } from "./badge";
import { Badge } from "./badge";
import type { PhaseStatus } from "@/domain/types";
import { useT } from "@/lib/i18n";

const STATUS_TONE: Record<PhaseStatus, BadgeTone> = {
  not_started: "neutral",
  in_progress: "accent",
  blocked: "danger",
  completed: "success",
};

export function StatusBadge({ status }: { status: PhaseStatus }) {
  const { t } = useT();
  return <Badge tone={STATUS_TONE[status]}>{t(`phaseStatus.${status}`)}</Badge>;
}
