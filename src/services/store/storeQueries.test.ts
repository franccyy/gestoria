import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ALL_PRODUCTS, ALL_SALES, DATASET_INFO } from "@/data";
import { periodMonthKeys, type Period } from "@/lib/periods";
import {
  compareProductSales,
  compareStoreSales,
  currentMonthPeriod,
  currentYearPeriod,
  getLowStockProducts,
  getProductSales,
  getProductStock,
  getRepresentativeness,
  getStoreSales,
  getCategoryShare,
  getTopProducts,
  listCategories,
} from "./storeQueries";

const COCA_2L = "1001";
const NOV_2026: Period = { kind: "month", year: 2026, month: 11 };
const OCT_2026: Period = { kind: "month", year: 2026, month: 10 };

/** Soma independente, direto nos registros, para conferir as consultas. */
function rawSum(period: Period, code?: string) {
  const months = new Set(periodMonthKeys(period));
  const records = ALL_SALES.filter((r) => months.has(r.period) && (code === undefined || r.productCode === code));
  return {
    quantity: records.reduce((total, r) => total + r.quantity, 0),
    revenue: records.reduce((total, r) => total + r.revenue, 0),
  };
}

function expectOk<T>(result: { ok: true; data: T } | { ok: false; message: string }): T {
  if (!result.ok) assert.fail(`Esperava dados, recebeu: ${result.message}`);
  return result.data;
}

describe("base fictícia", () => {
  test("tem pelo menos 30 produtos em 5 ou mais categorias", () => {
    assert.ok(ALL_PRODUCTS.length >= 30);
    assert.ok(new Set(ALL_PRODUCTS.map((p) => p.category)).size >= 5);
  });

  test("códigos de produto são únicos", () => {
    assert.equal(new Set(ALL_PRODUCTS.map((p) => p.code)).size, ALL_PRODUCTS.length);
  });

  test("todo produto tem um registro de venda em cada mês da base", () => {
    const months = periodMonthKeys({ kind: "year", year: 2025, toMonth: 12 }).concat(periodMonthKeys(currentYearPeriod()));
    assert.equal(ALL_SALES.length, ALL_PRODUCTS.length * months.length);
    for (const product of ALL_PRODUCTS) {
      for (const month of months) {
        assert.ok(ALL_SALES.some((r) => r.productCode === product.code && r.period === month), `${product.code} sem ${month}`);
      }
    }
  });

  test("nenhum registro tem valores negativos", () => {
    assert.ok(ALL_SALES.every((r) => r.quantity >= 0 && r.revenue >= 0));
  });

  test("o mês de referência é novembro de 2026", () => {
    assert.deepEqual(DATASET_INFO.referenceMonth, { year: 2026, month: 11 });
    assert.deepEqual(currentMonthPeriod(), NOV_2026);
  });
});

describe("estoque", () => {
  test("saldo da Coca-Cola 2 litros", () => {
    const stock = expectOk(getProductStock(COCA_2L));
    assert.equal(stock.stock, 124);
    assert.equal(stock.isLow, false);
  });

  test("produto inexistente informa que não encontrou", () => {
    const result = getProductStock("9999");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "product_not_found");
  });

  test("lista de estoque baixo tem os 5 produtos esperados, do mais crítico ao menos crítico", () => {
    const low = getLowStockProducts();
    assert.deepEqual(new Set(low.map((item) => item.product.code)), new Set(["1005", "3004", "4004", "5002", "6002"]));
    assert.equal(low[0].product.code, "5002");
    assert.equal(low[0].isOutOfStock, true);
    for (let i = 1; i < low.length; i++) {
      assert.ok(low[i - 1].stock / low[i - 1].minStock <= low[i].stock / low[i].minStock);
    }
  });
});

