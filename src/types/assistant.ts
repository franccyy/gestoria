import type { Period } from "@/lib/periods";
import type { ProductCategory } from "./store";

/** O que o usuário quer saber. */
export type AssistantIntent =
  | "help"               // saudação ou "o que você faz?"
  | "overview"           // só o nome do produto: resumo
  | "stock"              // saldo em estoque
  | "price"              // preço atual
  | "sales"              // quantidade vendida (produto) ou vendas da loja
  | "revenue"            // faturamento (produto ou loja)
  | "representativeness" // participação no faturamento da loja
  | "comparison"         // comparar períodos
  | "ranking"            // mais/menos vendidos, maior faturamento
  | "lowStock";          // produtos com estoque baixo

/**
 * Contexto salvo em cada resposta, para entender a pergunta seguinte.
 * Ex.: depois de "Quanto vendemos de Coca-Cola 2 litros?",
 * "E no mês passado?" reaproveita produto e intenção daqui.
 */
export interface ReplyContext {
  intent: AssistantIntent;
  /** "products" = sobre produtos específicos; "store" = sobre a loja toda (ou categorias). */
  scope: "products" | "store";
  productCodes: string[];
  /** Categorias filtradas (ex.: só Limpeza). Vazio/ausente = loja toda. */
  categories?: ProductCategory[];
  /** A pergunta pediu o resultado separado por categoria ("de cada categoria"). */
  perCategory?: boolean;
  period?: Period;
  /** Parâmetros do último ranking (para "E em outubro?" repetir o mesmo ranking). */
  ranking?: { by: "quantity" | "revenue"; direction: "desc" | "asc"; limit: number };
}

export type ReplyTone = "positive" | "negative" | "neutral" | "warning" | "danger";

/** Número de destaque exibido em um mini card dentro da resposta. */
export interface ReplyMetric {
  label: string;
  value: string;
  tone?: ReplyTone;
}

/** Linha de uma lista (ranking, estoque baixo, vários produtos). */
export interface ReplyListItem {
  label: string;
  /** Valor principal, sempre com a unidade (ex.: "850 un.", "1.286 kg", "R$ 9.341,50"). */
  value: string;
  note?: string;
  tone?: ReplyTone;
}

/** Lista com título, para respostas separadas por grupo (ex.: uma lista por categoria). */
export interface ReplyGroup {
  title: string;
  list: ReplyListItem[];
}

/** Partes organizadas de uma resposta, além do texto principal. */
export interface ReplyDetails {
  metrics?: ReplyMetric[];
  list?: ReplyListItem[];
  groups?: ReplyGroup[];
  footnote?: string;
}
