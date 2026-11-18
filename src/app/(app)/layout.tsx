import { ProfileShell } from "@/components/layout/ProfileShell";

/**
 * Layout das telas internas. A pasta "(app)" entre parênteses é um
 * "grupo de rotas": organiza os arquivos sem aparecer no endereço
 * (ex.: src/app/(app)/inicio/page.tsx → /inicio).
 *
 * Todas as telas daqui exigem um perfil escolhido.
 */
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <ProfileShell>{children}</ProfileShell>;
}
