import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

/** Página exibida quando o endereço não existe (erro 404). */
export default function NotFound() {
  return (
    <main className="min-h-dvh sm:py-6">
      <div className="mx-auto flex min-h-dvh max-w-app flex-col bg-background px-page py-section sm:min-h-0 sm:rounded-lg sm:shadow-app">
        <Logo />
        <p className="mt-10 text-caption uppercase tracking-eyebrow text-muted">Erro 404</p>
        <h1 className="mt-3 text-display font-semibold">Página não encontrada.</h1>
        <p className="mt-3 text-lead text-muted">O endereço digitado não existe neste protótipo.</p>
        <ButtonLink href="/" iconRight="arrowUpRight" className="mt-section self-start">
          Voltar ao início
        </ButtonLink>
      </div>
    </main>
  );
}
