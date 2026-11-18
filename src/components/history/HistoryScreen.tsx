"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeading } from "@/components/layout/PageHeading";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildHistory } from "@/lib/history";
import { useConversation } from "@/state/ConversationContext";
import { HistoryItem } from "./HistoryItem";

/** Tela 5 — Histórico da sessão. */
export function HistoryScreen() {
  const router = useRouter();
  const { messages, clear } = useConversation();
  const entries = useMemo(() => buildHistory(messages), [messages]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  return (
    <>
      <PageHeading
        eyebrow="Esta sessão"
        title="Histórico"
        description="Reveja as perguntas feitas enquanto este protótipo estiver aberto."
      >
        <Button variant="link" onClick={() => setConfirmOpen(true)} disabled={entries.length === 0}>
          Limpar histórico
        </Button>
      </PageHeading>

      <div className="mt-6 flex flex-col gap-3">
        {cleared && entries.length === 0 && <Alert tone="success">Histórico limpo.</Alert>}

        {entries.length === 0 ? (
          <EmptyState
            action={
              <ButtonLink href="/assistente" variant="outline" size="sm" iconRight="arrowUpRight">
                Abrir assistente
              </ButtonLink>
            }
          >
            Nenhuma pergunta ainda. Abra o assistente para começar uma conversa.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onAskAgain={() => router.push(`/assistente?q=${encodeURIComponent(entry.question.text)}`)}
              />
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Limpar histórico?"
        description="As perguntas e respostas desta sessão serão apagadas, inclusive na tela do Assistente. Esta ação não pode ser desfeita."
        confirmLabel="Limpar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          clear();
          setConfirmOpen(false);
          setCleared(true);
        }}
      />
    </>
  );
}
