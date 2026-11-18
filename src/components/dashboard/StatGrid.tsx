import { cn } from "@/lib/cn";

export interface Stat {
  label: string;
  /** Valor formatado, com unidade. Sem valor, mostra "—". */
  value?: string;
  /** Texto pequeno abaixo do valor (ex.: período). */
  note?: string;
  tone?: "warning" | "danger";
}

const TONE_CLASSES = { warning: "text-warning", danger: "text-danger" } as const;

/** Grade de pares rótulo/valor, como no card do produto. */
export function StatGrid({ stats }: { stats: readonly Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <dt className="text-body text-muted">{stat.label}</dt>
          <dd className={cn("font-semibold", stat.tone ? TONE_CLASSES[stat.tone] : "text-foreground")}>{stat.value ?? "—"}</dd>
          {stat.note && <dd className="text-caption text-subtle">{stat.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
