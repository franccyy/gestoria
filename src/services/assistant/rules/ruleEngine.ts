/**
 * MOTOR DE REGRAS do assistente.
 *
 * Passo a passo para cada pergunta:
 *   1. Normaliza o texto (minúsculas, sem acentos).
 *   2. Detecta intenção, períodos e produtos citados.
 *   3. Completa o que faltar com o contexto da resposta anterior
 *      ("E no mês passado?" → mesmo produto e mesma intenção).
 *   4. Verifica a permissão do perfil.
 *   5. Consulta a base (src/services/store) e monta a resposta.
 *
 * Nenhum número é escrito aqui: todos vêm das consultas.
 */
import { compareMonths, periodBounds, previousPeriod, sameMonthLastYear, type Period } from "@/lib/periods";
import { canAccess } from "@/lib/profiles";
import { normalizeText } from "@/lib/text";
import {
  currentMonthPeriod,
  currentYearPeriod,
  getDatasetInfo,
  getProduct,
  listCategories,
  listProducts,
  listProductsByCategory,
} from "@/services/store/storeQueries";
import type { AssistantIntent } from "@/types/assistant";
import type { Profile } from "@/types/profile";
import type { Product } from "@/types/store";
import { findLastContext } from "../context";
import type { AssistantEngine, AssistantReply, AssistantRequest } from "../types";
import {
  answerOverview,
  answerPrice,
  answerProductComparison,
  answerProductRevenue,
  answerProductSales,
  answerRepresentativeness,
  answerStock,
} from "./answers/productAnswers";
import { answerCategoriesComparison, answerCategoryShare, answerSalesByCategory } from "./answers/categoryAnswers";
import { unavailable } from "./answers/shared";
import {
  answerHelp,
  answerLowStock,
  answerNotAllowed,
  answerNotUnderstood,
  answerOnlyMonthly,
  answerRanking,
  answerStoreComparison,
  answerStoreSales,
  categoriesToAnswer,
  joinNames,
  type CategoryScope,
} from "./answers/storeAnswers";
import { detectCategories, detectUnsupportedFilter } from "./categoryParser";
import { detectIntent, isKnownWord } from "./intentDetector";
import { parsePeriods, type DetectedPeriod } from "./periodParser";
import { matchProducts } from "./productMatcher";

/** Intenções que só fazem sentido com um produto. */
const NEEDS_PRODUCT = new Set<AssistantIntent>(["stock", "price", "representativeness", "overview"]);
/** Intenções que funcionam para um produto ou para a loja toda. */
const PRODUCT_OR_STORE = new Set<AssistantIntent>(["sales", "revenue", "comparison"]);
/** Intenções sobre a loja toda. */
const STORE_ONLY = new Set<AssistantIntent>(["ranking", "lowStock", "help"]);

const MAX_PRODUCTS_PER_ANSWER = 5;

function samePeriod(a: Period, b: Period): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isLater(a: Period, b: Period): boolean {
  return compareMonths(periodBounds(a).last, periodBounds(b).last) > 0;
}

/** Decide os dois períodos de uma comparação. */
function resolveComparison(detected: DetectedPeriod[], base: Period): { current: Period; previous: Period } | { error: string } {
  if (detected.length >= 2) {
    let [a, b] = [detected[0].period, detected[1].period];
    if (a.kind !== b.kind) return { error: "Para comparar, use dois períodos do mesmo tipo: dois meses ou dois anos." };
    // "este ano com o ano passado": compara o mesmo intervalo de meses (jan. a nov. × jan. a nov.).
    if (a.kind === "year" && b.kind === "year") {
      if (detected[1].relativeLastYear) b = { kind: "year", year: b.year, toMonth: a.toMonth };
      else if (detected[0].relativeLastYear) a = { kind: "year", year: a.year, toMonth: b.toMonth };
    }
    return isLater(b, a) ? { current: b, previous: a } : { current: a, previous: b };
  }
  if (detected.length === 1) {
    const { period, relativeLastYear } = detected[0];
    if (relativeLastYear) {
      // "comparado ao ano passado": mesmo mês do ano anterior, ou mesmo intervalo do ano anterior.
      return base.kind === "month"
        ? { current: base, previous: sameMonthLastYear(base) }
        : { current: base, previous: { kind: "year", year: base.year - 1, toMonth: base.toMonth } };
    }
    if (samePeriod(period, base)) return { current: base, previous: previousPeriod(base) };
    if (period.kind === "year" && base.kind === "month") {
      const ytd = currentYearPeriod();
      return ytd.kind === "year" ? { current: ytd, previous: { kind: "year", year: period.year, toMonth: ytd.toMonth } } : { error: "" };
    }
    if (period.kind === "month" && base.kind === "year") return { current: currentMonthPeriod(), previous: period };
    return isLater(period, base) ? { current: period, previous: base } : { current: base, previous: period };
  }
  return { current: base, previous: previousPeriod(base) };
}

