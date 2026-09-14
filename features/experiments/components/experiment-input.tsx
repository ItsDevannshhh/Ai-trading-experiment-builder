"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RiMagicLine } from "@remixicon/react";
import { ExampleQuestions } from "./example-questions";
import { analyzeExperiment } from "../api/analyze-experiment";
import { TradingExperiment } from "../types/experiment.types";

interface ExperimentInputProps {
  onSuccess: (experiment: TradingExperiment) => void;
}

export function ExperimentInput({ onSuccess }: ExperimentInputProps) {
  const [query, setQuery] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: (question: string) => analyzeExperiment(question),
    onSuccess: (data) => {
      onSuccess(data);
    },
  });

  const handleAnalyze = () => {
    if (query.trim()) {
      mutate(query);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative">
        <Textarea
          placeholder="Example: Does buying NIFTY after a 1% fall work better during high-volatility periods?"
          className="min-h-[160px] resize-none text-base md:text-base p-5 pb-16 shadow-sm rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 disabled:opacity-50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          aria-label="Trading hypothesis"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button 
            onClick={handleAnalyze} 
            disabled={!query.trim() || isPending}
            className="gap-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <RiMagicLine className="w-4 h-4" />
            )}
            {isPending ? "Analyzing..." : "Analyze Experiment"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500 font-medium px-1">
          {error instanceof Error ? error.message : "Something went wrong while analyzing your experiment."}
        </p>
      )}

      <ExampleQuestions onSelect={setQuery} />
    </div>
  );
}
