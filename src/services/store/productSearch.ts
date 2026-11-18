/**
 * Busca de produtos por nome, tolerante a acentos, maiúsculas e abreviações.
 * Usada pelo campo de busca dos Indicadores e pelo Assistente.
 *
 * Regra: o produto aparece se TODAS as palavras digitadas combinarem com
 * alguma palavra do nome ou da categoria.
 * - Palavras com letras combinam pelo início ("coc" → "Coca-Cola").
 * - Números precisam ser iguais ("2" combina com "2 litros", não com "250").
 */
import { tokenize } from "@/lib/text";
import type { Product } from "@/types/store";
import { listProducts } from "./storeQueries";

function tokenMatches(queryToken: string, productToken: string): boolean {
  return /^\d/.test(queryToken) ? productToken === queryToken : productToken.startsWith(queryToken);
}

export function searchProducts(query: string, limit = 8): Product[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results: Array<{ product: Product; score: number }> = [];
  for (const product of listProducts()) {
    const productTokens = tokenize(`${product.name} ${product.category}`);
    const matchesAll = queryTokens.every((q) => productTokens.some((p) => tokenMatches(q, p)));
    if (!matchesAll) continue;
    // Mais pontos para palavras idênticas e para nomes mais curtos (mais específicos).
    const exact = queryTokens.filter((q) => productTokens.includes(q)).length;
    results.push({ product, score: exact * 10 - productTokens.length });
  }

  return results
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "pt-BR"))
    .slice(0, limit)
    .map((item) => item.product);
}
