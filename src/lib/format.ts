/** Funções de formatação no padrão brasileiro. */
import type { ProductUnit } from "@/types/store";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "2026-11-11T21:05:00Z" → "18:05" (no fuso do navegador). */
export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

/** 9341.5 → "R$ 9.341,50" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Sem centavos, para números grandes em destaque: 182346.06 → "R$ 182.346" */
export function formatCurrencyRounded(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

/** 12345 → "12.345"; formatNumber(4.25, 1) → "4,3" */
export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
}

/** Proporção → porcentagem: 0.042 → "4,2%" */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  return `${formatNumber(ratio * 100, fractionDigits)}%`;
}

/** Variação com sinal: 0.083 → "+8,3%"; -0.041 → "−4,1%"; 0 → "0,0%" */
export function formatSignedPercent(ratio: number, fractionDigits = 1): string {
  const text = formatPercent(Math.abs(ratio), fractionDigits);
  if (Number(text.replace(/[^\d]/g, "")) === 0) return text;
  return `${ratio > 0 ? "+" : "−"}${text}`;
}

/** Por extenso, para frases: 850 → "850 unidades"; 1 → "1 unidade"; 560 kg → "560 kg" */
export function formatQuantityLong(quantity: number, unit: ProductUnit): string {
  if (unit === "kg") return `${formatNumber(quantity)} kg`;
  return `${formatNumber(quantity)} ${quantity === 1 ? "unidade" : "unidades"}`;
}

/** 850, "un" → "850 un."; 560, "kg" → "560 kg" */
export function formatQuantity(quantity: number, unit: ProductUnit): string {
  return unit === "kg" ? `${formatNumber(quantity)} kg` : `${formatNumber(quantity)} un.`;
}
