"use client";

import { useState } from "react";
import { TradingExperiment, Timeframe } from "../types/experiment.types";
import { parseHoldingPeriod } from "../utils/parse-clarification";
import { validateExperiment } from "../utils/validate-experiment";
import { toBacktestDefinition } from "../utils/to-backtest-definition";
import { EditableField } from "./editable-field";
import { ClarificationPanel } from "./clarification-panel";

import {
  RiCheckLine,
  RiAlertLine,
  RiInformationLine,
  RiCodeSSlashLine,
  RiFileCopyLine,
  RiCheckboxCircleLine,
} from "@remixicon/react";

interface ExperimentResultProps {
  experiment: TradingExperiment;
  onUpdate?: (experiment: TradingExperiment) => void;
}

export function ExperimentResult({
  experiment,
  onUpdate,
}: ExperimentResultProps) {
  const [jsonVisible, setJsonVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [holdingPeriodError, setHoldingPeriodError] = useState<
    string | undefined
  >();

  // Field display helpers
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
      return (
        experiment.holdingPeriod.description ||
        `${experiment.holdingPeriod.value} ${experiment.holdingPeriod.unit}`
      );
    }
    if (hasExitCondition) return "Not specified — exit condition used";
    return "Needs clarification";
  };

  const holdingPeriodIsWarning = !hasValidHoldingPeriod && !hasExitCondition;
  const holdingPeriodUsesExitCondition =
    !hasValidHoldingPeriod && hasExitCondition;

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
    <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-400">

      {/* ── Status banner ─────────────────────────────────────── */}
      <div
        className={[
          "flex items-center gap-2.5 px-4 py-2.5 rounded-md text-[13px] font-medium border",
          isReady
            ? "bg-[var(--tl-green-bg)] border-[var(--tl-green-border)] text-[var(--tl-green)]"
            : "bg-[var(--tl-amber-bg)] border-[var(--tl-amber-border)] text-[var(--tl-amber)]",
        ].join(" ")}
        role="status"
      >
        {isReady ? (
          <RiCheckLine className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : (
          <RiAlertLine className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {isReady
            ? "Experiment ready — all required fields are structured."
            : "Experiment needs clarification before it can be considered ready."}
        </span>
      </div>

      {/* ── Experiment card ───────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-[0_1px_6px_oklch(0_0_0/0.07),0_0_0_1px_var(--border)]">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <p className="tl-label">Experiment Interpretation</p>
        </div>

        {/* Fields — definition list layout */}
        <div className="px-5 py-5 flex flex-col gap-0 divide-y divide-[var(--tl-divider)]">

          <FieldRow
            label="Instrument"
            isWarning={!experiment.instrument}
            editableField={
              <EditableField
                label="Instrument"
                value={experiment.instrument || ""}
                displayValue={getInstrument()}
                onSave={(val) => {
                  const updated = {
                    ...experiment,
                    instrument: val.trim() || null,
                  };
                  onUpdate?.(validateExperiment(updated));
                }}
              />
            }
          />

          <FieldRow
            label="Entry Condition"
            isWarning={!experiment.entryCondition}
            editableField={
              <EditableField
                label="Entry Condition"
                value={experiment.entryCondition || ""}
                displayValue={getEntryCondition()}
                onSave={(val) => {
                  const updated = {
                    ...experiment,
                    entryCondition: val.trim() || null,
                  };
                  onUpdate?.(validateExperiment(updated));
                }}
              />
            }
          />

          <FieldRow
            label="Timeframe"
            editableField={
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
                    timeframe: { value: val as Timeframe, description: null },
                  };
                  onUpdate?.(validateExperiment(updated));
                }}
              />
            }
          />

          <FieldRow
            label="Holding Period"
            isWarning={holdingPeriodIsWarning}
            editableField={
              <div className="flex flex-col gap-1">
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
                  error={holdingPeriodError}
                  onErrorChange={setHoldingPeriodError}
                  onSave={(val) => {
                    const trimmed = val.trim();
                    if (!trimmed) {
                      setHoldingPeriodError(undefined);
                      const updated = {
                        ...experiment,
                        holdingPeriod: {
                          value: null,
                          unit: "unknown" as const,
                          description: null,
                        },
                      };
                      onUpdate?.(validateExperiment(updated));
                      return;
                    }
                    const parsed = parseHoldingPeriod(trimmed);
                    if (!parsed) {
                      setHoldingPeriodError(
                        'Use a format like "5 days" or "2 weeks".'
                      );
                      return false;
                    }
                    setHoldingPeriodError(undefined);
                    const updated = { ...experiment, holdingPeriod: parsed };
                    onUpdate?.(validateExperiment(updated));
                  }}
                />
                {holdingPeriodUsesExitCondition && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Using exit condition as the exit rule.
                  </p>
                )}
              </div>
            }
          />

          <FieldRow
            label="Exit Condition"
            editableField={
              <EditableField
                label="Exit Condition"
                value={experiment.exitCondition || ""}
                displayValue={getExitCondition()}
                onSave={(val) => {
                  const updated = {
                    ...experiment,
                    exitCondition: val.trim() || null,
                  };
                  onUpdate?.(validateExperiment(updated));
                }}
              />
            }
          />

          <FieldRow
            label="Filters"
            editableField={
              <EditableField
                label="Filters"
                value={experiment.filters.join(", ")}
                displayValue={
                  experiment.filters.length === 0 ? (
                    <span className="text-muted-foreground/60">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {experiment.filters.map((filter, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center text-[12px] font-medium font-mono px-2 py-0.5 bg-muted rounded border border-border text-foreground"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  )
                }
                onSave={(val) => {
                  const filters = val
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const updated = { ...experiment, filters };
                  onUpdate?.(validateExperiment(updated));
                }}
              />
            }
          />
        </div>

        {/* Research question */}
        <div className="mx-5 mb-5 px-4 py-3.5 rounded-md border border-border bg-muted/20">
          <p className="tl-label mb-2">Research Question</p>
          <p className="text-[14px] text-foreground/80 leading-relaxed italic">
            &ldquo;{experiment.researchQuestion}&rdquo;
          </p>
        </div>

        {/* Ambiguities & Assumptions */}
        {(experiment.ambiguities.length > 0 ||
          experiment.assumptions.length > 0) && (
          <div className="border-t border-border">

            {experiment.ambiguities.length > 0 && (
              <div className="mx-5 my-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-[var(--tl-amber)]">
                  <RiAlertLine className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <p className="tl-label" style={{ color: "var(--tl-amber)" }}>
                    Potential {experiment.ambiguities.length === 1 ? "Ambiguity" : "Ambiguities"}
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {experiment.ambiguities.map((ambiguity, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-[var(--tl-amber-border)]"
                    >
                      {ambiguity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {experiment.assumptions.length > 0 && (
              <div className={`mx-5 mb-4 flex flex-col gap-2.5 ${experiment.ambiguities.length > 0 ? "mt-0 pt-3 border-t border-border" : "mt-4"}`}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiInformationLine className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <p className="tl-label">
                    {experiment.assumptions.length === 1 ? "Assumption" : "Assumptions"}
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {experiment.assumptions.map((assumption, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-muted-foreground/80 leading-relaxed pl-3 border-l-2 border-border"
                    >
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Clarification panel ───────────────────────────────── */}
      {needsClarification && onUpdate && (
        <ClarificationPanel
          experiment={experiment}
          onExperimentUpdate={onUpdate}
        />
      )}

      {/* ── Backtest definition panel ─────────────────────────── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-[0_1px_6px_oklch(0_0_0/0.07),0_0_0_1px_var(--border)]">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <p className="tl-label">Backtest-Ready Definition</p>
            {!isReady && (
              <p className="text-[11px] text-[var(--tl-amber)] mt-0.5">
                Complete required fields before running a backtest.
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150 px-3 py-1.5 rounded-md hover:bg-muted/50"
              aria-label="Copy JSON to clipboard"
            >
              {copied ? (
                <>
                  <RiCheckboxCircleLine
                    className="w-3.5 h-3.5 text-[var(--tl-green)]"
                    aria-hidden="true"
                  />
                  <span className="text-[var(--tl-green)]">Copied</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy JSON
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setJsonVisible((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150 px-3 py-1.5 rounded-md hover:bg-muted/50"
              aria-expanded={jsonVisible}
              aria-controls="json-panel"
            >
              <RiCodeSSlashLine className="w-3.5 h-3.5" aria-hidden="true" />
              {jsonVisible ? "Hide" : "View JSON"}
            </button>
          </div>
        </div>

        {jsonVisible && (
          <div
            id="json-panel"
            className="border-t border-border animate-in fade-in slide-in-from-top-1 duration-200"
            style={{ borderTop: "2px solid var(--tl-accent-border)" }}
          >
            <pre
              className={[
                "text-[12px] leading-[1.7]",
                "font-mono",
                "text-foreground/75",
                "bg-[var(--tl-surface-code)]",
                "px-6 py-5",
                "overflow-x-auto",
              ].join(" ")}
            >
              {jsonString}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Field row layout helper ─────────────────────────────── */
function FieldRow({
  label,
  editableField,
  isWarning = false,
}: {
  label: string;
  editableField: React.ReactNode;
  isWarning?: boolean;
}) {
  return (
    <div
      className={[
        "grid grid-cols-[140px_1fr] gap-4 items-start py-4",
        isWarning ? "relative" : "",
      ].join(" ")}
    >
      {/* Warning accent bar */}
      {isWarning && (
        <span
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[var(--tl-amber-border)]"
          aria-hidden="true"
        />
      )}
      <span
        className={[
          "tl-label pt-[3px]",
          isWarning ? "text-[var(--tl-amber)] pl-2.5" : "text-muted-foreground",
        ].join(" ")}
      >
        {label}
      </span>
      <div>{editableField}</div>
    </div>
  );
}
