import { NextResponse } from "next/server";

import { analyzeExperiment } from "@/features/ai/server/analyze-experiment";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const question =
            typeof body.question === "string"
                ? body.question.trim()
                : "";

        if (!question) {
            return NextResponse.json(
                {
                    error: "A trading question is required.",
                },
                { status: 400 }
            );
        }

        const experiment = await analyzeExperiment(question);

        return NextResponse.json({
            experiment,
        });
    } catch (error) {
        console.error("Experiment analysis failed:", error);

        return NextResponse.json(
            {
                error: "Failed to analyze the trading question.",
            },
            { status: 500 }
        );
    }
}