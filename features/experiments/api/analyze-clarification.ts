import type { TradingExperiment, ExperimentField } from "../types/experiment.types";
import type { Clarification } from "@/features/ai/schemas/clarification.schema";

export async function analyzeClarification(
  experiment: TradingExperiment,
  field: ExperimentField,
  answer: string,
  ambiguity?: string
): Promise<Clarification> {
  const response = await fetch("/api/experiments/clarify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ experiment, field, answer, ambiguity }),
  });

  if (!response.ok) {
    throw new Error("Failed to clarify experiment");
  }

  const data = await response.json();
  return data.clarification;
}
