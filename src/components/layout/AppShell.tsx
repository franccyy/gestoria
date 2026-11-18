import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { DemoBanner } from "./DemoBanner";
import { SkipLink } from "./SkipLink";

interface AppShellProps {
  children: ReactNode;
  profileLabel?: string;
  switchProfileHref?: string;
}

/**
 * Estrutura comum das telas internas:
 * cabeçalho → faixa "Dados fictícios" → conteúdo → navegação inferior.
 *
 * No celular ocupa a tela toda; no tablet/computador aparece
 * centralizada como um "aparelho", igual ao protótipo.
 */
export function AppShell({ children, profileLabel, switchProfileHref }: AppShellProps) {
  return (
    <div className="min-h-dvh sm:pt-6">
      <SkipLink targetId="conteudo" />
      <div className="mx-auto flex min-h-dvh max-w-app flex-col bg-background sm:min-h-[calc(100dvh-1.5rem)] sm:overflow-hidden sm:rounded-t-lg sm:shadow-app">
        <AppHeader profileLabel={profileLabel} switchProfileHref={switchProfileHref} />
        <main id="conteudo" tabIndex={-1} className="pb-nav-safe flex-1 px-page pt-5 outline-none">
          <DemoBanner />
          <div className="mt-7">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
