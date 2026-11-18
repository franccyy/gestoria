"use client";

interface SkipLinkProps {
  /** id do elemento que recebe o foco (ex.: "conteudo"). */
  targetId: string;
}

/**
 * "Pular para o conteúdo": primeiro item focável da página.
 * Fica invisível até receber o foco pelo teclado (Tab) e leva direto ao
 * conteúdo, sem passar pelo cabeçalho. Recurso de acessibilidade.
 */
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(event) => {
        event.preventDefault();
        document.getElementById(targetId)?.focus();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary"
    >
      Pular para o conteúdo
    </a>
  );
}
