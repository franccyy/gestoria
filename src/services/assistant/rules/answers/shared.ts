/** Funções comuns para montar respostas. */
import { formatNumber, formatPercent, formatSignedPercent } from "@/lib/format";
import { periodLabel, type Period } from "@/lib/periods";
import type { QueryResult } from "@/services/store/queryResult";
import type { ReplyContext, ReplyDetails, ReplyTone } from "@/types/assistant";
import type { ProductUnit } from "@/types/store";
import type { AssistantReply } from "../../types";

export function ok(text: string, context: ReplyContext, details?: ReplyDetails): AssistantReply {
  return { text, status: "ok", details, context };
}

/** Resposta sem dados (não encontrou, sem permissão, não entendeu). Não altera o contexto. */
export function unavailable(text: string, details?: ReplyDetails): AssistantReply {
  return { text, status: "unavailable", details };
}

/** Converte o resultado de uma consulta em dados, ou em resposta de "não encontrei". */
export function unwrapAll<T>(results: QueryResult<T>[]): { data: T[] } | { reply: AssistantReply } {
  const failed = results.find((result) => !result.ok);
  if (failed && !failed.ok) return { reply: unavailable(failed.message) };
  return { data: results.map((result) => (result as { ok: true; data: T }).data) };
}

/** "em novembro de 2026", "em 2025", "em 2026 (jan. a nov.)" */
export function inPeriod(period: Period): string {
  return `em ${periodLabel(period)}`;
}

/** "foram vendidas 850 unidades" / "foi vendida 1 unidade" / "foram vendidos 1.286 kg" */
export function soldPhrase(quantity: number, unit: ProductUnit): string {
  if (unit === "kg") return `foram vendidos ${formatNumber(quantity)} kg`;
  return quantity === 1 ? "foi vendida 1 unidade" : `foram vendidas ${formatNumber(quantity)} unidades`;
}

export function changeTone(change: number | null): ReplyTone {
  if (change === null || Math.abs(change) < 0.0005) return "neutral";
  return change > 0 ? "positive" : "negative";
}

/** "alta de 7,6%", "queda de 4,1%", "estável" ou explicação quando não há base. */
export function describeChange(change: number | null): string {
  if (change === null) return "sem vendas no período anterior para calcular a variação";
  if (Math.abs(change) < 0.0005) return "estável";
  return `${change > 0 ? "alta" : "queda"} de ${formatPercent(Math.abs(change))}`;
}

/** Variação com sinal para mini cards, ou "—" sem base. */
export function signedChange(change: number | null): string {
  return change === null ? "—" : formatSignedPercent(change);
}

/** Nota padrão para listas que misturam unidades e quilos. */
export const MIXED_UNITS_FOOTNOTE = "Quantidades em unidades (un.) ou quilos (kg), conforme a forma de venda de cada produto.";
