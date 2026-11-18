import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getStoreSales, getTopProducts } from "@/services/store/storeQueries";
import type { ChatMessage } from "@/types/conversation";
import { getProductIndicators, getStoreIndicators, pickDefaultProduct } from "./indicators";

const NOV = { kind: "month", year: 2026, month: 11 } as const;
const OCT = { kind: "month", year: 2026, month: 10 } as const;

function unwrap<T>(result: { ok: true; data: T } | { ok: false; message: string }): T {
  if (!result.ok) assert.fail(result.message);
  return result.data;
}

function answer(context: ChatMessage["context"]): ChatMessage {
  return { id: Math.random().toString(), role: "assistant", text: "", createdAt: "", context };
}

describe("indicadores da loja", () => {
  test("faturamento de novembro e variação sobre outubro", () => {
    const store = unwrap(getStoreIndicators());
    const nov = unwrap(getStoreSales(NOV)).revenue;
    const oct = unwrap(getStoreSales(OCT)).revenue;
    assert.equal(store.revenue, nov);
    assert.equal(store.previousRevenue, oct);
    assert.ok(Math.abs((store.revenueChange ?? 0) - (nov / oct - 1)) < 1e-9);
  });
});

describe("indicadores do produto", () => {
  test("Coca-Cola 2 litros", () => {
    const coca = unwrap(getProductIndicators("1001"));
    assert.equal(coca.stock.stock, 124);
    assert.equal(coca.month.quantity, 850);
    assert.equal(coca.month.revenue, 9341.5);
    assert.deepEqual(coca.comparison.map((c) => c.quantity).slice(0, 2), [850, 790]);
    assert.equal(coca.comparison.length, 3, "deve incluir o mesmo mês do ano anterior");
    assert.ok(Math.abs((coca.quantityChange ?? 0) - (850 / 790 - 1)) < 1e-12);
    assert.ok(coca.year.quantity > coca.month.quantity);
    assert.ok(coca.representativeness.share > 0 && coca.representativeness.share < 1);
  });

  test("produto inexistente informa o erro", () => {
    const result = getProductIndicators("9999");
    assert.equal(result.ok, false);
  });
});

describe("produto exibido por padrão", () => {
  test("sem conversa: o mais vendido do mês", () => {
    const [top] = unwrap(getTopProducts(NOV, "quantity", 1));
    assert.deepEqual(pickDefaultProduct([]), { code: top.product.code, reason: "topSeller" });
  });

  test("com conversa: o último produto consultado", () => {
    const history = [
      answer({ intent: "stock", scope: "products", productCodes: ["1001"] }),
      answer({ intent: "ranking", scope: "store", productCodes: [] }),
      answer({ intent: "sales", scope: "products", productCodes: ["2001"] }),
      answer({ intent: "lowStock", scope: "store", productCodes: [] }),
    ];
    assert.deepEqual(pickDefaultProduct(history), { code: "2001", reason: "assistant" });
  });
});
