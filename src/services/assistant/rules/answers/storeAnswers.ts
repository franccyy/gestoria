/** Respostas sobre a loja toda: vendas, comparações, rankings, estoque baixo e ajuda. */
import { formatCurrency, formatPercent, formatQuantity } from "@/lib/format";
import { periodLabel, previousPeriod, type Period } from "@/lib/periods";
import { canAccess } from "@/lib/profiles";
import {
  compareStoreSales,
  getCategoryShare,
  getLowStockProducts,
  getStoreSales,
  getTopProducts,
  listCategories,
  type RankedProduct,
  type StockInfo,
} from "@/services/store/storeQueries";
import type { ReplyGroup, ReplyListItem } from "@/types/assistant";
import type { Profile } from "@/types/profile";
import type { ProductCategory } from "@/types/store";
import type { AssistantReply } from "../../types";
import type { RankingCriterion } from "../intentDetector";
import { changeTone, describeChange, inPeriod, MIXED_UNITS_FOOTNOTE, ok, signedChange, unavailable } from "./shared";

/** "da loja" ou "da categoria Limpeza". */
function whose(category?: ProductCategory): string {
  return category ? `da categoria ${category}` : "da loja";
}

/**
 * Faturamento da loja (ou de uma categoria) no período, com a variação em relação
 * ao período anterior quando houver dados. Para categoria, mostra também a participação na loja.
 */
export function answerStoreSales(period: Period, category?: ProductCategory): AssistantReply {
  const sales = getStoreSales(period, category);
  if (!sales.ok) return unavailable(sales.message);
  const { revenue, unitsSold, kilogramsSold } = sales.data;
  const context = { intent: "sales" as const, scope: "store" as const, productCodes: [], categories: category ? [category] : [], period };
  const previous = previousPeriod(period);
  const comparison = compareStoreSales(period, previous, category);
  const share = category ? getCategoryShare(category, period) : undefined;

  let text = `O faturamento ${whose(category)} ${inPeriod(period)} foi de ${formatCurrency(revenue)}`;
  text += comparison.ok
    ? `, ${describeChange(comparison.data.revenueChange)} em relação a ${periodLabel(previous)} (${formatCurrency(comparison.data.previous.revenue)}).`
    : ".";

  return ok(text, context, {
    metrics: [
      { label: "Faturamento", value: formatCurrency(revenue) },
      ...(comparison.ok
        ? [{ label: `Variação × ${periodLabel(previous)}`, value: signedChange(comparison.data.revenueChange), tone: changeTone(comparison.data.revenueChange) }]
        : []),
      ...(share?.ok ? [{ label: "Participação na loja", value: formatPercent(share.data.share) }] : []),
      ...(unitsSold > 0 ? [{ label: "Itens vendidos (un.)", value: formatQuantity(unitsSold, "un") }] : []),
      ...(kilogramsSold > 0 ? [{ label: "Itens vendidos (kg)", value: formatQuantity(kilogramsSold, "kg") }] : []),
    ],
  });
}

export function answerStoreComparison(current: Period, previous: Period, category?: ProductCategory): AssistantReply {
  const result = compareStoreSales(current, previous, category);
  if (!result.ok) return unavailable(result.message);
  const c = result.data;
  const context = { intent: "comparison" as const, scope: "store" as const, productCodes: [], categories: category ? [category] : [], period: current };
  return ok(
    `O faturamento ${whose(category)} foi de ${formatCurrency(c.current.revenue)} ${inPeriod(current)}, ` +
      `contra ${formatCurrency(c.previous.revenue)} ${inPeriod(previous)}: ${describeChange(c.revenueChange)}.`,
    context,
    {
      metrics: [
        { label: `Faturamento · ${periodLabel(current)}`, value: formatCurrency(c.current.revenue) },
        { label: `Faturamento · ${periodLabel(previous)}`, value: formatCurrency(c.previous.revenue) },
        { label: "Variação", value: signedChange(c.revenueChange), tone: changeTone(c.revenueChange) },
      ],
    },
  );
}

/** Filtro de categorias de uma pergunta: nenhuma (loja toda), algumas, ou "cada categoria". */
export interface CategoryScope {
  categories: ProductCategory[];
  perCategory: boolean;
}

