import type { AccessLevel, Profile } from "@/types/profile";
import { canAccess } from "./profiles";

export interface QuestionSuggestion {
  /** Texto curto exibido no chip. */
  label: string;
  /** Pergunta completa enviada ao assistente. */
  question: string;
  /** Nível de acesso necessário. */
  requires: AccessLevel;
}

/** Perguntas frequentes. A ordem define a prioridade de exibição. */
export const SUGGESTIONS: readonly QuestionSuggestion[] = [
  { label: "Estoque do produto", question: "Qual o saldo atual da Coca-Cola 2 litros?", requires: "operational" },
  { label: "Vendas do mês", question: "Quanto vendemos neste mês?", requires: "commercial" },
  { label: "Comparar períodos", question: "Compare as vendas da Coca-Cola 2 litros com o mês passado", requires: "commercial" },
  { label: "Mais vendidos", question: "Quais são os cinco produtos mais vendidos?", requires: "operational" },
  { label: "Estoque baixo", question: "Quais produtos estão com estoque baixo?", requires: "operational" },
  { label: "Maior faturamento", question: "Qual produto possui maior faturamento?", requires: "commercial" },
  { label: "Representatividade", question: "Qual a representatividade da Coca-Cola nas vendas?", requires: "commercial" },
];

/** Sugestões permitidas para o perfil, limitadas a `limit` itens. */
export function suggestionsFor(profile: Profile, limit?: number): QuestionSuggestion[] {
  const allowed = SUGGESTIONS.filter((item) => canAccess(profile, item.requires));
  return limit ? allowed.slice(0, limit) : allowed;
}
