/**
 * Junta classes CSS ignorando valores vazios.
 * Exemplo: cn("p-4", isActive && "bg-highlight") → "p-4 bg-highlight"
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