/** Categorias a responder separadamente. Lista vazia = loja toda. */
export function categoriesToAnswer(scope: CategoryScope): ProductCategory[] {
  return scope.perCategory ? listCategories() : scope.categories;
}

export interface RankingOptions {
  by: RankingCriterion;
  direction: "desc" | "asc";
  limit: number;
}

/** Uma linha do ranking, sempre com a unidade visível no valor. */
function rankingItem(item: RankedProduct, by: RankingCriterion, commercial: boolean): ReplyListItem {
  const notes = [item.product.unit === "kg" ? "vendido por quilo" : null, by === "quantity" && commercial ? formatCurrency(item.revenue) : null];
  if (by === "revenue") notes.push(formatQuantity(item.quantity, item.product.unit));
  return {
    label: `${item.position}. ${item.product.name}`,
    value: by === "revenue" ? formatCurrency(item.revenue) : formatQuantity(item.quantity, item.product.unit),
    note: notes.filter(Boolean).join(" · ") || undefined,
  };
}

function rankingTitle(count: number, { by, direction }: RankingOptions, where: string, period: Period): string {
  const most = direction === "desc";
  return by === "revenue"
    ? `Os ${count} produtos de ${most ? "maior" : "menor"} faturamento${where} ${inPeriod(period)}:`
    : `Os ${count} produtos ${most ? "mais" : "menos"} vendidos${where} ${inPeriod(period)}, em quantidade:`;
}

/**
 * Ranking de produtos, da loja toda, de uma categoria ou de cada categoria.
 * Por quantidade, produtos vendidos por unidade e por quilo ficam juntos,
 * com a unidade sempre visível em cada item.
 */
export function answerRanking(period: Period, options: RankingOptions, scope: CategoryScope, profile: Profile): AssistantReply {
  const { by, direction, limit } = options;
  const commercial = canAccess(profile, "commercial");
  const categories = categoriesToAnswer(scope);
  const context = {
    intent: "ranking" as const,
    scope: "store" as const,
    productCodes: [],
    categories: scope.categories,
    perCategory: scope.perCategory,
    period,
    ranking: options,
  };
  const footnote = by === "quantity" ? MIXED_UNITS_FOOTNOTE : undefined;

  // Várias categorias: uma lista para cada.
  if (categories.length > 1) {
    const groups: ReplyGroup[] = [];
    for (const category of categories) {
      const result = getTopProducts(period, by, limit, direction, category);
      if (!result.ok) return unavailable(result.message);
      groups.push({ title: category, list: result.data.map((item) => rankingItem(item, by, commercial)) });
    }
    const what = by === "revenue" ? `de ${direction === "desc" ? "maior" : "menor"} faturamento` : `${direction === "desc" ? "mais" : "menos"} vendidos`;
    const each = scope.perCategory ? "de cada categoria" : `das categorias ${joinNames(categories)}`;
    // Avisa quando uma categoria tem menos produtos do que o pedido (ex.: Padaria tem 2).
    const short = groups.filter((group) => group.list.length < limit);
    const shortNote = short.map((group) => `${group.title} tem só ${group.list.length} ${group.list.length === 1 ? "produto" : "produtos"} na base.`).join(" ");
    return ok(`${limit === 1 ? "O produto" : `Os ${limit} produtos`} ${what} ${each} ${inPeriod(period)}:`, context, {
      groups,
      footnote: [shortNote, footnote].filter(Boolean).join(" ") || undefined,
    });
  }

  const category = categories[0];
  const where = category ? ` da categoria ${category}` : "";
  const result = getTopProducts(period, by, limit, direction, category);
  if (!result.ok) return unavailable(result.message);
  const ranking = result.data;

  if (ranking.length === 1) {
    const [first] = ranking;
    const value = by === "revenue" ? formatCurrency(first.revenue) : formatQuantity(first.quantity, first.product.unit);
    const most = direction === "desc";
    const label = by === "revenue" ? `${most ? "maior" : "menor"} faturamento` : most ? "mais vendido" : "menos vendido";
    return ok(`O produto de ${label}${where} ${inPeriod(period)} foi ${first.product.name}, com ${value}.`, context, {
      metrics: [
        { label: "Quantidade vendida", value: formatQuantity(first.quantity, first.product.unit) },
        ...(commercial ? [{ label: "Faturamento", value: formatCurrency(first.revenue) }] : []),
      ],
      footnote: first.product.unit === "kg" ? "Produto vendido por quilo (kg)." : undefined,
    });
  }

  return ok(rankingTitle(ranking.length, options, where, period), context, {
    list: ranking.map((item) => rankingItem(item, by, commercial)),
    footnote,
  });
}

