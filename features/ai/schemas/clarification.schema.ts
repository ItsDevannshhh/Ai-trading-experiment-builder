import { z } from "zod";
import { experimentFieldSchema } from "@/features/experiments/schemas/experiment.schema";

export const clarificationSchema = z.object({
  field: experimentFieldSchema,

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
  }).nullable(),

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
  }).nullable(),

  filters: z.array(z.string()).nullable(),

  confidence: z.number().min(0).max(1),

  ambiguity: z.string().nullable(),
});

export type Clarification = z.infer<typeof clarificationSchema>;
