import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { normalizeText } from "@/lib/text";
import { listProducts } from "@/services/store/storeQueries";
import { detectIntent, isKnownWord } from "./intentDetector";
import { parsePeriods } from "./periodParser";
import { matchProducts } from "./productMatcher";

const REFERENCE = { year: 2026, month: 11 };
const periodsOf = (question: string) => parsePeriods(normalizeText(question), REFERENCE).periods.map((p) => p.period);
const productsOf = (question: string) => matchProducts(question, listProducts(), isKnownWord).products.map((p) => p.name);
const intentOf = (question: string) => detectIntent(normalizeText(question)).intent;

describe("períodos", () => {
  test("relativos ao mês de referência", () => {
    assert.deepEqual(periodsOf("vendas neste mês"), [{ kind: "month", year: 2026, month: 11 }]);
    assert.deepEqual(periodsOf("E no mês passado?"), [{ kind: "month", year: 2026, month: 10 }]);
    assert.deepEqual(periodsOf("vendas neste ano"), [{ kind: "year", year: 2026, toMonth: 11 }]);
    assert.deepEqual(periodsOf("no ano passado"), [{ kind: "year", year: 2025, toMonth: 12 }]);
  });

  test("meses por nome e por número", () => {
    assert.deepEqual(periodsOf("em março"), [{ kind: "month", year: 2026, month: 3 }]);
    assert.deepEqual(periodsOf("em dezembro"), [{ kind: "month", year: 2025, month: 12 }]);
    assert.deepEqual(periodsOf("outubro de 2025"), [{ kind: "month", year: 2025, month: 10 }]);
    assert.deepEqual(periodsOf("em 10/2025"), [{ kind: "month", year: 2025, month: 10 }]);
  });

  test("anos explícitos", () => {
    assert.deepEqual(periodsOf("em 2025"), [{ kind: "year", year: 2025, toMonth: 12 }]);
    assert.deepEqual(periodsOf("em 2026"), [{ kind: "year", year: 2026, toMonth: 11 }]);
  });

  test("números de produto não viram período", () => {
    assert.deepEqual(periodsOf("Coca-Cola 2 litros"), []);
    assert.deepEqual(periodsOf("Papel Higiênico 12 rolos"), []);
  });

  test("ordem de citação", () => {
    assert.deepEqual(periodsOf("outubro e setembro"), [
      { kind: "month", year: 2026, month: 10 },
      { kind: "month", year: 2026, month: 9 },
    ]);
  });
});

describe("produtos", () => {
  test("identifica o produto específico", () => {
    assert.deepEqual(productsOf("Qual o saldo atual da Coca-Cola 2 litros?"), ["Coca-Cola 2 litros"]);
    assert.deepEqual(productsOf("coca lata"), ["Coca-Cola Lata 350 ml"]);
    assert.deepEqual(productsOf("estoque de tomate"), ["Tomate"]);
    assert.deepEqual(productsOf("molho de tomate"), ["Molho de Tomate 340 g"]);
    assert.deepEqual(productsOf("vendas de cervejas"), ["Cerveja Pilsen Lata 350 ml"]);
  });

  test("termo ambíguo devolve todas as opções", () => {
    assert.deepEqual(new Set(productsOf("Coca-Cola")), new Set(["Coca-Cola 2 litros", "Coca-Cola Lata 350 ml"]));
    assert.deepEqual(new Set(productsOf("pão")), new Set(["Pão Francês", "Pão de Forma 500 g"]));
  });

  test("dois produtos diferentes citados", () => {
    assert.deepEqual(new Set(productsOf("coca 2l e guaraná")), new Set(["Coca-Cola 2 litros", "Guaraná Antarctica 2 litros"]));
  });

  test("perguntas sem produto", () => {
    for (const q of ["Quanto vendemos neste mês?", "Quais são os cinco produtos mais vendidos?", "Qual produto possui maior faturamento?"]) {
      assert.deepEqual(productsOf(q), [], q);
    }
  });

  test("palavra desconhecida é sinalizada", () => {
    assert.deepEqual(matchProducts("saldo da picanha", listProducts(), isKnownWord).unmatchedTokens, ["picanha"]);
    assert.deepEqual(matchProducts("Quanto vendemos neste mês?", listProducts(), isKnownWord).unmatchedTokens, []);
  });
});

describe("intenções", () => {
  test("cada pergunta sugerida", () => {
    assert.equal(intentOf("Qual o saldo atual da Coca-Cola 2 litros?"), "stock");
    assert.equal(intentOf("Quanto vendemos neste mês?"), "sales");
    assert.equal(intentOf("Qual produto possui maior faturamento?"), "ranking");
    assert.equal(intentOf("Qual a representatividade da Coca-Cola nas vendas?"), "representativeness");
    assert.equal(intentOf("Quais são os cinco produtos mais vendidos?"), "ranking");
    assert.equal(intentOf("Quais produtos estão com estoque baixo?"), "lowStock");
    assert.equal(intentOf("Compare as vendas da Coca-Cola 2 litros com o mês passado"), "comparison");
  });

  test("continuação e parâmetros do ranking", () => {
    assert.equal(detectIntent(normalizeText("E no mês passado?")).isFollowUp, true);
    assert.equal(detectIntent(normalizeText("Quais são os cinco produtos mais vendidos?")).ranking.limit, 5);
    assert.equal(detectIntent(normalizeText("top 3")).ranking.limit, 3);
    assert.equal(detectIntent(normalizeText("Qual produto possui maior faturamento?")).ranking.limit, 1);
    assert.equal(detectIntent(normalizeText("menos vendidos")).ranking.direction, "asc");
  });
});
