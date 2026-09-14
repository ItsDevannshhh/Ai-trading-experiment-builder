"use client";

import { useState } from "react";
import { TradingExperiment, ExperimentField } from "../types/experiment.types";
import type { Clarification } from "@/features/ai/schemas/clarification.schema";
import { parseHoldingPeriod } from "../utils/parse-clarification";
import { applyClarification } from "../utils/apply-clarification";
import { analyzeClarification } from "../api/analyze-clarification";
import { useMutation } from "@tanstack/react-query";
import { RiSparklingLine } from "@remixicon/react";

interface ClarificationPanelProps {
  experiment: TradingExperiment;
  onExperimentUpdate: (experiment: TradingExperiment) => void;
}

const clarificationQuestions: Record<string, string> = {
  instrument: "Which instrument would you like to test?",
  timeframe: "What timeframe should this experiment use?",
  entryCondition: "What should trigger the entry?",
  exitCondition: "When should the position be exited?",
  holdingPeriod: "How long should the position be held?",
  filters: "Are there any additional filters or conditions?",
};

const friendlyFieldNames: Record<string, string> = {
  instrument: "instrument",
  timeframe: "timeframe",
  entryCondition: "entry condition",
  exitCondition: "exit condition",
  holdingPeriod: "holding period",
  filters: "filters",
};

function findRelevantFieldForAmbiguity(
  experiment: TradingExperiment,
  ambiguity: string
): ExperimentField {
  const amb = ambiguity.toLowerCase().trim();
  if (experiment.entryCondition?.toLowerCase().includes(amb))
    return "entryCondition";
  if (experiment.exitCondition?.toLowerCase().includes(amb))
    return "exitCondition";
  if (experiment.instrument?.toLowerCase().includes(amb)) return "instrument";
  if (experiment.filters?.some((f) => f.toLowerCase().includes(amb)))
    return "filters";
  if (experiment.timeframe.description?.toLowerCase().includes(amb))
    return "timeframe";
  if (experiment.holdingPeriod.description?.toLowerCase().includes(amb))
    return "holdingPeriod";
  return "entryCondition";
}

function getClarificationValueString(clarification: Clarification): string {
  const f = clarification.field;
  if (f === "holdingPeriod" && clarification.holdingPeriod) {
    return (
      clarification.holdingPeriod.description ||
      `${clarification.holdingPeriod.value} ${clarification.holdingPeriod.unit}`
    );
  }
  if (f === "timeframe" && clarification.timeframe) {
    return (
      clarification.timeframe.description || clarification.timeframe.value
    );
  }
  if (f === "filters" && clarification.filters) {
    return clarification.filters.join(", ");
  }
  const val = clarification[f];
  return typeof val === "string" ? val : JSON.stringify(val);
}

