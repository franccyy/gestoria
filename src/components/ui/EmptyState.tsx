import type { ReactNode } from "react";
import { Card } from "./Card";

interface EmptyStateProps {
  children: ReactNode;
  /** Ação opcional, como um botão para abrir o assistente. */
  action?: ReactNode;
}

/** Card exibido quando não há itens (ex.: "Nenhuma pergunta ainda"). */
export function EmptyState({ children, action }: EmptyStateProps) {
  return (
    <Card variant="surface" padding="lg">
      <p className="text-body text-muted">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
