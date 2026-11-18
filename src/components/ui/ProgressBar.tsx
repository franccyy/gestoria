import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** Proporção de 0 a 1. */
  ratio: number;
  /** Texto para leitores de tela (ex.: "5,1% do faturamento da loja"). */
  label: string;
  tone?: "primary" | "secondary";
  className?: string;
}

/** Barra horizontal de proporção (ex.: participação no faturamento). */
export function ProgressBar({ ratio, label, tone = "primary", className }: ProgressBarProps) {
  const percent = Math.min(Math.max(ratio, 0), 1) * 100;
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("h-2.5 overflow-hidden rounded-pill bg-surface", className)}
    >
      <div
        className={cn("h-full rounded-pill", tone === "primary" ? "bg-primary" : "bg-highlight-strong")}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
