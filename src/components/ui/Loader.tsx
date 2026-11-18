import { cn } from "@/lib/cn";

interface LoaderProps {
  /** Texto exibido e lido por leitores de tela. */
  label?: string;
  /** "spinner": círculo girando. "dots": três pontos (assistente digitando). */
  variant?: "spinner" | "dots";
  className?: string;
}

/** Indicador de carregamento. */
export function Loader({ label = "Carregando…", variant = "spinner", className }: LoaderProps) {
  return (
    <div role="status" aria-live="polite" className={cn("inline-flex items-center gap-3 text-muted", className)}>
      {variant === "spinner" ? (
        <span
          aria-hidden
          className="size-5 motion-safe:animate-spin rounded-full border-2 border-highlight border-t-primary"
        />
      ) : (
        <span aria-hidden className="inline-flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-2 motion-safe:animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      )}
      <span className="text-body">{label}</span>
    </div>
  );
}
