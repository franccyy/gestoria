import { cn } from "@/lib/cn";

export interface ComparisonItem {
  label: string;
  /** Número usado para o tamanho da barra. */
  value?: number;
  /** Texto exibido (ex.: "850 un."). */
  display?: string;
  /** Texto pequeno abaixo do rótulo (ex.: "novembro de 2026"). */
  note?: string;
}

/**
 * Barras horizontais para comparar períodos.
 * A primeira barra usa a cor principal; as demais, verde médio.
 */
export function ComparisonBars({ items }: { items: readonly ComparisonItem[] }) {
  const max = Math.max(0, ...items.map((item) => item.value ?? 0));

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item, index) => {
        const percent = max > 0 && item.value !== undefined ? (item.value / max) * 100 : 0;
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-body text-foreground">
                {item.label}
                {item.note && <span className="block text-caption text-subtle">{item.note}</span>}
              </span>
              <span className="shrink-0 font-semibold whitespace-nowrap text-foreground">{item.display ?? "—"}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-pill bg-surface-muted" aria-hidden>
              <div
                className={cn("h-full rounded-pill", index === 0 ? "bg-primary" : "bg-highlight-strong")}
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
