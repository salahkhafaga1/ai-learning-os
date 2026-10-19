import type { Phase, Week } from "@/domain/types";
import type { PhaseBundle } from "./bundle";
import { phase1Bundle } from "./phase-1-pytorch";
import { phase2Bundle } from "./phase-2-python-backend";

const bundles: PhaseBundle[] = [phase1Bundle, phase2Bundle];

export const allPhases: Phase[] = bundles.map((bundle) => bundle.phase);
export const allWeeks: Week[] = bundles.flatMap((bundle) => bundle.weeks);
