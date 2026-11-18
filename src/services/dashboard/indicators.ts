/**
 * Dados da tela de Indicadores, calculados a partir das consultas da loja.
 * A tela só exibe o que vem daqui; nenhum número é calculado nos componentes.
 */
import { previousPeriod, sameMonthLastYear, type Period } from "@/lib/periods";
import { lastConsultedProductCode } from "@/services/assistant/context";
import type { QueryResult } from "@/services/store/queryResult";
import { success } from "@/services/store/queryResult";
import {
  compareStoreSales,
  currentMonthPeriod,
  currentYearPeriod,
  getProduct,
  getProductSales,
  getProductStock,
  getRepresentativeness,
  getTopProducts,
  type ProductSales,
  type Representativeness,
  type StockInfo,
} from "@/services/store/storeQueries";
import type { ChatMessage } from "@/types/conversation";
import type { Product } from "@/types/store";

// ---------- Loja ----------

export interface StoreIndicators {
  period: Period;
  revenue: number;
  previousPeriod: Period;
  previousRevenue: number;
  /** Variação do faturamento (proporção). Null quando o mês anterior não tem faturamento. */
  revenueChange: number | null;
}

/** Faturamento do mês de referência e variação em relação ao mês anterior. */
export function getStoreIndicators(): QueryResult<StoreIndicators> {
  const period = currentMonthPeriod();
  const previous = previousPeriod(period);
  const comparison = compareStoreSales(period, previous);
  if (!comparison.ok) return comparison;
  return success({
    period,
    revenue: comparison.data.current.revenue,
    previousPeriod: previous,
    previousRevenue: comparison.data.previous.revenue,
    revenueChange: comparison.data.revenueChange,
  });
}

// ---------- Produto ----------

export interface PeriodSales {
  label: string;
  period: Period;
  quantity: number;
  revenue: number;
}

export interface ProductIndicators {
  product: Product;
  stock: StockInfo;
  month: ProductSales;
  year: ProductSales;
  /** Este mês, mês anterior e (se houver dados) o mesmo mês do ano anterior. */
  comparison: PeriodSales[];
  /** Variação da quantidade em relação ao mês anterior. */
  quantityChange: number | null;
  representativeness: Representativeness;
}

function toPeriodSales(label: string, sales: ProductSales): PeriodSales {
  return { label, period: sales.period, quantity: sales.quantity, revenue: sales.revenue };
}

/** Todos os indicadores de um produto no mês de referência. */
export function getProductIndicators(code: string): QueryResult<ProductIndicators> {
  const stock = getProductStock(code);
  if (!stock.ok) return stock;
  const monthPeriod = currentMonthPeriod();
  const month = getProductSales(code, monthPeriod);
  if (!month.ok) return month;
  const year = getProductSales(code, currentYearPeriod());
  if (!year.ok) return year;
  const lastMonth = getProductSales(code, previousPeriod(monthPeriod));
  if (!lastMonth.ok) return lastMonth;
  const representativeness = getRepresentativeness(code, monthPeriod);
  if (!representativeness.ok) return representativeness;

  const comparison = [
    toPeriodSales("Este mês", month.data),
    toPeriodSales("Mês anterior", lastMonth.data),
  ];
  // O mesmo mês do ano anterior só entra se existir na base.
  if (monthPeriod.kind === "month") {
    const lastYear = getProductSales(code, sameMonthLastYear(monthPeriod));
    if (lastYear.ok) comparison.push(toPeriodSales("Mesmo mês do ano anterior", lastYear.data));
  }

  return success({
    product: stock.data.product,
    stock: stock.data,
    month: month.data,
    year: year.data,
    comparison,
    quantityChange: lastMonth.data.quantity === 0 ? null : (month.data.quantity - lastMonth.data.quantity) / lastMonth.data.quantity,
    representativeness: representativeness.data,
  });
}

// ---------- Escolha do produto exibido ----------

/** Por que o produto está no card: dá o título do card. */
export type ProductSelectionReason = "search" | "assistant" | "topSeller";

export interface ProductSelection {
  code: string;
  reason: ProductSelectionReason;
}

/**
 * Produto exibido quando o usuário não escolheu um na busca:
 * 1. o último produto consultado no Assistente;
 * 2. senão, o mais vendido do mês (em quantidade).
 */
export function pickDefaultProduct(history: readonly ChatMessage[]): ProductSelection | undefined {
  const consulted = lastConsultedProductCode(history);
  if (consulted && getProduct(consulted).ok) return { code: consulted, reason: "assistant" };
  const top = getTopProducts(currentMonthPeriod(), "quantity", 1);
  if (top.ok && top.data[0]) return { code: top.data[0].product.code, reason: "topSeller" };
  return undefined;
}

export const SELECTION_TITLES: Record<ProductSelectionReason, string> = {
  search: "Produto escolhido na busca",
  assistant: "Último produto consultado no Assistente",
  topSeller: "Mais vendido do mês",
};
