import { generateObject } from "ai";
import { CLARIFICATION_SYSTEM_PROMPT } from "@/features/ai/prompts/clarification.prompt";
import { aiProvider } from "@/features/ai/server/provider";
import { clarificationSchema } from "@/features/ai/schemas/clarification.schema";
import type { TradingExperiment, ExperimentField } from "@/features/experiments/types/experiment.types";

export async function analyzeClarification(
  experiment: TradingExperiment,
  field: ExperimentField,
  answer: string,
  ambiguity?: string
) {
  const trimmedAnswer = answer.trim();

  if (!trimmedAnswer) {
    throw new Error("Answer cannot be empty");
  }

  const prompt = `
Current Experiment Context:
${JSON.stringify(experiment, null, 2)}

Target Field for Clarification: ${field}
${ambiguity ? `Ambiguity being resolved: "${ambiguity}"\n` : ""}
User's Clarification Answer:
"${trimmedAnswer}"
`;

  const result = await generateObject({
    model: aiProvider("gpt-4o-mini"),
    schema: clarificationSchema,
    system: CLARIFICATION_SYSTEM_PROMPT,
    prompt: prompt,
  });

  return result.object;
}