export function ClarificationPanel({
  experiment,
  onExperimentUpdate,
}: ClarificationPanelProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingClarification, setPendingClarification] =
    useState<Clarification | null>(null);

  const hasMissingFields = experiment.missingFields.length > 0;
  const hasAmbiguities = experiment.ambiguities.length > 0;

  const isResolvingAmbiguity = !hasMissingFields && hasAmbiguities;
  const missingFieldToClarify = hasMissingFields
    ? experiment.missingFields[0]
    : null;
  const ambiguityToClarify = isResolvingAmbiguity
    ? experiment.ambiguities[0]
    : null;

  const targetField: ExperimentField =
    isResolvingAmbiguity && ambiguityToClarify
      ? findRelevantFieldForAmbiguity(experiment, ambiguityToClarify)
      : (missingFieldToClarify ?? "entryCondition");

  const question =
    isResolvingAmbiguity && ambiguityToClarify
      ? `What does "${ambiguityToClarify}" mean in this context?`
      : missingFieldToClarify
        ? clarificationQuestions[missingFieldToClarify] ??
          "Please clarify this detail."
        : "";

  const mutation = useMutation({
    mutationFn: async (ans: string) =>
      analyzeClarification(
        experiment,
        targetField,
        ans,
        ambiguityToClarify ?? undefined
      ),
    onSuccess: (clarification) => {
      if (clarification.ambiguity) {
        setError(
          "I couldn't determine that from your answer. Please try being more specific."
        );
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
            ambiguity: null,
          });
          return;
        }
      }
      setError(
        "An error occurred while understanding your answer. Please try again."
      );
    },
  });

  const applyAndFinish = (clarification: Clarification) => {
    const resolvedAmbiguity =
      isResolvingAmbiguity && clarification.field === targetField
        ? ambiguityToClarify ?? undefined
        : undefined;
    const updated = applyClarification(
      experiment,
      clarification,
      resolvedAmbiguity
    );
    onExperimentUpdate(updated);
    setAnswer("");
    setPendingClarification(null);
  };

  const handleContinue = () => {
    if (!answer.trim()) return;
    setError(null);
    mutation.mutate(answer);
  };

  if (!hasMissingFields && !hasAmbiguities) return null;

  // ── Pending clarification confirmation ────────────────────
  if (pendingClarification) {
    const extractedField = pendingClarification.field;
    const valueStr = getClarificationValueString(pendingClarification);
    return (
      <div className="border border-[var(--tl-amber-border)] bg-[var(--tl-amber-bg)] rounded-lg overflow-hidden animate-in fade-in duration-200">
        <div className="px-5 py-4 flex flex-col gap-4">
          <p className="text-[14px] text-foreground/90 leading-relaxed">
            That sounds like a{" "}
            <strong className="font-semibold">
              {friendlyFieldNames[extractedField]}
            </strong>{" "}
            rather than{" "}
            {isResolvingAmbiguity
              ? `a clarification for "${ambiguityToClarify}"`
              : `a ${friendlyFieldNames[targetField]}`}
            .
          </p>
          <p className="text-[13px] text-muted-foreground">
            Understood as:{" "}
            <em className="font-medium text-foreground not-italic">
              &ldquo;{valueStr}&rdquo;
            </em>
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPendingClarification(null)}
              className="inline-flex items-center text-[13px] font-medium text-muted-foreground hover:text-foreground px-3.5 py-1.5 border border-border rounded-md bg-background hover:bg-muted/40 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => applyAndFinish(pendingClarification)}
              className="inline-flex items-center text-[13px] font-medium px-3.5 py-1.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity duration-150"
            >
              Apply anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main clarification panel ──────────────────────────────
  return (
    <div
      className="border border-[var(--tl-amber-border)] bg-[var(--tl-amber-bg)] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="region"
      aria-label="Clarification required"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--tl-amber-border)]/60">
        <RiSparklingLine
          className="w-3.5 h-3.5 text-[var(--tl-amber)] shrink-0"
          aria-hidden="true"
        />
        <p className="tl-label" style={{ color: "var(--tl-amber)" }}>
          One detail to finalize
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-5 flex flex-col gap-4">
        {/* Question */}
        <p className="text-[15px] text-foreground font-medium leading-snug">
          {question}
        </p>

        {/* Context hint for ambiguities */}
        {isResolvingAmbiguity && (
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            This detail is ambiguous and needs to be defined before the
            experiment can be considered ready.
          </p>
        )}

        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !mutation.isPending) handleContinue();
            }}
            placeholder="Type your answer…"
            disabled={mutation.isPending}
            className={[
              "w-full text-[14px] px-3.5 py-2.5",
              "bg-background text-foreground placeholder:text-muted-foreground/50",
              "border border-[var(--tl-amber-border)] rounded-md",
              "outline-none transition-all duration-150",
              "focus:border-[var(--tl-amber)] focus:ring-2 focus:ring-[var(--tl-amber)]/15",
              "disabled:opacity-50",
            ].join(" ")}
            aria-label={question}
          />
          {error && (
            <p role="alert" className="text-[12px] text-destructive font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!answer.trim() || mutation.isPending}
            className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-150"
          >
            {mutation.isPending ? (
              <>
                <span
                  className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                Understanding…
              </>
            ) : (
              <>Continue →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
