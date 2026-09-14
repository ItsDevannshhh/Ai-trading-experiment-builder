"use client";

import { TradingExperiment } from "../types/experiment.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RiErrorWarningLine, RiCheckLine, RiInformationLine } from "@remixicon/react";

interface ExperimentResultProps {
  experiment: TradingExperiment;
}

export function ExperimentResult({ experiment }: ExperimentResultProps) {
  // Helpers to format fields
  const getInstrument = () => experiment.instrument || "Not specified";
  const getEntryCondition = () => experiment.entryCondition || "Not specified";
  const getExitCondition = () => experiment.exitCondition || "Not specified";
  const getTimeframe = () => {
    if (experiment.timeframe.value === "unknown") return "Not specified";
    return experiment.timeframe.description || experiment.timeframe.value;
  };
  const getHoldingPeriod = () => {
    if (experiment.holdingPeriod.value === null && experiment.holdingPeriod.unit === "unknown") {
      return "Needs clarification";
    }
    return experiment.holdingPeriod.description || `${experiment.holdingPeriod.value} ${experiment.holdingPeriod.unit}`;
  };

  const isReady = experiment.status === "ready";
  const needsClarification = experiment.status === "needs_clarification";

  // Friendly names for missing fields
  const friendlyFieldNames: Record<string, string> = {
    instrument: "Instrument",
    timeframe: "Timeframe",
    entryCondition: "Entry condition",
    exitCondition: "Exit condition",
    holdingPeriod: "Holding period",
    filters: "Filters",
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isReady && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium px-2">
          <RiCheckLine className="w-5 h-5" />
          <span>✓ Experiment ready</span>
        </div>
      )}

      <Card className="rounded-xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <CardTitle className="text-base text-zinc-800 dark:text-zinc-200">
            Experiment Interpretation
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 flex flex-col gap-8">
          {/* Main components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Instrument</span>
              <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">{getInstrument()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Entry Condition</span>
              <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">{getEntryCondition()}</span>
            </div>
          </div>

          <Separator className="bg-zinc-100 dark:bg-zinc-800" />

          {/* Secondary components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Timeframe</span>
              <span className="text-base text-zinc-800 dark:text-zinc-200">{getTimeframe()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Holding Period</span>
              <span className={`text-base ${getHoldingPeriod() === "Needs clarification" ? "text-amber-600 dark:text-amber-500 font-medium" : "text-zinc-800 dark:text-zinc-200"}`}>
                {getHoldingPeriod()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Exit Condition</span>
              <span className="text-base text-zinc-800 dark:text-zinc-200">{getExitCondition()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Filters</span>
              {experiment.filters.length === 0 ? (
                <span className="text-base text-zinc-800 dark:text-zinc-200">None</span>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {experiment.filters.map((filter, i) => (
                    <Badge key={i} variant="secondary" className="rounded-md font-normal text-sm px-2.5 py-0.5">
                      {filter}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-zinc-100 dark:bg-zinc-800" />

          {/* Original Question */}
          <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Research Question</span>
            <span className="text-base italic text-zinc-700 dark:text-zinc-300">"{experiment.researchQuestion}"</span>
          </div>

          {/* Ambiguities & Assumptions */}
          {(experiment.ambiguities.length > 0 || experiment.assumptions.length > 0) && (
            <div className="flex flex-col gap-6 pt-2">
              {experiment.ambiguities.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                    <RiInformationLine className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Potential Ambiguity</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {experiment.ambiguities.map((ambiguity, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">{ambiguity}</li>
                    ))}
                  </ul>
                </div>
              )}

              {experiment.assumptions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500">
                    <RiInformationLine className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Assumptions</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {experiment.assumptions.map((assumption, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* Clarification Warning */}
      {needsClarification && experiment.missingFields.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 text-amber-900 dark:text-amber-200 rounded-xl p-4">
          <RiErrorWarningLine className="w-5 h-5 !text-amber-600 dark:!text-amber-500" />
          <AlertTitle className="text-base font-semibold text-amber-800 dark:text-amber-300">
            ⚠ {experiment.missingFields.length === 1 ? "One detail needs clarification" : `${experiment.missingFields.length} details need clarification`}
          </AlertTitle>
          <AlertDescription className="text-sm mt-3 flex flex-col gap-3 text-amber-700 dark:text-amber-400">
            <p className="mb-0">The experiment needs a little more information before it can be finalized.</p>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Missing:</span>
              <ul className="list-disc pl-5 mt-1">
                {experiment.missingFields.map((field) => (
                  <li key={field}>{friendlyFieldNames[field] || field}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
