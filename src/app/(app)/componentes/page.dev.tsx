import { ComponentGallery } from "@/components/showcase/ComponentGallery";

/**
 * Vitrine de componentes (/componentes): ferramenta de desenvolvimento.
 *
 * O nome "page.dev.tsx" (e não "page.tsx") faz esta página existir só no
 * modo de desenvolvimento (npm run dev). Na versão de produção (npm run build)
 * ela nem é gerada — veja "pageExtensions" em next.config.ts.
 */
export default function ComponentesPage() {
  return <ComponentGallery />;
}
