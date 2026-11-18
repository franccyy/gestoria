/**
 * Cálculos comerciais "puros": recebem os registros e devolvem números.
 * Não sabem de onde vêm os dados (arquivo local hoje, banco de dados no futuro).
 */
import type { SalesRecord } from "@/types/store";

export interface SalesTotals {
  quantity: number;
  revenue: number;
}

/** Arredonda valores em reais para 2 casas, evitando resíduos como 0,30000000004. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Soma quantidade e faturamento dos registros cujos meses estão em `months`.
 * Se `productCode` for informado, considera só esse produto.
 */
export function sumSales(
  records: readonly SalesRecord[],
  months: ReadonlySet<string>,
  productCode?: string,
): SalesTotals {
  let quantity = 0;
  let revenue = 0;
  for (const record of records) {
    if (!months.has(record.period)) continue;
    if (productCode !== undefined && record.productCode !== productCode) continue;
    quantity += record.quantity;
    revenue += record.revenue;
  }
  return { quantity, revenue: roundMoney(revenue) };
}

/** Totais por produto no período, em um mapa código → totais. */
export function totalsByProduct(records: readonly SalesRecord[], months: ReadonlySet<string>): Map<string, SalesTotals> {
  const totals = new Map<string, SalesTotals>();
  for (const record of records) {
    if (!months.has(record.period)) continue;
    const current = totals.get(record.productCode) ?? { quantity: 0, revenue: 0 };
    current.quantity += record.quantity;
    current.revenue += record.revenue;
    totals.set(record.productCode, current);
  }
  for (const value of totals.values()) value.revenue = roundMoney(value.revenue);
  return totals;
}

/**
 * Variação percentual entre dois valores, como proporção.
 * 850 vs 790 → 0.0759 (+7,6%). Retorna null se o anterior for zero (não há base de comparação).
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}

/** Participação de uma parte no total, como proporção (0 a 1). Null se o total for zero. */
export function shareOf(part: number, total: number): number | null {
  if (total === 0) return null;
  return part / total;
}
