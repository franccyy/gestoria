/**
 * Respostas sobre produtos específicos.
 * Quando a pergunta é ambígua (ex.: "Coca-Cola" = 2 produtos), responde para todos em lista.
 */
import {
  formatCurrency,
  formatPercent,
  formatQuantity,
  formatQuantityLong,
} from "@/lib/format";
import { periodLabel, type Period } from "@/lib/periods";
import { canAccess } from "@/lib/profiles";
import { roundMoney } from "@/services/calculations/sales";
import {
  compareProductSales,
  currentMonthPeriod,
  getProductSales,
  getProductStock,
  getRepresentativeness,
  type StockInfo,
} from "@/services/store/storeQueries";
import type { ReplyListItem, ReplyTone } from "@/types/assistant";
import type { Profile } from "@/types/profile";
import type { Product } from "@/types/store";
import type { AssistantReply } from "../../types";
import {
  changeTone,
  describeChange,
  inPeriod,
  MIXED_UNITS_FOOTNOTE,
  ok,
  signedChange,
  soldPhrase,
  unwrapAll,
} from "./shared";

const codes = (products: Product[]) => products.map((p) => p.code);
const several = (products: Product[]) => `Encontrei ${products.length} produtos para essa pergunta:`;
const sameUnit = (products: Product[]) => products.every((p) => p.unit === products[0].unit);

function stockNote(info: StockInfo): { note?: string; tone?: ReplyTone } {
  if (info.isOutOfStock) return { note: `sem estoque · mínimo ${formatQuantity(info.minStock, info.product.unit)}`, tone: "danger" };
  if (info.isLow) return { note: `abaixo do mínimo de ${formatQuantity(info.minStock, info.product.unit)}`, tone: "warning" };
  return { note: `mínimo ${formatQuantity(info.minStock, info.product.unit)}` };
}

/** `listTitle` substitui "Encontrei N produtos…" quando a lista vem de uma categoria. */
export function answerStock(products: Product[], listTitle?: string): AssistantReply {
  const result = unwrapAll(products.map((p) => getProductStock(p.code)));
  if ("reply" in result) return result.reply;
  const context = { intent: "stock" as const, scope: "products" as const, productCodes: codes(products) };

  if (result.data.length === 1) {
    const [info] = result.data;
    const unit = info.product.unit;
    let text = `O saldo atual de ${info.product.name} é de ${formatQuantityLong(info.stock, unit)}.`;
    if (info.isOutOfStock) text = `${info.product.name} está sem estoque (0 ${unit === "kg" ? "kg" : "unidades"}).`;
    else if (info.isLow) text += ` Atenção: está abaixo do estoque mínimo de ${formatQuantityLong(info.minStock, unit)}.`;
    const tone: ReplyTone = info.isOutOfStock ? "danger" : info.isLow ? "warning" : "neutral";
    return ok(text, context, {
      metrics: [
        { label: "Saldo", value: formatQuantity(info.stock, unit), tone },
        { label: "Estoque mínimo", value: formatQuantity(info.minStock, unit) },
      ],
    });
  }

  return ok(listTitle ?? several(products), context, {
    list: result.data.map((info) => ({ label: info.product.name, value: formatQuantity(info.stock, info.product.unit), ...stockNote(info) })),
  });
}

export function answerPrice(products: Product[], listTitle?: string): AssistantReply {
  const context = { intent: "price" as const, scope: "products" as const, productCodes: codes(products) };
  const priceText = (p: Product) => `${formatCurrency(p.price)}${p.unit === "kg" ? " por kg" : ""}`;
  if (products.length === 1) {
    return ok(`O preço atual de ${products[0].name} é ${priceText(products[0])}.`, context);
  }
  return ok(listTitle ?? several(products), context, {
    list: products.map((p) => ({ label: p.name, value: priceText(p) })),
  });
}

