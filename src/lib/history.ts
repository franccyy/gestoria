import type { ChatMessage, HistoryEntry } from "@/types/conversation";

/**
 * Agrupa as mensagens em pares pergunta → resposta,
 * do mais recente para o mais antigo.
 */
export function buildHistory(messages: readonly ChatMessage[]): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const message of messages) {
    if (message.role === "user") {
      entries.push({ id: message.id, question: message });
    } else {
      const last = entries[entries.length - 1];
      if (last && !last.answer) last.answer = message;
    }
  }
  return entries.reverse();
}

/** Valida dados lidos do armazenamento da sessão. */
export function isChatMessageList(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.text === "string" &&
        typeof item.createdAt === "string",
    )
  );
}
