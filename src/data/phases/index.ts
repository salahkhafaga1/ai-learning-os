import type { Phase, Week } from "@/domain/types";
import type { PhaseBundle } from "./bundle";
import { phase1Bundle } from "./phase-1-pytorch";
import { phase2Bundle } from "./phase-2-python-backend";
import { phase3Bundle } from "./phase-3-nextjs";
import { phase4Bundle } from "./phase-4-llm-rag";
import { phase5Bundle } from "./phase-5-agentic";
import { phase6Bundle } from "./phase-6-mlops";

const bundles: PhaseBundle[] = [
  phase1Bundle,
  phase2Bundle,
  phase3Bundle,
  phase4Bundle,
  phase5Bundle,
  phase6Bundle,
];

export const allPhases: Phase[] = bundles.map((bundle) => bundle.phase);
export const allWeeks: Week[] = bundles.flatMap((bundle) => bundle.weeks);
