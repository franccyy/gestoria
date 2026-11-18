"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeading } from "@/components/layout/PageHeading";
import { Loader } from "@/components/ui/Loader";
import { suggestionsFor } from "@/lib/suggestions";
import { useConversation } from "@/state/ConversationContext";
import { useProfile } from "@/state/ProfileContext";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { SuggestionList } from "./SuggestionList";

const WELCOME =
  "Olá! Sou o assistente do GestorIA. Pergunte por texto ou pelo microfone sobre estoque, preços e vendas — por exemplo, o saldo da Coca-Cola 2 litros.";

/** Tela 3 — Assistente. */
export function AssistantScreen() {
  const { profile } = useProfile();
  const { messages, pending, send } = useConversation();
  const searchParams = useSearchParams();
  const prefill = searchParams.get("q") ?? "";
  const endRef = useRef<HTMLDivElement>(null);

  // Mantém a última mensagem visível.
  useEffect(() => {
    if (messages.length === 0 && !pending) return;
    // Respeita quem configurou o sistema para reduzir animações.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
  }, [messages.length, pending]);

  if (!profile) return null;

  return (
    <>
      <PageHeading
        eyebrow="Consulta inteligente"
        title="Assistente"
        description="Pergunte em linguagem natural. As respostas são calculadas sobre a base fictícia da loja."
      />

      <div className="mt-6 flex flex-col gap-4" aria-live="polite" aria-relevant="additions">
        <MessageBubble role="assistant" text={WELCOME} />
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            text={message.text}
            status={message.status}
            details={message.details}
            createdAt={message.createdAt}
          />
        ))}
        {pending && <Loader variant="dots" label="Consultando…" />}
      </div>

      {messages.length === 0 && (
        <section className="mt-6" aria-label="Perguntas sugeridas">
          <SuggestionList suggestions={suggestionsFor(profile)} onSelect={(item) => send(item.question)} disabled={pending} />
        </section>
      )}

      <div ref={endRef} className="mt-6 scroll-mb-40">
        <ChatInput onSubmit={send} disabled={pending} initialValue={prefill} />
        <p className="mt-3 text-caption text-muted">As respostas são sempre apresentadas por escrito.</p>
      </div>
    </>
  );
}
