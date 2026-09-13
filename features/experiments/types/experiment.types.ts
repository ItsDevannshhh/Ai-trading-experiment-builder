export type ExperimentStatus =
    | "needs_clarification"
    | "ready";

export type Timeframe =
    | "intraday"
    | "daily"
    | "weekly"
    | "monthly"
    | "unknown";

export type HoldingPeriodUnit =
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "months"
    | "unknown";

export type ExperimentField =
    | "instrument"
    | "timeframe"
    | "entryCondition"
    | "exitCondition"
    | "holdingPeriod"
    | "filters";

export interface HoldingPeriod {
    value: number | null;
    unit: HoldingPeriodUnit;
    description: string | null;
}

export interface ExperimentConfidence {
    instrument: number;
    timeframe: number;
    entryCondition: number;
    exitCondition: number;
    holdingPeriod: number;
    filters: number;
}

export interface TradingExperiment {
    instrument: string | null;

    timeframe: {
        value: Timeframe;
        description: string | null;
    };

    entryCondition: string | null;

    exitCondition: string | null;

    holdingPeriod: HoldingPeriod;

    filters: string[];

    researchQuestion: string;

    missingFields: ExperimentField[];

    ambiguities: string[];

    assumptions: string[];

    confidence: ExperimentConfidence;

    status: ExperimentStatus;
}