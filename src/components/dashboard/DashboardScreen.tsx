"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeading } from "@/components/layout/PageHeading";
import { Alert } from "@/components/ui/Alert";
import { Loader } from "@/components/ui/Loader";
import { formatCurrencyRounded, formatSignedPercent } from "@/lib/format";
import { periodLabel } from "@/lib/periods";
import { canAccess } from "@/lib/profiles";
import { getProductIndicators, getStoreIndicators, pickDefaultProduct, type ProductSelection } from "@/services/dashboard/indicators";
import { getProduct } from "@/services/store/storeQueries";
import { useConversation } from "@/state/ConversationContext";
import { useProfile } from "@/state/ProfileContext";
import { MetricCard } from "./MetricCard";
import { ProductIndicatorsSection } from "./ProductIndicatorsSection";

/** Parâmetro do endereço com o produto escolhido na busca (ex.: /indicadores?produto=2001). */
const PRODUCT_PARAM = "produto";

/** Tela 4 — Indicadores, calculados a partir da base fictícia. */
export function DashboardScreen() {
  const { profile } = useProfile();
  const { messages, ready } = useConversation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get(PRODUCT_PARAM);

  const store = useMemo(() => getStoreIndicators(), []);

  // Produto do card: escolhido na busca (endereço) > último consultado no Assistente > mais vendido do mês.
  const invalidCode = codeFromUrl !== null && !getProduct(codeFromUrl).ok ? codeFromUrl : null;
  const selection: ProductSelection | undefined = useMemo(() => {
    if (codeFromUrl && !invalidCode) return { code: codeFromUrl, reason: "search" };
    return pickDefaultProduct(messages);
  }, [codeFromUrl, invalidCode, messages]);
  const product = useMemo(() => (selection ? getProductIndicators(selection.code) : undefined), [selection]);

  if (!profile) return null;
  const commercial = canAccess(profile, "commercial");

  return (
    <>
      <PageHeading
        eyebrow="Visão comercial"
        title="Indicadores"
        description={
          store.ok
            ? `Números de ${periodLabel(store.data.period)}, calculados a partir da base fictícia.`
            : "Números calculados a partir da base fictícia."
        }
      />

      {/* ---------- Loja ---------- */}
      {commercial ? (
        store.ok ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricCard
              label="Faturamento mensal · loja"
              value={formatCurrencyRounded(store.data.revenue)}
              caption={periodLabel(store.data.period)}
              variant="highlight"
            />
            <MetricCard
              label="Variação mensal · loja"
              value={store.data.revenueChange === null ? undefined : formatSignedPercent(store.data.revenueChange)}
              caption={`vs. ${periodLabel(store.data.previousPeriod)} (${formatCurrencyRounded(store.data.previousRevenue)})`}
              variant="primary"
            />
          </div>
        ) : (
          <Alert tone="danger" title="Não foi possível calcular os indicadores da loja" className="mt-6">
            {store.message}
          </Alert>
        )
      ) : (
        <Alert tone="info" className="mt-6">
          Faturamento, variação e representatividade são exclusivos dos perfis Gerente e Administrador.
        </Alert>
      )}

      {/* ---------- Produto ---------- */}
      {invalidCode && (
        <Alert tone="warning" className="mt-4">
          Não encontrei o produto de código {invalidCode}. Mostrando o produto padrão.
        </Alert>
      )}

      {!ready ? (
        <Loader className="mt-6" label="Carregando indicadores do produto…" />
      ) : !selection || !product ? (
        <Alert tone="warning" className="mt-4">
          Não há produtos na base fictícia para exibir.
        </Alert>
      ) : !product.ok ? (
        <Alert tone="danger" title="Não foi possível calcular os indicadores do produto" className="mt-4">
          {product.message}
        </Alert>
      ) : (
        <ProductIndicatorsSection
          indicators={product.data}
          reason={selection.reason}
          commercial={commercial}
          onSelectProduct={(code) => router.replace(`/indicadores?${PRODUCT_PARAM}=${code}`)}
          onResetSelection={selection.reason === "search" ? () => router.replace("/indicadores") : undefined}
        />
      )}
    </>
  );
}