/** Quantidade vendida; perfis comerciais também veem o faturamento. */
export function answerProductSales(products: Product[], period: Period, profile: Profile): AssistantReply {
  const result = unwrapAll(products.map((p) => getProductSales(p.code, period)));
  if ("reply" in result) return result.reply;
  const commercial = canAccess(profile, "commercial");
  const context = { intent: "sales" as const, scope: "products" as const, productCodes: codes(products), period };

  if (result.data.length === 1) {
    const [sales] = result.data;
    const phrase = soldPhrase(sales.quantity, sales.product.unit);
    const text = `${inPeriod(period)[0].toUpperCase()}${inPeriod(period).slice(1)}, ${phrase} de ${sales.product.name}.`;
    return ok(text, context, {
      metrics: [
        { label: "Quantidade vendida", value: formatQuantity(sales.quantity, sales.product.unit) },
        ...(commercial ? [{ label: "Faturamento", value: formatCurrency(sales.revenue) }] : []),
      ],
    });
  }

  return ok(`Vendas ${inPeriod(period)}. ${several(products)}`, context, {
    list: result.data.map((s) => ({
      label: s.product.name,
      value: formatQuantity(s.quantity, s.product.unit),
      note: commercial ? formatCurrency(s.revenue) : undefined,
    })),
    footnote: sameUnit(products) ? undefined : MIXED_UNITS_FOOTNOTE,
  });
}

export function answerProductRevenue(products: Product[], period: Period): AssistantReply {
  const result = unwrapAll(products.map((p) => getProductSales(p.code, period)));
  if ("reply" in result) return result.reply;
  const context = { intent: "revenue" as const, scope: "products" as const, productCodes: codes(products), period };

  if (result.data.length === 1) {
    const [sales] = result.data;
    return ok(
      `O faturamento de ${sales.product.name} ${inPeriod(period)} foi de ${formatCurrency(sales.revenue)}.`,
      context,
      {
        metrics: [
          { label: "Faturamento", value: formatCurrency(sales.revenue) },
          { label: "Quantidade vendida", value: formatQuantity(sales.quantity, sales.product.unit) },
        ],
      },
    );
  }

  const total = roundMoney(result.data.reduce((sum, s) => sum + s.revenue, 0));
  return ok(`Faturamento ${inPeriod(period)}. ${several(products)}`, context, {
    list: result.data.map((s) => ({ label: s.product.name, value: formatCurrency(s.revenue), note: formatQuantity(s.quantity, s.product.unit) })),
    metrics: [{ label: "Total dos produtos", value: formatCurrency(total) }],
  });
}

export function answerRepresentativeness(products: Product[], period: Period): AssistantReply {
  const result = unwrapAll(products.map((p) => getRepresentativeness(p.code, period)));
  if ("reply" in result) return result.reply;
  const context = { intent: "representativeness" as const, scope: "products" as const, productCodes: codes(products), period };
  const storeRevenue = result.data[0].storeRevenue;

  if (result.data.length === 1) {
    const [rep] = result.data;
    return ok(
      `${rep.product.name} representou ${formatPercent(rep.share)} do faturamento da loja ${inPeriod(period)}.`,
      context,
      {
        metrics: [
          { label: "Representatividade", value: formatPercent(rep.share) },
          { label: "Faturamento do produto", value: formatCurrency(rep.productRevenue) },
          { label: "Faturamento da loja", value: formatCurrency(storeRevenue) },
        ],
        footnote: "Cálculo: faturamento do produto ÷ faturamento da loja × 100.",
      },
    );
  }

  const totalShare = result.data.reduce((sum, rep) => sum + rep.share, 0);
  const totalRevenue = roundMoney(result.data.reduce((sum, rep) => sum + rep.productRevenue, 0));
  return ok(`Representatividade no faturamento da loja ${inPeriod(period)}. ${several(products)}`, context, {
    list: result.data.map((rep) => ({ label: rep.product.name, value: formatPercent(rep.share), note: formatCurrency(rep.productRevenue) })),
    metrics: [
      { label: "Juntos", value: formatPercent(totalShare) },
      { label: "Faturamento dos produtos", value: formatCurrency(totalRevenue) },
      { label: "Faturamento da loja", value: formatCurrency(storeRevenue) },
    ],
    footnote: "Cálculo: faturamento do produto ÷ faturamento da loja × 100.",
  });
}

/**
 * Compara vendas do produto entre dois períodos.
 * byRevenue = compara faturamento (só perfis comerciais chegam aqui com true).
 */
