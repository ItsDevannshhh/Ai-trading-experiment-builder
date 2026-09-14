import { ExperimentWorkspace } from "@/features/experiments/components/experiment-workspace";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
            TradeLab
          </span>
          <Badge variant="secondary" className="font-normal text-xs text-zinc-500 pointer-events-none">
            AI Trading Research
          </Badge>
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
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
