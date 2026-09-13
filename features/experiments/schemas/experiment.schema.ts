import { z } from "zod";

export const experimentFieldSchema = z.enum([
    "instrument",
    "timeframe",
    "entryCondition",
    "exitCondition",
    "holdingPeriod",
    "filters",
]);

export const experimentSchema = z.object({
    instrument: z.string().nullable(),

    timeframe: z.object({
        value: z.enum([
            "intraday",
            "daily",
            "weekly",
            "monthly",
            "unknown",
        ]),
        description: z.string().nullable(),
    }),

    entryCondition: z.string().nullable(),

    exitCondition: z.string().nullable(),

    holdingPeriod: z.object({
        value: z.number().nullable(),
        unit: z.enum([
            "minutes",
            "hours",
            "days",
            "weeks",
            "months",
            "unknown",
        ]),
        description: z.string().nullable(),
    }),

    filters: z.array(z.string()),

    researchQuestion: z.string(),

    missingFields: z.array(experimentFieldSchema),

    ambiguities: z.array(z.string()),

    assumptions: z.array(z.string()),

    confidence: z.object({
        instrument: z.number().min(0).max(1),
        timeframe: z.number().min(0).max(1),
        entryCondition: z.number().min(0).max(1),
        exitCondition: z.number().min(0).max(1),
        holdingPeriod: z.number().min(0).max(1),
        filters: z.number().min(0).max(1),
    }),

    status: z.enum([
        "needs_clarification",
        "ready",
    ]),
});

export type Experiment = z.infer<typeof experimentSchema>;