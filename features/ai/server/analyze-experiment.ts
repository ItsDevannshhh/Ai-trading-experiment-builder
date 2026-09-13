import { generateObject } from "ai";

import { EXPERIMENT_SYSTEM_PROMPT } from "@/features/ai/prompts/experiment.prompt";
import { aiProvider } from "@/features/ai/server/provider";
import { experimentSchema } from "@/features/experiments/schemas/experiment.schema";
import { validateExperiment } from "@/features/experiments/utils/validate-experiment";

export async function analyzeExperiment(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
        throw new Error("Question cannot be empty");
    }

    const result = await generateObject({
        model: aiProvider("gpt-4o-mini"),
        schema: experimentSchema,
        system: EXPERIMENT_SYSTEM_PROMPT,
        prompt: trimmedQuestion,
    });

    return validateExperiment(result.object);
}