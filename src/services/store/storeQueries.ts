/**
 * Consultas sobre a loja: estoque, vendas, faturamento, representatividade,
 * comparações, ranking e estoque baixo.
 *
 * Usadas pelo Assistente (src/services/assistant) e pelos Indicadores (src/services/dashboard).
 * Todos os números vêm da base fictícia (src/data); nada é estimado.
 */
import { ALL_PRODUCTS, ALL_SALES, DATASET_INFO } from "@/data";
import {
  isPeriodWithin,
  monthLabel,
  monthPeriod,
  periodLabel,
  periodMonthKeys,
  previousPeriod,
  yearToDatePeriod,
  type Period,
} from "@/lib/periods";
import { percentChange, roundMoney, shareOf, sumSales, totalsByProduct, type SalesTotals } from "@/services/calculations/sales";
import type { Product, ProductCategory } from "@/types/store";
import { failure, success, type QueryResult } from "./queryResult";

// ---------- Tipos de resultado ----------

export interface StockInfo {
  product: Product;
  stock: number;
  minStock: number;
  /** Saldo menor ou igual ao estoque mínimo. */
  isLow: boolean;
  isOutOfStock: boolean;
}

export interface ProductSales extends SalesTotals {
  product: Product;
  period: Period;
}

export interface StoreSales {
  period: Period;
  /** Preenchido quando o total é de uma categoria, e não da loja toda. */
  category?: ProductCategory;
  revenue: number;
  /** Itens vendidos por unidade. */
  unitsSold: number;
  /** Itens vendidos por quilo. */
  kilogramsSold: number;
}

export interface Representativeness {
  product: Product;
  period: Period;
  productRevenue: number;
  storeRevenue: number;
  /** Participação no faturamento da loja (0 a 1). */
  share: number;
}

export interface CategoryShare {
  category: ProductCategory;
  period: Period;
  categoryRevenue: number;
  storeRevenue: number;
  /** Participação da categoria no faturamento da loja (0 a 1). */
  share: number;
}

export interface Comparison<T> {
  current: T;
  previous: T;
  /** Variação da quantidade (proporção). Null quando o anterior é zero. */
  quantityChange: number | null;
  /** Variação do faturamento (proporção). Null quando o anterior é zero. */
  revenueChange: number | null;
}

export interface RankedProduct extends SalesTotals {
  position: number;
  product: Product;
}

export type RankingCriterion = "quantity" | "revenue";

// ---------- Informações gerais ----------

/** Nome da loja e meses disponíveis na base. */
export function getDatasetInfo() {
  return DATASET_INFO;
}

/** Mês de referência ("neste mês"). */
export function currentMonthPeriod(): Period {
  return monthPeriod(DATASET_INFO.referenceMonth);
}

/** Acumulado do ano até o mês de referência ("neste ano"). */
export function currentYearPeriod(): Period {
  return yearToDatePeriod(DATASET_INFO.referenceMonth);
}

export function listProducts(): readonly Product[] {
  return ALL_PRODUCTS;
}

/** Categorias existentes, na ordem do cadastro. */
export function listCategories(): ProductCategory[] {
  return [...new Set(ALL_PRODUCTS.map((product) => product.category))];
}

export function listProductsByCategory(category: ProductCategory): Product[] {
  return ALL_PRODUCTS.filter((product) => product.category === category);
}

/** Produtos da loja toda ou só de uma categoria. */
function productsIn(category?: ProductCategory): readonly Product[] {
  return category ? listProductsByCategory(category) : ALL_PRODUCTS;
}

// ---------- Validações internas ----------

function coverageMessage(): string {
  return `A base fictícia tem vendas de ${monthLabel(DATASET_INFO.firstMonth)} a ${monthLabel(DATASET_INFO.referenceMonth)}.`;
}

function checkPeriod(period: Period): QueryResult<Set<string>> {
  if (!isPeriodWithin(period, DATASET_INFO.firstMonth, DATASET_INFO.referenceMonth)) {
    return failure("no_data_for_period", `Não encontrei dados de vendas para ${periodLabel(period)}. ${coverageMessage()}`);
  }
  return success(new Set(periodMonthKeys(period)));
}

// ---------- Produto ----------

export function getProduct(code: string): QueryResult<Product> {
  const product = ALL_PRODUCTS.find((item) => item.code === code);
  return product
    ? success(product)
    : failure("product_not_found", `Não encontrei nenhum produto com o código ${code} na base fictícia.`);
}

/** Saldo em estoque de um produto. */
export function getProductStock(code: string): QueryResult<StockInfo> {
  const found = getProduct(code);
  if (!found.ok) return found;
  const product = found.data;
  return success({
    product,
    stock: product.stock,
    minStock: product.minStock,
    isLow: product.stock <= product.minStock,
    isOutOfStock: product.stock === 0,
  });
}

/** Quantidade vendida e faturamento de um produto no período. */
export function getProductSales(code: string, period: Period): QueryResult<ProductSales> {
  const found = getProduct(code);
  if (!found.ok) return found;
  const months = checkPeriod(period);
  if (!months.ok) return months;
  return success({ product: found.data, period, ...sumSales(ALL_SALES, months.data, code) });
}

