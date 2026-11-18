import { ButtonLink } from "@/components/ui/Button";

interface AppHeaderProps {
  /** Nome exibido no topo. */
  title?: string;
  /** Perfil ativo (ex.: "Administrador"). Sem perfil, mostra só "Visão demonstrativa". */
  profileLabel?: string;
  /** Endereço da tela de seleção de perfil. Sem ele, o botão não aparece. */
  switchProfileHref?: string;
}

/** Cabeçalho fixo de todas as telas internas. */
export function AppHeader({ title = "GestorIA", profileLabel, switchProfileHref }: AppHeaderProps) {
  const subtitle = profileLabel ? `Visão demonstrativa · ${profileLabel}` : "Visão demonstrativa";

  return (
    <header className="flex items-center justify-between gap-4 border-b-thick border-border bg-background px-page py-4">
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      {switchProfileHref && (
        <ButtonLink href={switchProfileHref} variant="outline" size="sm" className="shrink-0">
          Trocar perfil
        </ButtonLink>
      )}
    </header>
  );
}
