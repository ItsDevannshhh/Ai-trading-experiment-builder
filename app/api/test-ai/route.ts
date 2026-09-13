import { NextResponse } from "next/server";

import { analyzeExperiment } from "@/features/ai/server/analyze-experiment";

export async function GET() {
    try {
        const experiment = await analyzeExperiment(
            "Does buying NIFTY after a 1% fall work better during high-volatility periods?"
        );

        return NextResponse.json(experiment);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to analyze experiment",
            },
            { status: 500 }
        );
    }
}