/** Palavras desconhecidas logo após "de/da/do" ou "categoria" (ex.: "vendemos de picanha", "categoria frios"). */
function wordsUsedAsFilter(text: string, candidates: string[]): string[] {
  return candidates.filter((word) => new RegExp(`\\b(de|da|do|dos|das|categoria|setor|secao|departamento) ${word}\\b`).test(text));
}

function categoryList(): string {
  return joinNames(listCategories());
}

function notFound(words: string[]): AssistantReply {
  const quoted = joinNames(words.map((w) => `"${w}"`));
  return unavailable(
    `Não encontrei ${quoted} entre os produtos e as categorias da base fictícia. ` +
      `A base tem ${listProducts().length} produtos, nas categorias ${categoryList()}.`,
  );
}

function unsupportedFilter(filter: string): AssistantReply {
  return unavailable(
    `A base fictícia não tem informações por ${filter}, então não consigo aplicar esse filtro. ` +
      `Posso separar os resultados por produto, por categoria (${categoryList()}), por mês ou por ano.`,
  );
}

export function answerQuestion(question: string, profile: Profile, history: AssistantRequest["history"]): AssistantReply {
  const text = normalizeText(question);
  if (!text) return answerNotUnderstood();

  const previous = findLastContext(history);
  const detected = detectIntent(text);
  const { periods, asksUnsupportedGranularity, asksAllTime } = parsePeriods(text, getDatasetInfo().referenceMonth);
  const match = matchProducts(question, listProducts(), isKnownWord);
  const categoryMatch = detectCategories(text);
  const mentionsCategory = categoryMatch.categories.length > 0 || categoryMatch.perCategory;
  const isFollowUp =
    detected.isFollowUp ||
    (detected.intent === null && previous !== undefined && (match.products.length > 0 || periods.length > 0 || mentionsCategory));

  if (asksUnsupportedGranularity && periods.length === 0) return answerOnlyMonthly();
  if (asksAllTime && periods.length === 0) {
    return unavailable(
      "Consigo consultar um mês ou um ano por vez, mas não o período inteiro da base (janeiro de 2025 a novembro de 2026) somado. " +
        'Pergunte por "2025", "neste ano" ou por um mês específico.',
    );
  }
  const unsupported = detectUnsupportedFilter(text);
  if (unsupported) return unsupportedFilter(unsupported);

  // ---------- 1. Intenção ----------
  let intent = detected.intent;
  if (intent === null && isFollowUp && previous) {
    intent = previous.intent;
    if (match.products.length > 0 && STORE_ONLY.has(intent)) intent = "sales";
  }
  if (intent === null && match.products.length > 0) intent = "overview";
  if (intent === null && mentionsCategory) intent = "sales";
  if (intent === null) return answerNotUnderstood();
  if (intent === "help") return answerHelp(profile);

  let byRevenue = detected.mentionsRevenue || intent === "revenue" || (isFollowUp && previous?.intent === "revenue");
  if ((intent === "sales" || intent === "revenue") && periods.length >= 2) intent = "comparison";

  // ---------- 2. Categorias ----------
  // Sem categoria citada, uma continuação ("E em outubro?") mantém o filtro da pergunta anterior.
  let scope: CategoryScope = { categories: categoryMatch.categories, perCategory: categoryMatch.perCategory };
  if (!mentionsCategory && match.products.length === 0 && isFollowUp && previous?.scope === "store") {
    scope = { categories: previous.categories ?? [], perCategory: previous.perCategory ?? false };
  }
  const byCategory = scope.categories.length > 0 || scope.perCategory;

  // Palavra desconhecida usada como filtro ("categoria frios", "vendemos de picanha"): avisa em vez de ignorar.
  if (match.products.length === 0 && !byCategory) {
    const needsProduct = NEEDS_PRODUCT.has(intent);
    const unknownWords = needsProduct ? match.unmatchedTokens : wordsUsedAsFilter(text, match.unmatchedTokens);
    if (unknownWords.length > 0) return notFound(unknownWords);
  }

  if (intent === "lowStock") return answerLowStock(scope);

  // ---------- 3. Produtos ----------
  let products: Product[] = match.products;
  let listTitle: string | undefined;
  if (products.length > MAX_PRODUCTS_PER_ANSWER) {
    return unavailable(
      `Encontrei ${products.length} produtos com esses termos (${joinNames(products.slice(0, 6).map((p) => p.name))}…). Seja mais específico.`,
    );
  }

  if (products.length === 0 && !STORE_ONLY.has(intent)) {
    if (byCategory && (intent === "stock" || intent === "price")) {
      listTitle = `${intent === "stock" ? "Saldo" : "Preço"} dos produtos da categoria ${joinNames(scope.categories)}:`;
      // "saldo da categoria limpeza": todos os produtos da categoria.
      if (scope.perCategory) return unavailable(`Escolha uma categoria para listar saldos ou preços: ${categoryList()}.`);
      products = scope.categories.flatMap((category) => listProductsByCategory(category));
    } else if (!byCategory) {
      const canInherit =
        previous?.scope === "products" &&
        previous.productCodes.length > 0 &&
        // Comparação curta ("compare com setembro") continua no produto; com dois períodos é sobre a loja.
        (NEEDS_PRODUCT.has(intent) || isFollowUp || (intent === "comparison" && periods.length < 2));
      if (canInherit) {
        products = previous.productCodes.flatMap((code) => {
          const found = getProduct(code);
          return found.ok ? [found.data] : [];
        });
      } else if (NEEDS_PRODUCT.has(intent)) {
        return unavailable('Qual produto você quer consultar? Por exemplo: "Qual o saldo da Coca-Cola 2 litros?"');
      }
    }
  }
  const isStore = products.length === 0;
  const categories = categoriesToAnswer(scope);

  // ---------- 4. Permissão ----------
  const ranking =
    intent === "ranking" && isFollowUp && previous?.ranking && detected.intent === null ? previous.ranking : detected.ranking;
  if (intent === "ranking") byRevenue = ranking.by === "revenue";
  if (intent === "comparison" && isStore) byRevenue = true;

  if (!canAccess(profile, "commercial")) {
    const total = byCategory ? "o total de vendas por categoria" : "o total de vendas da loja";
    if (intent === "revenue") return answerNotAllowed(profile, "o faturamento");
    if (intent === "representativeness") return answerNotAllowed(profile, "a representatividade no faturamento");
    if (isStore && (intent === "sales" || intent === "comparison")) return answerNotAllowed(profile, total);
    if (intent === "ranking" && byRevenue) return answerNotAllowed(profile, "o ranking por faturamento");
    if (intent === "comparison" && byRevenue) return answerNotAllowed(profile, "a comparação de faturamento");
  }

  // ---------- 5. Período ----------
  const basePeriod = isFollowUp && previous?.period ? previous.period : currentMonthPeriod();
  const period = periods[0]?.period ?? basePeriod;
  const single = categories.length === 1 ? categories[0] : undefined;

  // ---------- 6. Resposta ----------
  switch (intent) {
    case "stock":
      return answerStock(products, listTitle);
    case "price":
      return answerPrice(products, listTitle);
    case "overview":
      return answerOverview(products, profile);
    case "sales":
    case "revenue":
      if (!isStore) return intent === "sales" ? answerProductSales(products, period, profile) : answerProductRevenue(products, period);
      return categories.length > 1 ? answerSalesByCategory(categories, period, scope) : answerStoreSales(period, single);
    case "representativeness":
      if (!isStore) return answerRepresentativeness(products, period);
      return answerCategoryShare(categories, period, scope);
    case "ranking":
      return answerRanking(period, ranking, scope, profile);
    case "comparison": {
      const resolved = resolveComparison(periods, basePeriod);
      if ("error" in resolved) return unavailable(resolved.error || "Não consegui identificar os períodos da comparação.");
      if (!isStore) return answerProductComparison(products, resolved.current, resolved.previous, profile, byRevenue);
      return categories.length > 1
        ? answerCategoriesComparison(categories, resolved.current, resolved.previous, scope)
        : answerStoreComparison(resolved.current, resolved.previous, single);
    }
    default:
      return answerNotUnderstood();
  }
}

export const ruleEngine: AssistantEngine = {
  async answer({ question, profile, history }) {
    try {
      return answerQuestion(question, profile, history);
    } catch {
      return { text: "Ocorreu um erro ao processar a pergunta. Tente novamente.", status: "error" };
    }
  },
};
