import type { Phase, Week } from "@/domain/types";
import type { PhaseBundle } from "./bundle";
import { phase1Bundle } from "./phase-1-pytorch";
import { phase2Bundle } from "./phase-2-python-backend";
import { phase3Bundle } from "./phase-3-nextjs";
import { phase4Bundle } from "./phase-4-llm-rag";
import { phase5Bundle } from "./phase-5-agentic";
import { phase6Bundle } from "./phase-6-mlops";
import { phase7Bundle } from "./phase-7-embedded-iot";
import { phase8Bundle } from "./phase-8-integration-portfolio";

const bundles: PhaseBundle[] = [
  phase1Bundle,
  phase2Bundle,
  phase3Bundle,
  phase4Bundle,
  phase5Bundle,
  phase6Bundle,
  phase7Bundle,
  phase8Bundle,
];

export const allPhases: Phase[] = bundles.map((bundle) => bundle.phase);
export const allWeeks: Week[] = bundles.flatMap((bundle) => bundle.weeks);
