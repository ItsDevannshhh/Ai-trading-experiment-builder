import type { TradingExperiment } from "../types/experiment.types";
import type { Clarification } from "@/features/ai/schemas/clarification.schema";
import { validateExperiment } from "./validate-experiment";

export function applyClarification(
  experiment: TradingExperiment,
  clarification: Clarification
): TradingExperiment {
  // If the AI found the answer ambiguous, we do not update any fields.
  // The caller (UI) can check clarification.ambiguity to show a message.
  if (clarification.ambiguity) {
    return experiment;
  }

  const updated = { ...experiment };

  if (clarification.instrument !== null) {
    updated.instrument = clarification.instrument;
  }

  if (clarification.entryCondition !== null) {
    updated.entryCondition = clarification.entryCondition;
  }

  if (clarification.exitCondition !== null) {
    updated.exitCondition = clarification.exitCondition;
  }

  if (clarification.timeframe !== null) {
    updated.timeframe = clarification.timeframe;
  }

  if (clarification.holdingPeriod !== null) {
    updated.holdingPeriod = clarification.holdingPeriod;
  }

  if (clarification.filters !== null) {
    updated.filters = clarification.filters;
  }

  return validateExperiment(updated);
}
