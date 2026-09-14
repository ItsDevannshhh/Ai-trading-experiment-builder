import type { HoldingPeriod } from "../types/experiment.types";

export function parseHoldingPeriod(answer: string): HoldingPeriod | null {
  const normalized = answer.toLowerCase().trim();
  
  // Extract number and unit
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(days?|trading days?|weeks?|months?|hours?|mins?|minutes?)$/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const rawUnit = match[2];
  
  let unit: HoldingPeriod["unit"] = "unknown";
  
  if (rawUnit.includes("day")) {
    unit = "days";
  } else if (rawUnit.includes("week")) {
    unit = "weeks";
  } else if (rawUnit.includes("month")) {
    unit = "months";
  } else if (rawUnit.includes("hour")) {
    unit = "hours";
  } else if (rawUnit.includes("min")) {
    unit = "minutes";
  }

  if (unit === "unknown") return null;

  return {
    value,
    unit,
    description: answer.trim()
  };
}
