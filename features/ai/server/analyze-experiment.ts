import { generateObject } from "ai";

import { EXPERIMENT_SYSTEM_PROMPT } from "@/features/ai/prompts/experiment.prompt";
import { aiProvider } from "@/features/ai/server/provider";
import { experimentExtractionSchema } from "@/features/ai/schemas/experiment-extraction.schema";
import { validateExperiment } from "@/features/experiments/utils/validate-experiment";
import type { TradingExperiment } from "@/features/experiments/types/experiment.types";

export async function analyzeExperiment(question: string): Promise<TradingExperiment> {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
        throw new Error("Question cannot be empty");
    }

    const result = await generateObject({
        model: aiProvider("gpt-4o-mini"),
        schema: experimentExtractionSchema,
        system: EXPERIMENT_SYSTEM_PROMPT,
        prompt: trimmedQuestion,
    });

    const experiment: TradingExperiment = {
        ...result.object,
        missingFields: [],
        status: "needs_clarification",
    };

    return validateExperiment(experiment);
}