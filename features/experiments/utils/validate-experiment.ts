import type {
    ExperimentField,
    TradingExperiment,
} from "@/features/experiments/types/experiment.types";

export function getRequiredMissingFields(
    experiment: TradingExperiment
): ExperimentField[] {
    const missing: ExperimentField[] = [];

    if (!experiment.instrument) {
        missing.push("instrument");
    }

    if (!experiment.entryCondition) {
        missing.push("entryCondition");
    }

    const hasHoldingPeriod =
        experiment.holdingPeriod.value !== null &&
        experiment.holdingPeriod.unit !== "unknown";

    const hasExitCondition =
        Boolean(experiment.exitCondition?.trim());

    if (!hasHoldingPeriod && !hasExitCondition) {
        missing.push("holdingPeriod");
    }

    return missing;
}

export function validateExperiment(
    experiment: TradingExperiment
): TradingExperiment {
    const missingFields = getRequiredMissingFields(experiment);

    const hasBlockingAmbiguities =
        experiment.ambiguities.length > 0;

    const isReady =
        missingFields.length === 0 &&
        !hasBlockingAmbiguities;

    return {
        ...experiment,
        missingFields,
        status: isReady
            ? "ready"
            : "needs_clarification",
    };
}