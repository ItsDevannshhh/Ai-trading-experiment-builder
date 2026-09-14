import { ExperimentWorkspace } from "@/features/experiments/components/experiment-workspace";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 h-14 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Wordmark */}
          <span className="font-semibold text-[15px] tracking-tight text-foreground select-none">
            TradeLab
          </span>
          {/* Visual separator */}
          <span className="w-px h-3.5 bg-border" aria-hidden="true" />
          {/* Eyebrow label */}
          <span className="tl-label text-muted-foreground/70 hidden sm:block">
            AI Experiment Builder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60"
            aria-label="Research workspace"
          >
            {/* Live indicator dot */}
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/70"
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
