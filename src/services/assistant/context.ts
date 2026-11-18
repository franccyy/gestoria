import type { ReplyContext, ReplyDetails } from "@/types/assistant";
import type { ChatMessage } from "@/types/conversation";

/** Contexto da resposta mais recente que tenha contexto. */
export function findLastContext(history: readonly ChatMessage[]): ReplyContext | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const context = history[i].context;
    if (history[i].role === "assistant" && context) return context;
  }
  return undefined;
}

/** Código do último produto consultado na conversa (usado pelos Indicadores). */
export function lastConsultedProductCode(history: readonly ChatMessage[]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const context = history[i].context;
    if (history[i].role === "assistant" && context?.scope === "products" && context.productCodes.length > 0) {
      return context.productCodes[0];
    }
  }
  return undefined;
}

/**
 * Resposta completa em texto simples (frase + lista + números),
 * usada no Histórico e em qualquer lugar que não mostre os cards.
 */
export function replyPlainText(text: string, details?: ReplyDetails): string {
  const lines = [text];
  for (const item of details?.list ?? []) {
    const value = item.value ? `: ${item.value}` : "";
    lines.push(`• ${item.label}${value}${item.note ? ` (${item.note})` : ""}`);
  }
  for (const group of details?.groups ?? []) {
    lines.push(`${group.title}:`);
    for (const item of group.list) lines.push(`  • ${item.label}${item.value ? `: ${item.value}` : ""}${item.note ? ` (${item.note})` : ""}`);
  }
  for (const metric of details?.metrics ?? []) {
    lines.push(`${metric.label}: ${metric.value}`);
  }
  if (details?.footnote) lines.push(details.footnote);
  return lines.join("\n");
}
