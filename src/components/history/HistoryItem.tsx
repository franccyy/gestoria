"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatTime } from "@/lib/format";
import { replyPlainText } from "@/services/assistant/context";
import type { HistoryEntry } from "@/types/conversation";

interface HistoryItemProps {
  entry: HistoryEntry;
  /** Leva a pergunta de volta ao assistente. */
  onAskAgain: () => void;
}

/** Uma consulta do histórico: pergunta, resposta (recolhível) e ações. */
export function HistoryItem({ entry, onAskAgain }: HistoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const answer = entry.answer ? replyPlainText(entry.answer.text, entry.answer.details) : "Sem resposta registrada.";

  return (
    <Card as="li" variant="outlined">
      <p className="text-caption text-subtle">{formatTime(entry.question.createdAt)}</p>
      <p className="mt-1 text-lead font-medium text-foreground">{entry.question.text}</p>
      <p className={expanded ? "mt-2 text-body text-muted whitespace-pre-line" : "mt-2 line-clamp-2 text-body text-muted"}>
        {answer}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Button variant="link" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
          {expanded ? "Ver menos" : "Ver resposta completa"}
        </Button>
        <Button variant="link" onClick={onAskAgain}>
          Perguntar novamente
        </Button>
      </div>
    </Card>
  );
}