/** Compara as vendas de um produto entre dois períodos (padrão: período anterior equivalente). */
export function compareProductSales(
  code: string,
  current: Period,
  previous: Period = previousPeriod(current),
): QueryResult<Comparison<ProductSales>> {
  const a = getProductSales(code, current);
  if (!a.ok) return a;
  const b = getProductSales(code, previous);
  if (!b.ok) return b;
  return success({
    current: a.data,
    previous: b.data,
    quantityChange: percentChange(a.data.quantity, b.data.quantity),
    revenueChange: percentChange(a.data.revenue, b.data.revenue),
  });
}

// ---------- Loja ----------

/** Faturamento total e itens vendidos da loja (ou de uma categoria) no período. */
export function getStoreSales(period: Period, category?: ProductCategory): QueryResult<StoreSales> {
  const months = checkPeriod(period);
  if (!months.ok) return months;

  let unitsSold = 0;
  let kilogramsSold = 0;
  let revenue = 0;
  const totals = totalsByProduct(ALL_SALES, months.data);
  for (const product of productsIn(category)) {
    const item = totals.get(product.code);
    if (!item) continue;
    revenue += item.revenue;
    if (product.unit === "kg") kilogramsSold += item.quantity;
    else unitsSold += item.quantity;
  }
  return success({ period, category, revenue: roundMoney(revenue), unitsSold, kilogramsSold });
}

/** Compara o faturamento da loja (ou de uma categoria) entre dois períodos. */
export function compareStoreSales(
  current: Period,
  previous: Period = previousPeriod(current),
  category?: ProductCategory,
): QueryResult<Comparison<StoreSales>> {
  const a = getStoreSales(current, category);
  if (!a.ok) return a;
  const b = getStoreSales(previous, category);
  if (!b.ok) return b;
  return success({
    current: a.data,
    previous: b.data,
    quantityChange: percentChange(a.data.unitsSold, b.data.unitsSold),
    revenueChange: percentChange(a.data.revenue, b.data.revenue),
  });
}

/** Participação do produto no faturamento da loja: faturamento do produto ÷ faturamento da loja. */
export function getRepresentativeness(code: string, period: Period): QueryResult<Representativeness> {
  const productSales = getProductSales(code, period);
  if (!productSales.ok) return productSales;
  const storeSales = getStoreSales(period);
  if (!storeSales.ok) return storeSales;

  const share = shareOf(productSales.data.revenue, storeSales.data.revenue);
  if (share === null) {
    return failure("no_data_for_period", `A loja não teve faturamento em ${periodLabel(period)}.`);
  }
  return success({
    product: productSales.data.product,
    period,
    productRevenue: productSales.data.revenue,
    storeRevenue: storeSales.data.revenue,
    share,
  });
}

/** Participação de uma categoria no faturamento da loja. */
export function getCategoryShare(category: ProductCategory, period: Period): QueryResult<CategoryShare> {
  const categorySales = getStoreSales(period, category);
  if (!categorySales.ok) return categorySales;
  const storeSales = getStoreSales(period);
  if (!storeSales.ok) return storeSales;
  const share = shareOf(categorySales.data.revenue, storeSales.data.revenue);
  if (share === null) return failure("no_data_for_period", `A loja não teve faturamento em ${periodLabel(period)}.`);
  return success({ category, period, categoryRevenue: categorySales.data.revenue, storeRevenue: storeSales.data.revenue, share });
}

/**
 * Ranking de produtos no período, por quantidade ou por faturamento.
 * direction "desc" = mais vendidos / maior faturamento; "asc" = menos vendidos.
 * Com `category`, considera só os produtos daquela categoria.
 */
export function getTopProducts(
  period: Period,
  by: RankingCriterion,
  limit = 5,
  direction: "desc" | "asc" = "desc",
  category?: ProductCategory,
): QueryResult<RankedProduct[]> {
  const months = checkPeriod(period);
  if (!months.ok) return months;

  const sign = direction === "desc" ? 1 : -1;
  const totals = totalsByProduct(ALL_SALES, months.data);
  const ranking = productsIn(category).map((product) => ({ product, ...(totals.get(product.code) ?? { quantity: 0, revenue: 0 }) }))
    .sort((a, b) => sign * (b[by] - a[by]) || a.product.name.localeCompare(b.product.name, "pt-BR"))
    .slice(0, Math.max(0, limit))
    .map((item, index) => ({ position: index + 1, ...item }));
  return success(ranking);
}

/**
 * Produtos com saldo menor ou igual ao estoque mínimo.
 * Ordenados do mais crítico (menor saldo em relação ao mínimo) para o menos crítico.
 */
export function getLowStockProducts(category?: ProductCategory): StockInfo[] {
  return productsIn(category).filter((product) => product.stock <= product.minStock)
    .sort((a, b) => a.stock / a.minStock - b.stock / b.minStock)
    .map((product) => ({
      product,
      stock: product.stock,
      minStock: product.minStock,
      isLow: true,
      isOutOfStock: product.stock === 0,
    }));
}
