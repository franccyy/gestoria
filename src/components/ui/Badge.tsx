import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "accent" | "highlight" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  accent: "bg-accent text-on-accent border border-primary/40",
  highlight: "bg-highlight text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** Etiqueta curta, como "MVP · DEMO" ou "Em breve". */
export function Badge({ tone = "highlight", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3.5 py-1 text-sm font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
