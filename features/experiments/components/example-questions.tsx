"use client";

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
    <div className="flex flex-col gap-3">
      <p className="tl-label text-muted-foreground/60">Try an example</p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {EXAMPLES.map((example, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(example)}
            className={[
              "group text-left text-[13px] text-muted-foreground",
              "px-3.5 py-2.5 rounded-md",
              "border border-border bg-card",
              "hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground",
              "transition-all duration-150",
              "flex items-center justify-between gap-3",
              "sm:max-w-[calc(50%-4px)] lg:max-w-none",
            ].join(" ")}
          >
            <span className="leading-snug">
              &ldquo;{example}&rdquo;
            </span>
            <span
              className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors duration-150 text-base leading-none"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
