/**
 * Respostas sobre VÁRIAS categorias de uma vez ("faturamento por categoria",
 * "representatividade de cada categoria", "compare bebidas e limpeza").
 * Uma única categoria usa as respostas da loja em storeAnswers.ts, com o filtro aplicado.
 */
import { formatCurrency, formatPercent } from "@/lib/format";
import { periodLabel, type Period } from "@/lib/periods";
import { compareStoreSales, getCategoryShare } from "@/services/store/storeQueries";
import type { ProductCategory } from "@/types/store";
import type { AssistantReply } from "../../types";
import { changeTone, inPeriod, ok, signedChange, unwrapAll } from "./shared";
import { joinNames, type CategoryScope } from "./storeAnswers";

function contextFor(intent: "sales" | "representativeness" | "comparison", scope: CategoryScope, period: Period) {
  return { intent, scope: "store" as const, productCodes: [], categories: scope.categories, perCategory: scope.perCategory, period };
}

function subject(scope: CategoryScope, categories: ProductCategory[]): string {
  return scope.perCategory ? "por categoria" : `das categorias ${joinNames(categories)}`;
}

/** Faturamento de cada categoria, do maior para o menor, com a participação na loja. */
export function answerSalesByCategory(categories: ProductCategory[], period: Period, scope: CategoryScope): AssistantReply {
  const result = unwrapAll(categories.map((category) => getCategoryShare(category, period)));
  if ("reply" in result) return result.reply;
  const rows = [...result.data].sort((a, b) => b.categoryRevenue - a.categoryRevenue);
  const total = rows.reduce((sum, row) => sum + row.categoryRevenue, 0);

  const [top] = rows;
  const lead = `A categoria de maior faturamento ${inPeriod(period)} foi ${top.category}, com ${formatCurrency(top.categoryRevenue)}.`;
  return ok(`${lead} Faturamento ${subject(scope, categories)}:`, contextFor("sales", scope, period), {
    list: rows.map((row) => ({
      label: row.category,
      value: formatCurrency(row.categoryRevenue),
      note: `${formatPercent(row.share)} do faturamento da loja`,
    })),
    metrics: scope.perCategory
      ? [{ label: "Faturamento da loja", value: formatCurrency(rows[0].storeRevenue) }]
      : [
          { label: "Total das categorias", value: formatCurrency(Math.round(total * 100) / 100) },
          { label: "Faturamento da loja", value: formatCurrency(rows[0].storeRevenue) },
        ],
  });
}

/** Participação de uma ou mais categorias no faturamento da loja. */
export function answerCategoryShare(categories: ProductCategory[], period: Period, scope: CategoryScope): AssistantReply {
  const result = unwrapAll(categories.map((category) => getCategoryShare(category, period)));
  if ("reply" in result) return result.reply;
  const context = contextFor("representativeness", scope, period);
  const footnote = "Cálculo: faturamento da categoria ÷ faturamento da loja × 100.";

  if (result.data.length === 1) {
    const [row] = result.data;
    return ok(`A categoria ${row.category} representou ${formatPercent(row.share)} do faturamento da loja ${inPeriod(period)}.`, context, {
      metrics: [
        { label: "Representatividade", value: formatPercent(row.share) },
        { label: "Faturamento da categoria", value: formatCurrency(row.categoryRevenue) },
        { label: "Faturamento da loja", value: formatCurrency(row.storeRevenue) },
      ],
      footnote,
    });
  }

  const rows = [...result.data].sort((a, b) => b.share - a.share);
  return ok(`Representatividade ${subject(scope, categories)} no faturamento da loja ${inPeriod(period)}:`, context, {
    list: rows.map((row) => ({ label: row.category, value: formatPercent(row.share), note: formatCurrency(row.categoryRevenue) })),
    footnote,
  });
}

/** Compara o faturamento de várias categorias entre dois períodos. */
export function answerCategoriesComparison(
  categories: ProductCategory[],
  current: Period,
  previous: Period,
  scope: CategoryScope,
): AssistantReply {
  const result = unwrapAll(categories.map((category) => compareStoreSales(current, previous, category)));
  if ("reply" in result) return result.reply;
  return ok(
    `Faturamento ${subject(scope, categories)}: ${periodLabel(current)} × ${periodLabel(previous)}:`,
    contextFor("comparison", scope, current),
    {
      list: result.data.map((c, index) => ({
        label: categories[index],
        value: `${formatCurrency(c.current.revenue)} × ${formatCurrency(c.previous.revenue)}`,
        note: signedChange(c.revenueChange),
        tone: changeTone(c.revenueChange),
      })),
    },
  );
}
