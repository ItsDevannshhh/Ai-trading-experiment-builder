import { generateObject } from "ai";

import { experimentSchema } from "@/features/experiments/schemas/experiment.schema";
import { EXPERIMENT_SYSTEM_PROMPT } from "@/features/ai/prompts/experiment.prompt";
import { aiProvider } from "./provider";

export async function analyzeExperiment(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
        throw new Error("Question cannot be empty");
    }

    const result = await generateObject({
        model: aiProvider(process.env.AI_MODEL ?? "gpt-5-mini"),
        schema: experimentSchema,
        system: EXPERIMENT_SYSTEM_PROMPT,
        prompt: trimmedQuestion,
    });

    return result.object;
}