export function answerProductComparison(
  products: Product[],
  current: Period,
  previous: Period,
  profile: Profile,
  byRevenue: boolean,
): AssistantReply {
  const result = unwrapAll(products.map((p) => compareProductSales(p.code, current, previous)));
  if ("reply" in result) return result.reply;
  const commercial = canAccess(profile, "commercial");
  const context = { intent: "comparison" as const, scope: "products" as const, productCodes: codes(products), period: current };
  const header = `${periodLabel(current)} × ${periodLabel(previous)}`;

  if (result.data.length === 1) {
    const [c] = result.data;
    const unit = c.current.product.unit;
    let text: string;
    if (byRevenue) {
      text =
        `O faturamento de ${c.current.product.name} foi de ${formatCurrency(c.current.revenue)} ${inPeriod(current)}, ` +
        `contra ${formatCurrency(c.previous.revenue)} ${inPeriod(previous)}: ${describeChange(c.revenueChange)}.`;
    } else {
      const diff = c.current.quantity - c.previous.quantity;
      const diffText = diff === 0 ? "" : ` (${diff > 0 ? "+" : "−"}${formatQuantityLong(Math.abs(diff), unit)})`;
      text =
        `${c.current.product.name}: ${formatQuantityLong(c.current.quantity, unit)} ${inPeriod(current)}, ` +
        `contra ${formatQuantityLong(c.previous.quantity, unit)} ${inPeriod(previous)}: ${describeChange(c.quantityChange)}${diffText}.`;
    }
    return ok(text, context, {
      metrics: [
        { label: `Quantidade · ${periodLabel(current)}`, value: formatQuantity(c.current.quantity, unit) },
        { label: `Quantidade · ${periodLabel(previous)}`, value: formatQuantity(c.previous.quantity, unit) },
        { label: "Variação (quantidade)", value: signedChange(c.quantityChange), tone: changeTone(c.quantityChange) },
        ...(commercial
          ? [{ label: "Variação (faturamento)", value: signedChange(c.revenueChange), tone: changeTone(c.revenueChange) }]
          : []),
      ],
    });
  }

  const list: ReplyListItem[] = result.data.map((c) => {
    const unit = c.current.product.unit;
    return byRevenue
      ? {
          label: c.current.product.name,
          value: `${formatCurrency(c.current.revenue)} × ${formatCurrency(c.previous.revenue)}`,
          note: signedChange(c.revenueChange),
          tone: changeTone(c.revenueChange),
        }
      : {
          label: c.current.product.name,
          value: `${formatQuantity(c.current.quantity, unit)} × ${formatQuantity(c.previous.quantity, unit)}`,
          note: signedChange(c.quantityChange),
          tone: changeTone(c.quantityChange),
        };
  });
  return ok(`Comparação ${header}. ${several(products)}`, context, { list });
}

/** Só o nome do produto: saldo, preço e vendas do mês de referência. */
export function answerOverview(products: Product[], profile: Profile): AssistantReply {
  const period = currentMonthPeriod();
  const commercial = canAccess(profile, "commercial");
  const stock = unwrapAll(products.map((p) => getProductStock(p.code)));
  const sales = unwrapAll(products.map((p) => getProductSales(p.code, period)));
  if ("reply" in stock) return stock.reply;
  if ("reply" in sales) return sales.reply;
  const context = { intent: "overview" as const, scope: "products" as const, productCodes: codes(products), period };

  if (products.length === 1) {
    const [info] = stock.data;
    const [s] = sales.data;
    const unit = info.product.unit;
    return ok(`Resumo de ${info.product.name} (${periodLabel(period)}):`, context, {
      metrics: [
        { label: "Saldo", value: formatQuantity(info.stock, unit), tone: info.isOutOfStock ? "danger" : info.isLow ? "warning" : "neutral" },
        { label: "Preço", value: `${formatCurrency(info.product.price)}${unit === "kg" ? "/kg" : ""}` },
        { label: "Vendas no mês", value: formatQuantity(s.quantity, unit) },
        ...(commercial ? [{ label: "Faturamento no mês", value: formatCurrency(s.revenue) }] : []),
      ],
    });
  }

  return ok(`${several(products)} Veja o saldo e as vendas ${inPeriod(period)}:`, context, {
    list: stock.data.map((info, index) => ({
      label: info.product.name,
      value: `${formatQuantity(info.stock, info.product.unit)} em estoque`,
      note: `vendas no mês: ${formatQuantity(sales.data[index].quantity, info.product.unit)}`,
      tone: info.isLow ? "warning" : undefined,
    })),
  });
}
