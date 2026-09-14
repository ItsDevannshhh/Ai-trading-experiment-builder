"use client";

import { useState } from "react";
import { TradingExperiment } from "../types/experiment.types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiErrorWarningLine } from "@remixicon/react";
import { parseHoldingPeriod } from "../utils/parse-clarification";
import { validateExperiment } from "../utils/validate-experiment";

interface ClarificationPanelProps {
  experiment: TradingExperiment;
  onExperimentUpdate: (experiment: TradingExperiment) => void;
}

const clarificationQuestions: Record<string, string> = {
  instrument: "Which instrument would you like to test?",
  timeframe: "What timeframe should this experiment use?",
  entryCondition: "What should trigger the entry?",
  exitCondition: "When should the position be exited?",
  holdingPeriod: "How long would you like to hold the position?",
  filters: "Are there any additional filters or conditions?"
};

export function ClarificationPanel({ experiment, onExperimentUpdate }: ClarificationPanelProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (experiment.missingFields.length === 0) {
    return null;
  }

  const fieldToClarify = experiment.missingFields[0];
  const question = clarificationQuestions[fieldToClarify] || "Please clarify this detail.";
  const handleContinue = () => {
    if (!answer.trim()) return;

    if (fieldToClarify === "holdingPeriod") {
      const parsed = parseHoldingPeriod(answer);

      if (!parsed) {
        setError(
          'We couldn\'t determine the holding period. Try something like "5 trading days" or "2 weeks".'
        );
        return;
      }

      setError(null);

      const updatedExperiment = {
        ...experiment,
        holdingPeriod: parsed,
      };

      const validated = validateExperiment(updatedExperiment);

      onExperimentUpdate(validated);
      setAnswer("");
    } else {
      setError(
        "This clarification type is not supported yet. Please provide a holding period."
      );
    }
  };

  return (
    <Card className="rounded-xl border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 shadow-sm mt-6 overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-500 font-semibold text-base mb-1">
          <RiErrorWarningLine className="w-5 h-5" />
          <span>One detail needs clarification</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-base text-zinc-900 dark:text-zinc-100 font-medium">
            {question}
          </span>
          <Input
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleContinue();
            }}
            placeholder="Type your answer..."
            className="text-base md:text-base py-5 px-3 bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-800 rounded-lg shadow-sm"
          />
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
          )}
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleContinue}
              disabled={!answer.trim()}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
