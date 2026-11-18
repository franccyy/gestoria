/**
 * Mostra no terminal um resumo da base fictícia, calculado pelas mesmas
 * funções que o Assistente e os Indicadores usam.
 *
 * Uso:  npm run data:summary
 */
import { formatCurrency, formatPercent, formatQuantity, formatSignedPercent } from "../src/lib/format";
import { periodLabel, previousPeriod } from "../src/lib/periods";
import {
  compareProductSales,
  compareStoreSales,
  currentMonthPeriod,
  currentYearPeriod,
  getDatasetInfo,
  getLowStockProducts,
  getRepresentativeness,
  getStoreSales,
  getTopProducts,
  listProducts,
} from "../src/services/store/storeQueries";

const month = currentMonthPeriod();
const info = getDatasetInfo();
const unwrap = <T>(result: { ok: true; data: T } | { ok: false; message: string }): T => {
  if (!result.ok) throw new Error(result.message);
  return result.data;
};

console.log(`\n${info.storeName} — dados FICTÍCIOS`);
console.log(`Produtos: ${listProducts().length} · Mês de referência: ${periodLabel(month)}\n`);

const store = unwrap(compareStoreSales(month));
const year = unwrap(getStoreSales(currentYearPeriod()));
console.log("LOJA");
console.log(`  Faturamento em ${periodLabel(month)}: ${formatCurrency(store.current.revenue)}`);
console.log(`  Faturamento em ${periodLabel(previousPeriod(month))}: ${formatCurrency(store.previous.revenue)}`);
console.log(`  Variação: ${store.revenueChange === null ? "sem base de comparação" : formatSignedPercent(store.revenueChange)}`);
console.log(`  Faturamento em ${periodLabel(currentYearPeriod())}: ${formatCurrency(year.revenue)}\n`);

const coca = unwrap(compareProductSales("1001", month));
const share = unwrap(getRepresentativeness("1001", month));
console.log(`EXEMPLO: ${coca.current.product.name}`);
console.log(`  Estoque: ${formatQuantity(coca.current.product.stock, coca.current.product.unit)}`);
console.log(`  Vendas: ${formatQuantity(coca.current.quantity, "un")} (mês anterior: ${formatQuantity(coca.previous.quantity, "un")})`);
console.log(`  Faturamento: ${formatCurrency(coca.current.revenue)} · Representatividade: ${formatPercent(share.share)}\n`);

console.log(`5 MAIS VENDIDOS EM ${periodLabel(month).toUpperCase()} (quantidade)`);
console.table(
  unwrap(getTopProducts(month, "quantity", 5)).map((item) => ({
    "#": item.position,
    Produto: item.product.name,
    Quantidade: formatQuantity(item.quantity, item.product.unit),
    Faturamento: formatCurrency(item.revenue),
  })),
);

console.log("ESTOQUE BAIXO (saldo ≤ mínimo)");
console.table(
  getLowStockProducts().map((item) => ({
    Produto: item.product.name,
    Saldo: formatQuantity(item.stock, item.product.unit),
    Mínimo: formatQuantity(item.minStock, item.product.unit),
  })),
);
