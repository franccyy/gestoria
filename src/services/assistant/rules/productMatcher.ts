/**
 * Descobre quais produtos a pergunta cita.
 *
 * Cada produto tem palavras "identificadoras" (coca, cola, arroz, banana...)
 * e "qualificadoras" (2, litros, lata, integral...). Um produto só é
 * candidato se a pergunta citar ao menos uma palavra identificadora.
 *
 * Exemplos:
 *   "coca 2 litros"       → Coca-Cola 2 litros
 *   "coca"                → Coca-Cola 2 litros e Coca-Cola Lata (ambíguo: os dois)
 *   "tomate"              → Tomate (e não Molho de Tomate)
 *   "coca 2l e guaraná"   → Coca-Cola 2 litros e Guaraná (dois produtos citados)
 */
import { tokenize } from "@/lib/text";
import type { Product } from "@/types/store";

/** Palavras que só qualificam (tamanho, embalagem, tipo) e não identificam o produto sozinhas. */
const QUALIFIER_WORDS = new Set([
  "litro", "litros", "ml", "kg", "g", "lata", "integral", "tipo", "sem", "gas", "folha", "dupla", "rolos",
  "liquido", "natural", "cremoso", "fatiado", "refinado", "branco", "torrado", "moido", "recheado", "barra", "sal", "po",
]);

export interface ProductMatch {
  products: Product[];
  /** Palavras da pergunta que não são de produto nem conhecidas (possível produto inexistente). */
  unmatchedTokens: string[];
}

function sameWord(questionToken: string, productToken: string): boolean {
  if (questionToken === productToken) return true;
  const alphabetic = /^[a-z]+$/;
  if (!alphabetic.test(questionToken) || !alphabetic.test(productToken)) return false;
  const shorter = questionToken.length < productToken.length ? questionToken : productToken;
  // Plural e variações: "cervejas" ↔ "cerveja", "bananas" ↔ "banana".
  return shorter.length >= 4 && (questionToken.startsWith(productToken) || productToken.startsWith(questionToken));
}

interface Candidate {
  product: Product;
  identifiers: string[];
  score: number;
}

export function matchProducts(question: string, products: readonly Product[], knownWord: (token: string) => boolean): ProductMatch {
  const questionTokens = tokenize(question);
  const usedTokens = new Set<string>();
  const candidates: Candidate[] = [];

  for (const product of products) {
    const productTokens = tokenize(product.name);
    const identifierTokens = productTokens.filter((t) => !QUALIFIER_WORDS.has(t) && !/^\d/.test(t));
    const matchedIdentifiers = identifierTokens.filter((p) => questionTokens.some((q) => sameWord(q, p)));
    if (matchedIdentifiers.length === 0) continue;

    const matchedQualifiers = productTokens.filter((p) => !identifierTokens.includes(p) && questionTokens.some((q) => sameWord(q, p)));
    const allIdentifiers = matchedIdentifiers.length === identifierTokens.length;
    candidates.push({
      product,
      identifiers: matchedIdentifiers,
      score: matchedIdentifiers.length * 10 + (allIdentifiers ? 5 : 0) + matchedQualifiers.length * 3,
    });
    for (const q of questionTokens) {
      if (productTokens.some((p) => sameWord(q, p))) usedTokens.add(q);
    }
  }

  // Agrupa candidatos que disputam as mesmas palavras (ex.: as duas Coca-Colas).
  // Em cada grupo ficam só os de maior pontuação; grupos diferentes = produtos diferentes citados.
  const groups: Candidate[][] = [];
  for (const candidate of candidates) {
    const group = groups.find((g) => g.some((other) => other.identifiers.some((t) => candidate.identifiers.includes(t))));
    if (group) group.push(candidate);
    else groups.push([candidate]);
  }
  const selected = groups.flatMap((group) => {
    const best = Math.max(...group.map((c) => c.score));
    return group.filter((c) => c.score === best).map((c) => c.product);
  });

  const unmatchedTokens = questionTokens.filter(
    (token) => !usedTokens.has(token) && /^[a-z]{4,}$/.test(token) && !knownWord(token),
  );

  return { products: selected, unmatchedTokens };
}
