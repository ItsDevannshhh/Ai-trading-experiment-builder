import { TradingExperiment } from "../types/experiment.types";

interface AnalyzeExperimentResponse {
  experiment?: TradingExperiment;
  error?: string;
}

export async function analyzeExperiment(question: string): Promise<TradingExperiment> {
  const response = await fetch("/api/experiments/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to analyze the trading question.";
    try {
      const errorData = (await response.json()) as AnalyzeExperimentResponse;
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse errors for non-JSON error responses
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as AnalyzeExperimentResponse;
  
  if (!data.experiment) {
    throw new Error("Invalid response from server.");
  }

  return data.experiment;
}
