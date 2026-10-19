import type { Phase, Week } from "@/domain/types";
import type { PhaseBundle } from "./bundle";
import { phase1Bundle } from "./phase-1-pytorch";
import { phase2Bundle } from "./phase-2-python-backend";
import { phase3Bundle } from "./phase-3-nextjs";
import { phase4Bundle } from "./phase-4-llm-rag";

const bundles: PhaseBundle[] = [
  phase1Bundle,
  phase2Bundle,
  phase3Bundle,
  phase4Bundle,
];

export const allPhases: Phase[] = bundles.map((bundle) => bundle.phase);
export const allWeeks: Week[] = bundles.flatMap((bundle) => bundle.weeks);
