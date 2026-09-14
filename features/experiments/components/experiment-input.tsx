"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RiMagicLine } from "@remixicon/react";
import { ExampleQuestions } from "./example-questions";

export function ExperimentInput() {
  const [query, setQuery] = useState("");

  const handleAnalyze = () => {
    // For now, no API call
    console.log("Analyzing:", query);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative">
        <Textarea
          placeholder="Example: Does buying NIFTY after a 1% fall work better during high-volatility periods?"
          className="min-h-[160px] resize-none text-base md:text-base p-5 pb-16 shadow-sm rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Trading hypothesis"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button 
            onClick={handleAnalyze} 
            disabled={!query.trim()}
            className="gap-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <RiMagicLine className="w-4 h-4" />
            Analyze Experiment
          </Button>
        </div>
      </div>
      <ExampleQuestions onSelect={setQuery} />
    </div>
  );
}
