import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  /** Valor já formatado (ex.: "R$ 182.346"). Sem valor, mostra "—". */
  value?: string;
  caption?: string;
  variant?: "highlight" | "primary" | "surface";
}

/** Card de um indicador numérico. */
export function MetricCard({ label, value, caption, variant = "highlight" }: MetricCardProps) {
  const onPrimary = variant === "primary";
  const hasValue = value !== undefined;
  return (
    <Card variant={variant} padding="sm" className="flex h-full min-w-0 flex-col sm:p-card">
      <p className={cn("text-body", onPrimary ? "text-on-primary" : "text-foreground")}>{label}</p>
      <p className={cn("mt-2 text-metric font-semibold break-words", onPrimary ? "text-on-primary" : "text-foreground")}>
        {hasValue ? value : <span aria-label="sem dados">—</span>}
      </p>
      <p className={cn("mt-auto pt-2 text-caption sm:text-body", onPrimary ? "text-on-primary/85" : "text-muted")}>
        {hasValue ? caption : "Sem dados"}
      </p>
    </Card>
  );
}
