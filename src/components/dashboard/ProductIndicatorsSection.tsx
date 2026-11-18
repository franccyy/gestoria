import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, formatPercent, formatQuantity, formatSignedPercent } from "@/lib/format";
import { periodLabel } from "@/lib/periods";
import { SELECTION_TITLES, type ProductIndicators, type ProductSelectionReason } from "@/services/dashboard/indicators";
import { ComparisonBars } from "./ComparisonBars";
import { ProductPicker } from "./ProductPicker";
import { StatGrid, type Stat } from "./StatGrid";

interface ProductIndicatorsSectionProps {
  indicators: ProductIndicators;
  reason: ProductSelectionReason;
  /** Perfil vê faturamento e representatividade. */
  commercial: boolean;
  onSelectProduct: (code: string) => void;
  /** Volta ao produto padrão (só quando o produto veio da busca). */
  onResetSelection?: () => void;
}

/** Card do produto, comparação de vendas e representatividade. */
export function ProductIndicatorsSection({ indicators, reason, commercial, onSelectProduct, onResetSelection }: ProductIndicatorsSectionProps) {
  const { product, stock, month, year, comparison, quantityChange, representativeness } = indicators;
  const unit = product.unit;

  const stats: Stat[] = [
    {
      label: "Estoque",
      value: formatQuantity(stock.stock, unit),
      note: `mínimo ${formatQuantity(stock.minStock, unit)}`,
      tone: stock.isOutOfStock ? "danger" : stock.isLow ? "warning" : undefined,
    },
    { label: "Vendas no mês", value: formatQuantity(month.quantity, unit), note: periodLabel(month.period) },
    { label: "Vendas no ano", value: formatQuantity(year.quantity, unit), note: periodLabel(year.period) },
    ...(commercial
      ? [{ label: "Faturamento no mês", value: formatCurrency(month.revenue), note: periodLabel(month.period) }]
      : [{ label: "Preço atual", value: `${formatCurrency(product.price)}${unit === "kg" ? "/kg" : ""}` }]),
  ];

  return (
    <>
      <Card as="section" variant="outlined" className="mt-4" aria-labelledby="product-title">
        <p className="text-caption tracking-wide text-primary uppercase">{SELECTION_TITLES[reason]}</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <h2 id="product-title" className="font-sans text-lead font-medium">
            {product.name}
          </h2>
          {stock.isOutOfStock ? <Badge tone="danger">Sem estoque</Badge> : stock.isLow ? <Badge tone="warning">Estoque baixo</Badge> : null}
        </div>
        <p className="mt-1 text-body text-muted">
          {product.category} · código {product.code} · vendido por {unit === "kg" ? "quilo" : "unidade"}
        </p>

        <div className="mt-5">
          <StatGrid stats={stats} />
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <ProductPicker onSelect={(selected) => onSelectProduct(selected.code)} />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {onResetSelection && (
              <Button variant="link" onClick={onResetSelection}>
                Voltar ao produto padrão
              </Button>
            )}
            <ButtonLink
              variant="link"
              href={`/assistente?q=${encodeURIComponent(`Quanto vendemos de ${product.name}?`)}`}
            >
              Perguntar ao assistente
            </ButtonLink>
          </div>
        </div>
      </Card>

      <Card as="section" variant="outlined" className="mt-4" aria-labelledby="comparison-title">
        <h2 id="comparison-title" className="font-sans text-lead font-medium">
          Comparação de vendas do produto
        </h2>
        <p className="mt-1 text-body text-muted">
          {quantityChange === null
            ? "Sem vendas no mês anterior para calcular a variação."
            : `${formatSignedPercent(quantityChange)} em quantidade em relação ao mês anterior.`}
        </p>
        <div className="mt-4">
          <ComparisonBars
            items={comparison.map((item) => ({
              label: item.label,
              note: periodLabel(item.period),
              value: item.quantity,
              display: formatQuantity(item.quantity, unit),
            }))}
          />
        </div>
      </Card>

      {commercial && (
        <Card as="section" variant="muted" className="mt-4" aria-labelledby="share-title">
          <h2 id="share-title" className="font-sans text-lead font-medium">
            Representatividade · {formatPercent(representativeness.share)}
          </h2>
          <ProgressBar
            className="mt-3"
            ratio={representativeness.share}
            label={`${formatPercent(representativeness.share)} do faturamento da loja`}
          />
          <p className="mt-3 text-body text-muted">
            {product.name} faturou {formatCurrency(representativeness.productRevenue)} de{" "}
            {formatCurrency(representativeness.storeRevenue)} da loja em {periodLabel(representativeness.period)} (faturamento do produto ÷
            faturamento da loja × 100).
          </p>
        </Card>
      )}
    </>
  );
}
