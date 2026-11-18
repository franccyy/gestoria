/**
 * Encontra categorias citadas na pergunta (já normalizada) e pedidos
 * de resultado separado por categoria ("de cada categoria", "por categoria").
 */
import type { ProductCategory } from "@/types/store";

/** Formas de escrever cada categoria (sem acentos, singular e plural). */
const CATEGORY_PATTERNS: Array<[ProductCategory, RegExp]> = [
  ["Bebidas", /\bbebidas?\b/],
  ["Mercearia", /\bmercearias?\b/],
  ["Laticínios", /\blaticinios?\b/],
  ["Higiene", /\bhigiene\b/],
  ["Limpeza", /\blimpeza\b/],
  ["Hortifrúti", /\bhortifrutis?\b|\bhortifrutigranjeiros?\b|\bfrutas e verduras\b|\bhortalicas\b/],
  ["Padaria", /\bpadaria\b/],
];

/** "de cada categoria", "por categoria", "todas as categorias", "categorias" (plural), "qual categoria…". */
const PER_CATEGORY =
  /\b(cada|por|todas as|em cada) (categoria|setor|secao|departamento)\b|\bcategorias\b|\bsetores\b|\bsecoes\b|\bdepartamentos\b|\bqual (a )?(categoria|setor|secao|departamento)\b/;

export interface CategoryMatch {
  categories: ProductCategory[];
  perCategory: boolean;
}

export function detectCategories(normalizedQuestion: string): CategoryMatch {
  const categories = CATEGORY_PATTERNS.filter(([, pattern]) => pattern.test(normalizedQuestion)).map(([category]) => category);
  // "categorias de limpeza e higiene" cita categorias específicas: não é "cada categoria".
  const perCategory = PER_CATEGORY.test(normalizedQuestion) && categories.length === 0;
  return { categories, perCategory };
}

/**
 * Filtros que a base fictícia não tem. Se a pergunta pedir um deles,
 * o assistente avisa em vez de responder sem o filtro.
 */
const UNSUPPORTED_FILTERS: Array<[string, RegExp]> = [
  ["marca", /\b(por|da|de|cada|qual) marcas?\b|\bmarcas\b/],
  ["fornecedor", /\bfornecedor(es)?\b/],
  ["fabricante", /\bfabricantes?\b/],
  ["vendedor ou operador de caixa", /\bvendedor(es|a|as)?\b|\boperador(es|a)? de caixa\b/],
  ["cliente", /\bclientes?\b/],
  ["filial ou outra loja", /\bfilia(l|is)\b|\boutras? lojas?\b/],
  ["horário", /\bhorarios?\b|\bpor hora\b/],
];

export function detectUnsupportedFilter(normalizedQuestion: string): string | undefined {
  return UNSUPPORTED_FILTERS.find(([, pattern]) => pattern.test(normalizedQuestion))?.[0];
}
