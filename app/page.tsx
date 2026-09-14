import { ExperimentWorkspace } from "@/features/experiments/components/experiment-workspace";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 h-14 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Wordmark with indigo accent dot */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--tl-accent)" }}
              aria-hidden="true"
            />
            <span className="font-semibold text-[15px] tracking-tight text-foreground select-none">
              TradeLab
            </span>
          </div>
          {/* Visual separator */}
          <span className="w-px h-3.5 bg-border" aria-hidden="true" />
          {/* Eyebrow label */}
          <span className="tl-label hidden sm:block">
            AI Experiment Builder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60"
            aria-label="Research workspace"
          >
            {/* Live indicator dot — green */}
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--tl-green)" }}
              aria-hidden="true"
            />
            Research Workspace
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <ExperimentWorkspace />
      </main>
    </div>
  );
}
