import type { ReactNode } from "react";

interface PageHeadingProps {
  /** Rótulo pequeno em maiúsculas acima do título (ex.: "Painel inicial"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Ações abaixo da descrição (ex.: "Limpar histórico"). */
  children?: ReactNode;
  /** "display" = título maior, usado no Início. */
  size?: "title" | "display";
}

/** Bloco de título padrão das telas. */
export function PageHeading({ eyebrow, title, description, children, size = "title" }: PageHeadingProps) {
  return (
    <div>
      {eyebrow && <p className="text-caption uppercase tracking-eyebrow text-muted">{eyebrow}</p>}
      <h1
        className={
          size === "display"
            ? "mt-3 text-display font-semibold"
            : "mt-3 text-title font-medium"
        }
      >
        {title}
      </h1>
      {description && <p className="mt-2 text-lead text-muted">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
