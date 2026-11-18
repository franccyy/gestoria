import type { IconName } from "@/components/ui/Icon";

/** Item da navegação inferior. */
export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

/**
 * Configuração única da navegação inferior.
 * Para adicionar, remover ou reordenar abas, altere só esta lista.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Início", href: "/inicio", icon: "home" },
  { label: "Assistente", href: "/assistente", icon: "chat" },
  { label: "Indicadores", href: "/indicadores", icon: "chart" },
  { label: "Histórico", href: "/historico", icon: "history" },
  { label: "Auditoria", href: "/auditoria", icon: "scanEye" },
];

/** Diz se uma aba deve aparecer destacada para o endereço atual. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
