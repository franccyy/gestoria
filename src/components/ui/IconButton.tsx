import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type IconButtonVariant = "primary" | "soft" | "danger";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  soft: "bg-highlight text-primary hover:bg-surface-muted",
  danger: "bg-danger-soft text-danger hover:bg-danger-soft/70",
};

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconName;
  /** Obrigatório: descreve a ação para leitores de tela (ex.: "Enviar pergunta"). */
  label: string;
  variant?: IconButtonVariant;
}

/** Botão quadrado só com ícone (enviar, microfone, fechar...). */
export function IconButton({ icon, label, variant = "primary", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-sm transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} className="size-5" />
    </button>
  );
}
