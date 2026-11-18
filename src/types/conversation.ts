import type { ReplyContext, ReplyDetails } from "./assistant";

export type MessageRole = "user" | "assistant";

/** Uma mensagem da conversa com o assistente. */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  /** Texto principal (na resposta do assistente, a frase de abertura). */
  text: string;
  /** Data/hora em ISO 8601 (texto, para poder salvar na sessão). */
  createdAt: string;
  /** "unavailable" = não encontrou dados, sem permissão ou não entendeu. */
  status?: "ok" | "unavailable" | "error";
  /** Números e listas organizados (somente respostas do assistente). */
  details?: ReplyDetails;
  /** Do que a resposta tratou, para manter o contexto. */
  context?: ReplyContext;
}

/** Uma pergunta com sua resposta, como aparece no Histórico. */
export interface HistoryEntry {
  id: string;
  question: ChatMessage;
  answer?: ChatMessage;
}
