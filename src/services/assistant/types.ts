import type { ReplyContext, ReplyDetails } from "@/types/assistant";
import type { ChatMessage } from "@/types/conversation";
import type { Profile } from "@/types/profile";

/** Tudo o que o motor recebe para responder uma pergunta. */
export interface AssistantRequest {
  question: string;
  profile: Profile;
  /** Mensagens anteriores, para manter o contexto ("E no mês passado?"). */
  history: readonly ChatMessage[];
}

export interface AssistantReply {
  /** Frase principal da resposta. */
  text: string;
  status: "ok" | "unavailable" | "error";
  /** Números e listas organizados. */
  details?: ReplyDetails;
  /** Do que a resposta tratou (para a próxima pergunta). Ausente = mantém o contexto anterior. */
  context?: ReplyContext;
}

/**
 * Contrato de qualquer motor de respostas.
 * Hoje: motor por regras sobre a base fictícia (rules/ruleEngine.ts).
 * Futuro: motor que chama um modelo de IA (ex.: Claude API) pelo servidor,
 * usando as mesmas consultas de src/services/store como "ferramentas".
 * As telas não mudam quando o motor é trocado.
 */
export interface AssistantEngine {
  answer(request: AssistantRequest): Promise<AssistantReply>;
}
