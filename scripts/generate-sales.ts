/**
 * Gera o histórico FICTÍCIO de vendas mensais em src/data/sales.json.
 *
 * Uso:  npm run data:generate
 *
 * O resultado é sempre o mesmo (gerador pseudoaleatório com semente fixa),
 * então os testes e as respostas do assistente são previsíveis.
 *
 * Como os números são formados, para cada produto e mês:
 *   quantidade = volume base × sazonalidade da categoria × crescimento do ano × variação aleatória (±6%)
 *   faturamento = quantidade × preço praticado no ano
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCTS } from "../src/data/products";
import { addMonths, compareMonths, monthKey, type MonthRef } from "../src/lib/periods";
import type { ProductCategory, SalesRecord } from "../src/types/store";

const FIRST_MONTH: MonthRef = { year: 2025, month: 1 };
/** Último mês da base. É o "mês atual" das consultas ("neste mês"). */
const LAST_MONTH: MonthRef = { year: 2026, month: 11 };
const SEED = 20261112;
const OUTPUT = resolve(__dirname, "../src/data/sales.json");

/** Volume médio mensal de cada produto (unidades ou kg). */
const BASE_VOLUME: Record<string, number> = {
  "1001": 820, "1002": 1400, "1003": 620, "1004": 900, "1005": 160, "1006": 2200,
  "2001": 480, "2002": 720, "2003": 650, "2004": 540, "2005": 600, "2006": 820, "2007": 380, "2008": 900, "2009": 1100,
  "3001": 2600, "3002": 700, "3003": 420, "3004": 210, "3005": 330,
  "4001": 310, "4002": 520, "4003": 760, "4004": 140,
  "5001": 980, "5002": 260, "5003": 340, "5004": 230,
  "6001": 820, "6002": 560, "6003": 640,
  "7001": 1300, "7002": 450,
};

/** Multiplicador de janeiro a dezembro por categoria (verão e festas vendem mais bebidas). */
const SEASONALITY: Record<ProductCategory, number[]> = {
  Bebidas: [1.2, 1.15, 1.05, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95, 1.0, 1.05, 1.3],
  Mercearia: [1.0, 0.95, 1.0, 1.0, 1.0, 0.98, 1.0, 1.0, 0.98, 1.0, 1.02, 1.12],
  Laticínios: [0.98, 0.95, 1.0, 1.0, 1.02, 1.05, 1.05, 1.02, 1.0, 1.0, 1.0, 1.08],
  Higiene: [1.0, 0.97, 1.0, 1.0, 1.0, 0.98, 1.0, 1.0, 1.0, 1.0, 1.02, 1.1],
  Limpeza: [1.05, 0.97, 1.0, 1.0, 0.98, 0.97, 0.98, 1.0, 1.0, 1.0, 1.02, 1.12],
  Hortifrúti: [1.05, 1.0, 1.0, 0.98, 0.97, 0.95, 0.95, 0.98, 1.0, 1.02, 1.03, 1.1],
  Padaria: [0.97, 0.95, 1.0, 1.0, 1.02, 1.05, 1.05, 1.02, 1.0, 1.0, 1.0, 1.1],
};

/** 2025 vendeu um pouco menos que 2026. */
const YEAR_GROWTH: Record<number, number> = { 2025: 0.96, 2026: 1 };
/** Em 2025 os preços eram 6% menores que os atuais. */
const YEAR_PRICE_FACTOR: Record<number, number> = { 2025: 1 / 1.06, 2026: 1 };

/** Valores fixos para reproduzir o exemplo do projeto (Coca-Cola 2 litros: 850 neste mês, 790 no anterior). */
const FIXED_QUANTITIES: Record<string, Record<string, number>> = {
  "1001": { "2026-11": 850, "2026-10": 790 },
};

/** Gerador pseudoaleatório "mulberry32": mesma semente → mesma sequência. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const roundMoney = (value: number) => Math.round(value * 100) / 100;

function generate(): SalesRecord[] {
  const random = createRandom(SEED);
  const records: SalesRecord[] = [];

  for (const product of PRODUCTS) {
    if (!(product.code in BASE_VOLUME)) throw new Error(`Defina BASE_VOLUME para o produto ${product.code}.`);
  }

  for (let current = FIRST_MONTH; compareMonths(current, LAST_MONTH) <= 0; current = addMonths(current, 1)) {
    const period = monthKey(current);
    for (const product of PRODUCTS) {
      const noise = 1 + (random() * 2 - 1) * 0.06;
      const estimated = BASE_VOLUME[product.code] * SEASONALITY[product.category][current.month - 1] * YEAR_GROWTH[current.year] * noise;
      const quantity = FIXED_QUANTITIES[product.code]?.[period] ?? Math.round(estimated);
      const price = roundMoney(product.price * YEAR_PRICE_FACTOR[current.year]);
      records.push({ productCode: product.code, period, quantity, revenue: roundMoney(quantity * price) });
    }
  }
  return records;
}

/** Escreve o JSON com um registro por linha, para facilitar a leitura. */
function write(records: SalesRecord[]) {
  const lines = records.map((record) => `    ${JSON.stringify(record)}`);
  const content = [
    "{",
    `  "description": "Histórico FICTÍCIO de vendas mensais. Gerado por scripts/generate-sales.ts — não edite à mão.",`,
    `  "firstPeriod": "${monthKey(FIRST_MONTH)}",`,
    `  "lastPeriod": "${monthKey(LAST_MONTH)}",`,
    `  "records": [`,
    lines.join(",\n"),
    "  ]",
    "}",
    "",
  ].join("\n");
  writeFileSync(OUTPUT, content, "utf8");
}

const records = generate();
write(records);
console.log(`✔ ${records.length} registros gerados (${PRODUCTS.length} produtos × ${records.length / PRODUCTS.length} meses) em src/data/sales.json`);
