"use client";

import { useRouter } from "next/navigation";
import { SuggestionList } from "@/components/assistant/SuggestionList";
import { PageHeading } from "@/components/layout/PageHeading";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { accessSummary } from "@/lib/profiles";
import { suggestionsFor } from "@/lib/suggestions";
import { useProfile } from "@/state/ProfileContext";

/** Tela 2 — Início. */
export function HomeScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  if (!profile) return null;

  return (
    <>
      <PageHeading
        eyebrow="Painel inicial"
        size="display"
        title="Sua loja em uma conversa."
        description="Encontre respostas rápidas e explore os números que ajudam na operação."
      />

      <Card as="section" variant="primary" radius="lg" padding="lg" className="mt-section" aria-labelledby="ask-title">
        <div className="flex items-start justify-between gap-3">
          <span aria-hidden className="flex size-14 items-center justify-center rounded-sm bg-on-primary/10 text-accent">
            <Icon name="sparkles" className="size-7" />
          </span>
          <Badge tone="accent">MVP · DEMO</Badge>
        </div>
        <h2 id="ask-title" className="mt-6 text-xl font-semibold text-on-primary">
          Pergunte ao assistente
        </h2>
        <p className="mt-2 text-lead opacity-90">
          Consulte produtos, saldos e, conforme o perfil, indicadores de vendas. Respostas sempre por escrito.
        </p>
        <ButtonLink href="/assistente" variant="accent" iconRight="arrowUpRight" className="mt-6">
          Iniciar conversa
        </ButtonLink>
      </Card>

      <section className="mt-section" aria-labelledby="suggestions-title">
        <h2 id="suggestions-title" className="text-xl font-medium">
          Experimente perguntar
        </h2>
        <div className="mt-4">
          <SuggestionList
            suggestions={suggestionsFor(profile, 3)}
            onSelect={(item) => router.push(`/assistente?q=${encodeURIComponent(item.question)}`)}
          />
        </div>
        <p className="mt-6 text-caption text-muted">{accessSummary(profile)}</p>
      </section>
    </>
  );
}