describe("vendas de produto", () => {
  test("Coca-Cola 2 litros: 850 neste mês e 790 no mês anterior", () => {
    const nov = expectOk(getProductSales(COCA_2L, NOV_2026));
    const oct = expectOk(getProductSales(COCA_2L, OCT_2026));
    assert.equal(nov.quantity, 850);
    assert.equal(oct.quantity, 790);
    assert.equal(nov.revenue, 9341.5); // 850 × R$ 10,99
  });

  test("vendas no ano somam todos os meses do ano", () => {
    const year = expectOk(getProductSales(COCA_2L, currentYearPeriod()));
    assert.equal(year.quantity, rawSum(currentYearPeriod(), COCA_2L).quantity);
  });

  test("comparação com o mês anterior", () => {
    const comparison = expectOk(compareProductSales(COCA_2L, NOV_2026));
    assert.equal(comparison.previous.quantity, 790);
    assert.ok(Math.abs((comparison.quantityChange ?? 0) - (850 / 790 - 1)) < 1e-12);
  });

  test("período sem dados informa claramente", () => {
    for (const period of [
      { kind: "month", year: 2026, month: 12 },
      { kind: "month", year: 2024, month: 12 },
      { kind: "year", year: 2024, toMonth: 12 },
    ] satisfies Period[]) {
      const result = getProductSales(COCA_2L, period);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.reason, "no_data_for_period");
        assert.match(result.message, /Não encontrei dados de vendas/);
      }
    }
  });

  test("comparação com período sem dados falha em vez de inventar", () => {
    const result = compareProductSales(COCA_2L, { kind: "month", year: 2025, month: 1 });
    assert.equal(result.ok, false);
  });
});

describe("loja", () => {
  test("faturamento da loja é a soma de todos os produtos", () => {
    const store = expectOk(getStoreSales(NOV_2026));
    assert.ok(Math.abs(store.revenue - rawSum(NOV_2026).revenue) < 0.01);
    assert.ok(store.revenue > 0);
  });

  test("itens vendidos separam unidades e quilos", () => {
    const store = expectOk(getStoreSales(NOV_2026));
    assert.equal(store.unitsSold + store.kilogramsSold, rawSum(NOV_2026).quantity);
    assert.ok(store.kilogramsSold > 0);
  });

  test("variação do faturamento da loja em relação ao mês anterior", () => {
    const comparison = expectOk(compareStoreSales(NOV_2026));
    const expected = rawSum(NOV_2026).revenue / rawSum(OCT_2026).revenue - 1;
    assert.ok(Math.abs((comparison.revenueChange ?? 0) - expected) < 1e-6);
  });
});

describe("representatividade", () => {
  test("Coca-Cola 2 litros: faturamento do produto ÷ faturamento da loja", () => {
    const result = expectOk(getRepresentativeness(COCA_2L, NOV_2026));
    assert.ok(Math.abs(result.share - 9341.5 / rawSum(NOV_2026).revenue) < 1e-9);
    assert.ok(result.share > 0 && result.share < 1);
  });

  test("a soma da representatividade de todos os produtos é 100%", () => {
    const total = ALL_PRODUCTS.reduce((sum, product) => sum + expectOk(getRepresentativeness(product.code, NOV_2026)).share, 0);
    assert.ok(Math.abs(total - 1) < 1e-6);
  });
});

describe("ranking", () => {
  test("cinco mais vendidos em quantidade, em ordem decrescente", () => {
    const top = expectOk(getTopProducts(NOV_2026, "quantity", 5));
    assert.equal(top.length, 5);
    assert.deepEqual(top.map((item) => item.position), [1, 2, 3, 4, 5]);
    for (let i = 1; i < top.length; i++) assert.ok(top[i - 1].quantity >= top[i].quantity);
  });

  test("produto de maior faturamento é realmente o maior", () => {
    const [first] = expectOk(getTopProducts(NOV_2026, "revenue", 1));
    for (const product of ALL_PRODUCTS) {
      assert.ok(first.revenue >= rawSum(NOV_2026, product.code).revenue - 0.001);
    }
  });
});

describe("categorias", () => {
  test("7 categorias e soma das categorias = loja", () => {
    assert.equal(listCategories().length, 7);
    const total = listCategories().reduce((sum, c) => sum + expectOk(getStoreSales(NOV_2026, c)).revenue, 0);
    assert.ok(Math.abs(total - expectOk(getStoreSales(NOV_2026)).revenue) < 0.01);
  });

  test("participação das categorias soma 100%", () => {
    const total = listCategories().reduce((sum, c) => sum + expectOk(getCategoryShare(c, NOV_2026)).share, 0);
    assert.ok(Math.abs(total - 1) < 1e-9);
  });

  test("ranking com categoria só traz produtos dela", () => {
    const top = expectOk(getTopProducts(NOV_2026, "quantity", 10, "desc", "Limpeza"));
    assert.equal(top.length, 4);
    assert.ok(top.every((item) => item.product.category === "Limpeza"));
  });

  test("estoque baixo com categoria", () => {
    assert.deepEqual(getLowStockProducts("Laticínios").map((i) => i.product.code), ["3004"]);
    assert.deepEqual(getLowStockProducts("Padaria"), []);
  });
});
