import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { normalizeText } from "@/lib/text";
import { searchProducts } from "./productSearch";

const names = (query: string) => searchProducts(query).map((product) => product.name);

describe("normalização de texto", () => {
  test("remove acentos, pontuação e padroniza unidades", () => {
    assert.equal(normalizeText("Coca-Cola 2L"), "coca cola 2 litros");
    assert.equal(normalizeText("Água 1.5 lt"), "agua 1,5 litros");
    assert.equal(normalizeText("Açúcar Refinado 1kg"), "acucar refinado 1 kg");
  });
});

describe("busca de produtos", () => {
  test("encontra a Coca-Cola 2 litros com abreviação", () => {
    assert.deepEqual(names("coca 2l"), ["Coca-Cola 2 litros"]);
    assert.deepEqual(names("Coca-Cola 2 litros"), ["Coca-Cola 2 litros"]);
  });

  test("termo genérico retorna todas as opções", () => {
    assert.deepEqual(new Set(names("coca")), new Set(["Coca-Cola 2 litros", "Coca-Cola Lata 350 ml"]));
  });

  test("ignora acentos e maiúsculas", () => {
    assert.deepEqual(names("ACUCAR"), ["Açúcar Refinado 1 kg"]);
    assert.deepEqual(names("agua 1.5l"), ["Água Mineral sem Gás 1,5 litro"]);
  });

  test("números precisam ser exatos", () => {
    assert.deepEqual(names("coca 3"), []);
  });

  test("busca por categoria", () => {
    assert.ok(names("laticinios").includes("Leite Integral 1 litro"));
  });

  test("termo vazio ou inexistente não retorna nada", () => {
    assert.deepEqual(names(""), []);
    assert.deepEqual(names("picanha"), []);
  });
});
