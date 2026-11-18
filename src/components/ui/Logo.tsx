import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface LogoProps {
  /** "lg" para a tela de entrada, "sm" para espaços menores. */
  size?: "sm" | "lg";
  className?: string;
}

/** Marca do GestorIA: ícone em bloco verde-escuro + nome serifado. */
export function Logo({ size = "lg", className }: LogoProps) {
  const large = size === "lg";
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-sm bg-primary text-accent",
          large ? "size-12" : "size-9",
        )}
      >
        <Icon name="sparkles" className={large ? "size-6" : "size-5"} />
      </span>
      <span className={cn("font-serif font-semibold text-foreground", large ? "text-2xl" : "text-lg")}>
        GestorIA
      </span>
    </div>
  );
}
