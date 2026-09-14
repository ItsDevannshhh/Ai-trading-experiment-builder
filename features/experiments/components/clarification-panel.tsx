"use client";

import { useState } from "react";
import { TradingExperiment, ExperimentField } from "../types/experiment.types";
import type { Clarification } from "@/features/ai/schemas/clarification.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiErrorWarningLine } from "@remixicon/react";
import { parseHoldingPeriod } from "../utils/parse-clarification";
import { applyClarification } from "../utils/apply-clarification";
import { analyzeClarification } from "../api/analyze-clarification";
import { useMutation } from "@tanstack/react-query";

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

const friendlyFieldNames: Record<string, string> = {
  instrument: "instrument",
  timeframe: "timeframe",
  entryCondition: "entry condition",
  exitCondition: "exit condition",
  holdingPeriod: "holding period",
  filters: "filters"
};

function findRelevantFieldForAmbiguity(
  experiment: TradingExperiment,
  ambiguity: string
): ExperimentField {
  const amb = ambiguity.toLowerCase().trim();

  if (experiment.entryCondition && experiment.entryCondition.toLowerCase().includes(amb)) {
    return "entryCondition";
  }
  if (experiment.exitCondition && experiment.exitCondition.toLowerCase().includes(amb)) {
    return "exitCondition";
  }
  if (experiment.instrument && experiment.instrument.toLowerCase().includes(amb)) {
    return "instrument";
  }
  if (experiment.filters && experiment.filters.some((f) => f.toLowerCase().includes(amb))) {
    return "filters";
  }
  if (experiment.timeframe.description && experiment.timeframe.description.toLowerCase().includes(amb)) {
    return "timeframe";
  }
  if (experiment.holdingPeriod.description && experiment.holdingPeriod.description.toLowerCase().includes(amb)) {
    return "holdingPeriod";
  }

  return "entryCondition";
}

function getClarificationValueString(clarification: Clarification): string {
  const f = clarification.field;
  if (f === "holdingPeriod" && clarification.holdingPeriod) {
    return clarification.holdingPeriod.description || `${clarification.holdingPeriod.value} ${clarification.holdingPeriod.unit}`;
  }
  if (f === "timeframe" && clarification.timeframe) {
    return clarification.timeframe.description || clarification.timeframe.value;
  }
  if (f === "filters" && clarification.filters) {
    return clarification.filters.join(", ");
  }
  const val = clarification[f];
  return typeof val === "string" ? val : JSON.stringify(val);
}

export function ClarificationPanel({ experiment, onExperimentUpdate }: ClarificationPanelProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingClarification, setPendingClarification] = useState<Clarification | null>(null);

  const hasMissingFields = experiment.missingFields.length > 0;
  const hasAmbiguities = experiment.ambiguities.length > 0;

  // First priority: missing fields
  // Second priority: ambiguities
  const isResolvingAmbiguity = !hasMissingFields && hasAmbiguities;

  const missingFieldToClarify = hasMissingFields ? experiment.missingFields[0] : null;
  const ambiguityToClarify = isResolvingAmbiguity ? experiment.ambiguities[0] : null;

  const targetField: ExperimentField = isResolvingAmbiguity && ambiguityToClarify
    ? findRelevantFieldForAmbiguity(experiment, ambiguityToClarify)
    : (missingFieldToClarify ?? "entryCondition");

  const question = isResolvingAmbiguity && ambiguityToClarify
    ? `What does "${ambiguityToClarify}" mean?`
    : (missingFieldToClarify ? (clarificationQuestions[missingFieldToClarify] || "Please clarify this detail.") : "");

  const mutation = useMutation({
    mutationFn: async (ans: string) => {
      return analyzeClarification(
        experiment,
        targetField,
        ans,
        ambiguityToClarify ?? undefined
      );
    },
    onSuccess: (clarification) => {
      if (clarification.ambiguity) {
        setError("I couldn't determine that from your answer. Try being more specific.");
        return;
      }

      if (clarification.field !== targetField) {
        setPendingClarification(clarification);
        return;
      }

      applyAndFinish(clarification);
    },
    onError: () => {
      if (targetField === "holdingPeriod") {
        const parsed = parseHoldingPeriod(answer);
        if (parsed) {
          applyAndFinish({
            field: "holdingPeriod",
            holdingPeriod: parsed,
            instrument: null,
            timeframe: null,
            entryCondition: null,
            exitCondition: null,
            filters: null,
            confidence: 1,
            ambiguity: null
          });
          return;
        }
      }
      setError("An error occurred while understanding your answer. Please try again.");
    }
  });

  const applyAndFinish = (clarification: Clarification) => {
    const resolvedAmbiguity =
      isResolvingAmbiguity && clarification.field === targetField
        ? ambiguityToClarify ?? undefined
        : undefined;

    const updated = applyClarification(experiment, clarification, resolvedAmbiguity);
    onExperimentUpdate(updated);
    setAnswer("");
    setPendingClarification(null);
  };

  const handleContinue = () => {
    if (!answer.trim()) return;
    setError(null);
    mutation.mutate(answer);
  };

  if (!hasMissingFields && !hasAmbiguities) {
    return null;
  }

  if (pendingClarification) {
    const extractedField = pendingClarification.field;
    const valueStr = getClarificationValueString(pendingClarification);
    return (
      <Card className="rounded-xl border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 shadow-sm mt-6 overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-base text-zinc-900 dark:text-zinc-100 font-medium">
              That sounds like an {friendlyFieldNames[extractedField]} rather than {isResolvingAmbiguity ? `a clarification for "${ambiguityToClarify}"` : `a ${friendlyFieldNames[targetField]}`}.
            </span>
            <span className="text-base text-zinc-700 dark:text-zinc-300">
              I understood it as: <span className="italic font-medium">&quot;{valueStr}&quot;</span>
            </span>
            <div className="flex justify-end gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => setPendingClarification(null)}
                className="bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => applyAndFinish(pendingClarification)}
                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Apply anyway
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              if (e.key === "Enter" && !mutation.isPending) handleContinue();
            }}
            placeholder="Type your answer..."
            disabled={mutation.isPending}
            className="text-base md:text-base py-5 px-3 bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-800 rounded-lg shadow-sm"
          />
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
          )}
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleContinue}
              disabled={!answer.trim() || mutation.isPending}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {mutation.isPending ? "Understanding..." : "Continue"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
