import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "accent" | "outline" | "link";
export type ButtonSize = "sm" | "md";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /** Ação principal (verde-escuro). */
  primary: "rounded-pill bg-primary text-on-primary hover:bg-primary-hover",
  /** Destaque amarelo-limão, como "Iniciar conversa". */
  accent: "rounded-sm bg-accent text-on-accent hover:bg-accent-hover",
  /** Contorno grosso, como "Trocar perfil". */
  outline: "rounded-pill border-thick border-border bg-surface text-foreground hover:border-border-strong",
  /** Botão de texto sublinhado, como "Limpar histórico". */
  link: "underline-thick text-foreground hover:text-primary",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-11 px-5 text-body",
  md: "h-12 px-6 text-lead",
};

/**
 * Gera as classes de um botão. Usado por <Button> e <ButtonLink>,
 * garantindo que ambos tenham exatamente a mesma aparência.
 */
export function buttonClasses({ variant = "primary", size = "md", fullWidth }: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[variant],
    variant === "link" ? "px-0 py-1 text-body" : SIZE_CLASSES[size],
    fullWidth && "w-full",
  );
}

interface ContentProps {
  children: ReactNode;
  iconLeft?: IconName;
  iconRight?: IconName;
}

function ButtonContent({ children, iconLeft, iconRight }: ContentProps) {
  return (
    <>
      {iconLeft && <Icon name={iconLeft} className="size-4" />}
      {children}
      {iconRight && <Icon name={iconRight} className="size-4" />}
    </>
  );
}

type ButtonProps = ButtonStyleOptions &
  Omit<ContentProps, "children"> &
  ButtonHTMLAttributes<HTMLButtonElement>;

/** Botão que executa uma ação (onClick, envio de formulário). */
export function Button({ variant, size, fullWidth, iconLeft, iconRight, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...rest}>
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonStyleOptions & Omit<ContentProps, "children"> & ComponentProps<typeof Link>;

/** Mesmo visual do Button, mas navega para outra tela. */
export function ButtonLink({ variant, size, fullWidth, iconLeft, iconRight, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...rest}>
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </Link>
  );
}
