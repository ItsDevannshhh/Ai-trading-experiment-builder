import { NextResponse } from "next/server";

import { analyzeExperiment } from "@/features/ai/server/analyze-experiment";

export async function GET() {
    const questions = [
        "Does buying NIFTY after a 1% fall work better during high-volatility periods?",

        "Does buying NIFTY after a 1% daily fall and holding for 5 trading days produce positive returns?",

        "Does buying NIFTY after a big fall work?",

        "Buy RELIANCE after it falls 2% and hold for 3 days.",

        "Does NIFTY recover the next day after falling more than 2%?",
    ];

    try {
        const results = [];

        for (const question of questions) {
            const experiment = await analyzeExperiment(question);

            results.push({
                question,
                experiment,
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to analyze experiments",
            },
            { status: 500 }
        );
    }
}