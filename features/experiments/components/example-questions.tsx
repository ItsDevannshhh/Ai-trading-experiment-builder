"use client";

import { Badge } from "@/components/ui/badge";

const EXAMPLES = [
  "Does buying NIFTY after a 1% fall work better during high-volatility periods?",
  "Does buying NIFTY after a 1% daily fall and holding for 5 trading days produce positive returns?",
  "Does buying NIFTY after a big fall work?",
];

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
}

export function ExampleQuestions({ onSelect }: ExampleQuestionsProps) {
  return (
    <div className="flex flex-col gap-3 mt-4">
      <p className="text-sm text-zinc-500 font-medium">Try an example</p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="cursor-pointer font-normal hover:bg-secondary/80 text-xs sm:text-sm py-1.5 px-3 transition-colors text-left h-auto whitespace-normal rounded-md"
            onClick={() => onSelect(example)}
          >
            {example}
          </Badge>
        ))}
      </div>
    </div>
  );
}
