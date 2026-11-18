import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ícone ao final. Padrão: seta diagonal, como nas sugestões do protótipo. */
  icon?: IconName | null;
}

/** Botão em formato de pílula, usado para sugestões de perguntas. */
export function Chip({ icon = "arrowUpRight", className, children, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center gap-1.5 rounded-pill border-thick border-border bg-surface px-5 py-2",
        "text-left text-body text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
      {icon && <Icon name={icon} className="size-4" />}
    </button>
  );
}
