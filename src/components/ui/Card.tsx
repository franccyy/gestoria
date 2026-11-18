import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant =
  | "surface"   // branco simples (ex.: estado vazio)
  | "outlined"  // branco com contorno grosso (ex.: card do produto)
  | "muted"     // verde bem suave (ex.: representatividade)
  | "highlight" // verde-claro (ex.: faturamento mensal)
  | "primary"   // verde-escuro (ex.: "Pergunte ao assistente")
  | "tint-green"
  | "tint-peach"
  | "tint-blue"
  | "tint-lilac";

const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: "bg-surface",
  outlined: "bg-surface border-thick border-border",
  muted: "bg-surface-muted",
  highlight: "bg-highlight",
  primary: "bg-primary text-on-primary border border-primary-hover",
  "tint-green": "bg-tint-green",
  "tint-peach": "bg-tint-peach",
  "tint-blue": "bg-tint-blue",
  "tint-lilac": "bg-tint-lilac",
};

const PADDING_CLASSES = {
  none: "",
  sm: "p-4",
  md: "p-card",
  lg: "p-7",
} as const;

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  padding?: keyof typeof PADDING_CLASSES;
  /** "lg" arredonda mais, como o card principal do Início. */
  radius?: "card" | "lg";
  /** Elemento HTML a usar (section, article, li...). Padrão: div. */
  as?: "div" | "section" | "article" | "li";
}

/** Contêiner com fundo, cantos arredondados e espaçamento interno. */
export function Card({ variant = "surface", padding = "md", radius = "card", as: Tag = "div", className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        radius === "lg" ? "rounded-lg" : "rounded-card",
        className,
      )}
      {...rest}
    />
  );
}
