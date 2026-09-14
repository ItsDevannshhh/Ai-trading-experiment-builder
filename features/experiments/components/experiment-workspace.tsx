"use client";

import { useState } from "react";
import { ExperimentInput } from "./experiment-input";
import { ExperimentResult } from "./experiment-result";
import { TradingExperiment } from "../types/experiment.types";

export function ExperimentWorkspace() {
  const [experiment, setExperiment] = useState<TradingExperiment | null>(null);

  const handleAnalyzeSuccess = (data: TradingExperiment) => {
    console.log("Analyzed Experiment:", data);
    setExperiment(data);
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-6 py-16 md:py-24">
      <div className="flex flex-col gap-3 mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Turn a trading idea into an experiment
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Describe your trading hypothesis in plain English. TradeLab will identify the experiment structure and highlight anything that needs clarification.
        </p>
      </div>
      
      <ExperimentInput onSuccess={handleAnalyzeSuccess} />
      
      {experiment && (
        <ExperimentResult experiment={experiment} />
      )}
    </div>
  );
}
