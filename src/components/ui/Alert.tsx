import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONES: Record<AlertTone, { classes: string; icon: IconName }> = {
  info: { classes: "bg-highlight text-foreground [&_svg]:text-primary", icon: "info" },
  success: { classes: "bg-success-soft text-foreground [&_svg]:text-success", icon: "check" },
  warning: { classes: "bg-warning-soft text-foreground [&_svg]:text-warning", icon: "alert" },
  danger: { classes: "bg-danger-soft text-foreground [&_svg]:text-danger", icon: "alert" },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  /** Botão ou link opcional (ex.: "Tentar novamente"). */
  action?: ReactNode;
  className?: string;
}

/** Mensagem de aviso, erro ou sucesso. Erros são anunciados por leitores de tela. */
export function Alert({ tone = "info", title, children, action, className }: AlertProps) {
  const { classes, icon } = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-card p-4", classes, className)}
    >
      <Icon name={icon} className="mt-0.5 size-5" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn("text-body text-muted", title && "mt-1")}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
