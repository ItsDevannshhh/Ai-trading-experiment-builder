"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RiFlaskLine } from "@remixicon/react";
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
    <div className="w-full flex flex-col gap-5">
      {/* Composer */}
      <div className="relative group">
        <textarea
          placeholder="e.g. Does buying NIFTY after a 1% fall produce positive returns over 5 trading days during high-volatility periods?"
          className={[
            "w-full min-h-[156px] resize-none text-[15px] leading-relaxed",
            "px-5 pt-5 pb-[60px]",
            "bg-card text-foreground placeholder:text-muted-foreground/40",
            "border border-border rounded-lg",
            "shadow-[0_1px_4px_oklch(0_0_0/0.06),0_0_0_1px_var(--border)]",
            "outline-none transition-all duration-150",
            "focus:border-[var(--tl-accent-border)] focus:ring-2 focus:ring-[var(--tl-accent-muted)] focus:shadow-[0_2px_12px_var(--tl-accent-muted)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          aria-label="Trading hypothesis"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !isPending) {
              handleAnalyze();
            }
          }}
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/50 rounded-b-lg">
          <span className="text-[10px] text-muted-foreground/50 hidden sm:block select-none">
            {isPending ? "Analyzing…" : "⌘ + Enter to analyze"}
          </span>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!query.trim() || isPending}
            className={[
              "ml-auto inline-flex items-center gap-2",
              "text-[13px] font-medium",
              "px-4 py-1.5 rounded-md",
              "tl-btn-primary",
            ].join(" ")}
            aria-label={isPending ? "Analyzing experiment" : "Analyze experiment"}
          >
            {isPending ? (
              <>
                <span
                  className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                Analyzing…
              </>
            ) : (
              <>
                <RiFlaskLine className="w-3.5 h-3.5" aria-hidden="true" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <p
          role="alert"
          className="text-[13px] text-destructive font-medium px-1"
        >
          {error instanceof Error
            ? error.message
            : "Something went wrong while analyzing your experiment. Please try again."}
        </p>
      )}

      {/* Examples */}
      <ExampleQuestions onSelect={setQuery} />
    </div>
  );
}
