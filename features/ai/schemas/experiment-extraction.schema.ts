import { experimentSchema } from "@/features/experiments/schemas/experiment.schema";
import { z } from "zod";

export const experimentExtractionSchema = experimentSchema.omit({
    missingFields: true,
    status: true,
});

export type ExperimentExtraction = z.infer<typeof experimentExtractionSchema>;
