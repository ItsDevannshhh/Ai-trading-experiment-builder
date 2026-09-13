import { createOpenAI } from "@ai-sdk/openai";

const apiKey = process.env.AI_API_KEY;
const baseURL = process.env.AI_API_BASE_URL;

if (!apiKey) {
    throw new Error("AI_API_KEY is not configured");
}

if (!baseURL) {
    throw new Error("AI_API_BASE_URL is not configured");
}

export const aiProvider = createOpenAI({
    apiKey,
    baseURL,
});