"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isChatMessageList } from "@/lib/history";
import { createId } from "@/lib/id";
import { readSession, removeSession, writeSession } from "@/lib/sessionStore";
import { assistantEngine } from "@/services/assistant";
import type { ChatMessage } from "@/types/conversation";
import { useProfile } from "./ProfileContext";

interface ConversationContextValue {
  messages: ChatMessage[];
  /** false enquanto a conversa salva na sessão ainda está sendo lida. */
  ready: boolean;
  /** true enquanto o assistente prepara a resposta. */
  pending: boolean;
  send: (question: string) => Promise<void>;
  clear: () => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);
const STORAGE_KEY = "conversation";

/** Tempo mínimo do indicador "Consultando…", para a resposta não "piscar" na tela. */
const MIN_RESPONSE_MS = 350;

function makeMessage(role: ChatMessage["role"], text: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: createId(), role, text, createdAt: new Date().toISOString(), ...extra };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Guarda a conversa da sessão. É compartilhada pelas telas
 * Assistente e Histórico, e sobrevive à troca de abas.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  // Só grava depois de restaurar o que já estava salvo, para não apagar a conversa ao recarregar.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMessages(readSession(STORAGE_KEY, isChatMessageList) ?? []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeSession(STORAGE_KEY, messages);
  }, [loaded, messages]);

  const send = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || !profile || pending) return;

      const userMessage = makeMessage("user", question);
      const history = messages;
      setMessages((current) => [...current, userMessage]);
      setPending(true);

      try {
        const [reply] = await Promise.all([assistantEngine.answer({ question, profile, history }), wait(MIN_RESPONSE_MS)]);
        setMessages((current) => [
          ...current,
          makeMessage("assistant", reply.text, { status: reply.status, details: reply.details, context: reply.context }),
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          makeMessage("assistant", "Ocorreu um erro ao processar a pergunta. Tente novamente.", { status: "error" }),
        ]);
      } finally {
        setPending(false);
      }
    },
    [messages, pending, profile],
  );

  const clear = useCallback(() => {
    setMessages([]);
    removeSession(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ messages, ready: loaded, pending, send, clear }),
    [messages, loaded, pending, send, clear],
  );

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}

export function useConversation(): ConversationContextValue {
  const context = useContext(ConversationContext);
  if (!context) throw new Error("useConversation deve ser usado dentro de <ConversationProvider>.");
  return context;
}