function lowStockItem(item: StockInfo): ReplyListItem {
  return {
    label: item.product.name,
    value: formatQuantity(item.stock, item.product.unit),
    note: `${item.isOutOfStock ? "sem estoque · " : ""}mínimo ${formatQuantity(item.minStock, item.product.unit)}`,
    tone: item.isOutOfStock ? "danger" : "warning",
  };
}

/** Produtos com estoque baixo: na loja toda, numa categoria, ou separados por categoria. */
export function answerLowStock(scope: CategoryScope = { categories: [], perCategory: false }): AssistantReply {
  const categories = categoriesToAnswer(scope);
  const items = categories.length === 0 ? getLowStockProducts() : categories.flatMap((category) => getLowStockProducts(category));
  const context = { intent: "lowStock" as const, scope: "store" as const, productCodes: [], categories: scope.categories, perCategory: scope.perCategory };
  const where = scope.perCategory ? "" : categories.length > 0 ? ` ${categories.length === 1 ? "da categoria" : "das categorias"} ${joinNames(categories)}` : "";

  if (items.length === 0) return ok(`Nenhum produto está com estoque abaixo do mínimo${where}.`, context);

  const outOfStock = items.filter((item) => item.isOutOfStock).length;
  let text = `${items.length} ${items.length === 1 ? "produto" : "produtos"}${where} ${items.length === 1 ? "está" : "estão"} com estoque baixo (saldo igual ou menor que o mínimo)`;
  text += outOfStock > 0 ? `, sendo ${outOfStock} sem estoque:` : ":";

  if (categories.length > 1) {
    const groups = categories
      .map((category) => ({ title: category, list: items.filter((item) => item.product.category === category).map(lowStockItem) }))
      .filter((group) => group.list.length > 0);
    const empty = categories.filter((category) => !groups.some((group) => group.title === category));
    return ok(text, context, {
      groups,
      footnote: empty.length > 0 ? `Sem estoque baixo em: ${joinNames(empty)}.` : undefined,
    });
  }
  return ok(text, context, { list: items.map(lowStockItem) });
}

export function answerHelp(profile: Profile): AssistantReply {
  const commercial = canAccess(profile, "commercial");
  const topics = [
    "Saldo em estoque de um produto",
    "Preço atual de um produto",
    "Quantidade vendida por mês ou por ano",
    "Produtos mais e menos vendidos",
    "Produtos com estoque baixo",
    ...(commercial
      ? ["Faturamento da loja e dos produtos", "Representatividade no faturamento", "Comparação entre períodos"]
      : ["Comparação de quantidades entre períodos"]),
  ];
  return {
    text: `Olá! No perfil ${profile.label}, posso responder sobre:`,
    status: "ok",
    details: {
      list: topics.map((topic) => ({ label: topic, value: "" })),
      footnote: `Os dados são fictícios, por mês, de janeiro de 2025 a novembro de 2026. Exemplo: "Quanto vendemos de Coca-Cola 2 litros?"`,
    },
  };
}

export function answerNotUnderstood(): AssistantReply {
  return unavailable(
    "Não entendi a pergunta. Experimente perguntar sobre saldo, vendas, preço, faturamento ou estoque baixo — por exemplo: \"Qual o saldo do arroz?\"",
  );
}

/** Explica a restrição de perfil sem revelar os números. */
export function answerNotAllowed(profile: Profile, what: string): AssistantReply {
  return unavailable(
    `No perfil ${profile.label}, ${what} não está disponível. Indicadores comerciais são exclusivos de Gerente e Administrador. ` +
      `Posso informar saldos, preços e quantidades vendidas dos produtos.`,
  );
}

export function answerOnlyMonthly(): AssistantReply {
  return unavailable(
    `A base fictícia tem apenas dados mensais, então não consigo responder por dia ou por semana. ` +
      `Pergunte por um mês (ex.: "neste mês", "em outubro") ou pelo ano.`,
  );
}

/** Formata uma lista curta de nomes: "a, b e c". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

