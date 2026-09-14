"use client";

import { useState } from "react";
import { ExperimentInput } from "./experiment-input";
import { ExperimentResult } from "./experiment-result";
import { TradingExperiment } from "../types/experiment.types";

export function ExperimentWorkspace() {
  const [experiment, setExperiment] = useState<TradingExperiment | null>(null);

  const handleAnalyzeSuccess = (data: TradingExperiment) => {
    setExperiment(data);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col gap-10">

      {/* Hero heading */}
      <div className="flex flex-col gap-4">
        <p className="tl-label text-muted-foreground/70">
          Research Hypothesis
        </p>
        <h1 className="font-heading font-light text-[2rem] sm:text-[2.5rem] leading-[1.15] tracking-[-0.03em] text-foreground">
          Turn a market hypothesis<br className="hidden sm:block" />
          <span className="font-heading font-semibold"> into a structured experiment.</span>
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[520px]">
          Describe your trading idea in plain English. TradeLab extracts the
          experiment structure and flags anything that needs clarification before
          a backtest can run.
        </p>
      </div>

      {/* Composer */}
      <ExperimentInput onSuccess={handleAnalyzeSuccess} />

      {/* Result */}
      {experiment && (
        <div className="flex flex-col gap-8">
          <ExperimentResult experiment={experiment} onUpdate={setExperiment} />

          {/* Reset */}
          <div className="flex justify-center pb-10">
            <button
              type="button"
              onClick={() => setExperiment(null)}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 border border-border hover:border-foreground/20 rounded-md px-4 py-2 bg-transparent"
            >
              ← Start a new experiment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
