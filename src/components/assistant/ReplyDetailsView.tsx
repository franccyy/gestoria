import { cn } from "@/lib/cn";
import type { ReplyDetails, ReplyListItem, ReplyTone } from "@/types/assistant";

const VALUE_TONE: Record<ReplyTone, string> = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-foreground",
  warning: "text-warning",
  danger: "text-danger",
};

/** Lista de linhas com rótulo à esquerda e valor (com unidade) à direita. */
function ItemList({ items }: { items: ReplyListItem[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-sm bg-surface">
      {items.map((item) => (
        <li key={item.label} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-body text-foreground">{item.label}</p>
            {item.note && <p className="text-caption text-muted">{item.note}</p>}
          </div>
          {item.value && (
            <span className={cn("shrink-0 text-right font-semibold whitespace-nowrap", VALUE_TONE[item.tone ?? "neutral"])}>
              {item.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Números e listas de uma resposta do assistente, organizados em blocos. */
export function ReplyDetailsView({ details }: { details: ReplyDetails }) {
  const { metrics, list, groups, footnote } = details;

  return (
    <div className="mt-3 flex flex-col gap-3">
      {list && list.length > 0 && <ItemList items={list} />}

      {groups?.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h2 className="mb-1.5 font-sans text-caption font-semibold tracking-wide text-primary uppercase">{group.title}</h2>
          <ItemList items={group.list} />
        </section>
      ))}

      {metrics && metrics.length > 0 && (
        <dl className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-sm bg-surface px-3.5 py-2.5">
              <dt className="text-caption text-muted">{metric.label}</dt>
              <dd className={cn("text-lead font-semibold", VALUE_TONE[metric.tone ?? "neutral"])}>{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {footnote && <p className="text-caption text-muted">{footnote}</p>}
    </div>
  );
}
