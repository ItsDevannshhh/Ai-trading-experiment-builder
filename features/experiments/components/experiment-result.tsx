"use client";

import { useState } from "react";
import { TradingExperiment, Timeframe } from "../types/experiment.types";
import { parseHoldingPeriod } from "../utils/parse-clarification";
import { validateExperiment } from "../utils/validate-experiment";
import { toBacktestDefinition } from "../utils/to-backtest-definition";
import { EditableField } from "./editable-field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { RiErrorWarningLine, RiCheckLine, RiInformationLine, RiCodeSSlashLine, RiFileCopyLine, RiCheckboxCircleLine } from "@remixicon/react";

interface ExperimentResultProps {
  experiment: TradingExperiment;
  onUpdate?: (experiment: TradingExperiment) => void;
}

export function ExperimentResult({ experiment, onUpdate }: ExperimentResultProps) {
  const [jsonVisible, setJsonVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helpers to format fields
  const getInstrument = () => experiment.instrument || "Not specified";
  const getEntryCondition = () => experiment.entryCondition || "Not specified";
  const getExitCondition = () => experiment.exitCondition || "Not specified";
  const getTimeframe = () => {
    if (experiment.timeframe.value === "unknown") return "Not specified";
    return experiment.timeframe.description || experiment.timeframe.value;
  };
  const hasValidHoldingPeriod =
    experiment.holdingPeriod.value !== null &&
    experiment.holdingPeriod.unit !== "unknown";
  const hasExitCondition = Boolean(experiment.exitCondition?.trim());

  const getHoldingPeriod = (): string => {
    if (hasValidHoldingPeriod) {
      return experiment.holdingPeriod.description ||
        `${experiment.holdingPeriod.value} ${experiment.holdingPeriod.unit}`;
    }
    if (hasExitCondition) {
      return "Not specified — exit condition used";
    }
    return "Needs clarification";
  };

  const holdingPeriodIsWarning = !hasValidHoldingPeriod && !hasExitCondition;
  const holdingPeriodUsesExitCondition = !hasValidHoldingPeriod && hasExitCondition;

  const isReady = experiment.status === "ready";
  const needsClarification = experiment.status === "needs_clarification";

  const backtestDef = toBacktestDefinition(experiment);
  const jsonString = JSON.stringify(backtestDef, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isReady && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium px-2">
          <RiCheckLine className="w-5 h-5" />
          <span>Experiment ready</span>
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
            <EditableField 
              label="Instrument"
              value={experiment.instrument || ""}
              displayValue={getInstrument()}
              onSave={(val) => {
                const updated = { ...experiment, instrument: val.trim() || null };
                onUpdate?.(validateExperiment(updated));
              }}
            />
            <EditableField 
              label="Entry Condition"
              value={experiment.entryCondition || ""}
              displayValue={getEntryCondition()}
              onSave={(val) => {
                const updated = { ...experiment, entryCondition: val.trim() || null };
                onUpdate?.(validateExperiment(updated));
              }}
            />
          </div>

          <Separator className="bg-zinc-100 dark:bg-zinc-800" />

          {/* Secondary components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EditableField 
              label="Timeframe"
              type="select"
              value={experiment.timeframe.value}
              displayValue={getTimeframe()}
              options={[
                { label: "Intraday", value: "intraday" },
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Unknown", value: "unknown" },
              ]}
              onSave={(val) => {
                const updated = { 
                  ...experiment, 
                  timeframe: { value: val as Timeframe, description: null }
                };
                onUpdate?.(validateExperiment(updated));
              }}
            />
            <EditableField 
              label="Holding Period"
              value={
                hasValidHoldingPeriod
                  ? `${experiment.holdingPeriod.value} ${experiment.holdingPeriod.unit}`
                  : ""
              }
              displayValue={getHoldingPeriod()}
              isWarning={holdingPeriodIsWarning}
              placeholder="e.g. 5 days, 2 weeks"
              onSave={(val) => {
                let newHoldingPeriod: typeof experiment.holdingPeriod = { value: null, unit: "unknown" as const, description: null };
                if (val.trim()) {
                  const parsed = parseHoldingPeriod(val);
                  if (parsed) {
                    newHoldingPeriod = parsed;
                  }
                }
                const updated = { ...experiment, holdingPeriod: newHoldingPeriod };
                onUpdate?.(validateExperiment(updated));
              }}
            />
            {holdingPeriodUsesExitCondition && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Using exit condition as the exit rule
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EditableField 
              label="Exit Condition"
              value={experiment.exitCondition || ""}
              displayValue={getExitCondition()}
              onSave={(val) => {
                const updated = { ...experiment, exitCondition: val.trim() || null };
                onUpdate?.(validateExperiment(updated));
              }}
            />
            <EditableField 
              label="Filters"
              value={experiment.filters.join(", ")}
              displayValue={
                experiment.filters.length === 0 ? (
                  "None"
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {experiment.filters.map((filter, i) => (
                      <Badge key={i} variant="secondary" className="rounded-md font-normal text-sm px-2.5 py-0.5">
                        {filter}
                      </Badge>
                    ))}
                  </div>
                )
              }
              onSave={(val) => {
                const filters = val.split(",").map(s => s.trim()).filter(Boolean);
                const updated = { ...experiment, filters };
                onUpdate?.(validateExperiment(updated));
              }}
            />
          </div>

          <Separator className="bg-zinc-100 dark:bg-zinc-800" />

          {/* Original Question */}
          <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Research Question</span>
            <span className="text-base italic text-zinc-700 dark:text-zinc-300">&quot;{experiment.researchQuestion}&quot;</span>
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

      {/* Backtest JSON Panel */}
      <Card className="rounded-xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 pb-3 pt-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Backtest-ready definition
              </span>
              {!isReady && (
                <span className="text-xs text-amber-600 dark:text-amber-500">
                  Complete required fields before running a backtest.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-xs text-zinc-600 dark:text-zinc-400 gap-1.5"
              >
                {copied ? (
                  <><RiCheckboxCircleLine className="w-3.5 h-3.5 text-green-600" /> Copied</>
                ) : (
                  <><RiFileCopyLine className="w-3.5 h-3.5" /> Copy JSON</>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setJsonVisible((v) => !v)}
                className="h-8 px-3 text-xs text-zinc-600 dark:text-zinc-400 gap-1.5"
              >
                <RiCodeSSlashLine className="w-3.5 h-3.5" />
                {jsonVisible ? "Hide JSON" : "View JSON"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {jsonVisible && (
          <CardContent className="p-0">
            <pre className="text-xs leading-relaxed font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-5 overflow-x-auto">
              {jsonString}
            </pre>
          </CardContent>
        )}
      </Card>

      {/* Clarification Warning (Compact) */}
      {needsClarification && experiment.missingFields.length > 0 && (
        <div className="flex items-center gap-2 mt-2 px-2 text-amber-600 dark:text-amber-500 font-medium">
          <RiErrorWarningLine className="w-5 h-5" />
          <span>Needs clarification</span>
        </div>
      )}
    </div>
  );
}
