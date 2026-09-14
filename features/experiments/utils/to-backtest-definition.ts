import type { TradingExperiment, HoldingPeriodUnit, Timeframe } from "../types/experiment.types";

export interface BacktestDefinition {
  instrument: string | null;
  timeframe: Timeframe | null;
  entryCondition: string | null;
  exitCondition: string | null;
  holdingPeriod: {
    value: number | null;
    unit: HoldingPeriodUnit;
  } | null;
  filters: string[];
}

export function toBacktestDefinition(experiment: TradingExperiment): BacktestDefinition {
  const { holdingPeriod, timeframe } = experiment;

  const resolvedTimeframe = timeframe.value !== "unknown" ? timeframe.value : null;

  const resolvedHoldingPeriod =
    holdingPeriod.value !== null || holdingPeriod.unit !== "unknown"
      ? { value: holdingPeriod.value, unit: holdingPeriod.unit }
      : null;

  return {
    instrument: experiment.instrument,
    timeframe: resolvedTimeframe,
    entryCondition: experiment.entryCondition,
    exitCondition: experiment.exitCondition,
    holdingPeriod: resolvedHoldingPeriod,
    filters: experiment.filters,
  };
}
