/**
 * Funções de períodos (meses e anos).
 * Todas são "puras": recebem valores e devolvem valores, sem ler dados.
 */

/** Um mês específico. `month` vai de 1 (janeiro) a 12 (dezembro). */
export interface MonthRef {
  year: number;
  month: number;
}

/**
 * Período de consulta:
 * - "month": um mês (ex.: novembro de 2026).
 * - "year": de janeiro até `toMonth` de um ano (ex.: 2026 até novembro).
 */
export type Period =
  | { kind: "month"; year: number; month: number }
  | { kind: "year"; year: number; toMonth: number };

export const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
] as const;

const MONTH_ABBR = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."] as const;

/** {2026, 11} → "2026-11" */
export function monthKey({ year, month }: MonthRef): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** "2026-11" → {2026, 11}. Lança erro se o texto for inválido. */
export function parseMonthKey(key: string): MonthRef {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  const month = match ? Number(match[2]) : 0;
  if (!match || month < 1 || month > 12) throw new Error(`Mês inválido: "${key}"`);
  return { year: Number(match[1]), month };
}

/** Soma (ou subtrai) meses: addMonths({2026, 1}, -1) → {2025, 12}. */
export function addMonths({ year, month }: MonthRef, amount: number): MonthRef {
  const index = year * 12 + (month - 1) + amount;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Compara meses: negativo se a < b, zero se iguais, positivo se a > b. */
export function compareMonths(a: MonthRef, b: MonthRef): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

export function monthPeriod({ year, month }: MonthRef): Period {
  return { kind: "month", year, month };
}

/** Ano completo (janeiro a dezembro). */
export function fullYearPeriod(year: number): Period {
  return { kind: "year", year, toMonth: 12 };
}

/** De janeiro até o mês informado (acumulado do ano). */
export function yearToDatePeriod({ year, month }: MonthRef): Period {
  return { kind: "year", year, toMonth: month };
}

/**
 * Período anterior equivalente:
 * - mês → mês anterior (janeiro/2026 → dezembro/2025);
 * - ano → mesmo intervalo do ano anterior (jan–nov/2026 → jan–nov/2025).
 */
export function previousPeriod(period: Period): Period {
  if (period.kind === "month") return monthPeriod(addMonths(period, -1));
  return { kind: "year", year: period.year - 1, toMonth: period.toMonth };
}

/** Mesmo mês do ano anterior (novembro/2026 → novembro/2025). */
export function sameMonthLastYear(period: Extract<Period, { kind: "month" }>): Period {
  return { kind: "month", year: period.year - 1, month: period.month };
}

/** Primeiro e último mês de um período. */
export function periodBounds(period: Period): { first: MonthRef; last: MonthRef } {
  if (period.kind === "month") return { first: period, last: period };
  return { first: { year: period.year, month: 1 }, last: { year: period.year, month: period.toMonth } };
}

/** Lista de chaves "AAAA-MM" de todos os meses do período. */
export function periodMonthKeys(period: Period): string[] {
  const { first, last } = periodBounds(period);
  const keys: string[] = [];
  for (let current = first; compareMonths(current, last) <= 0; current = addMonths(current, 1)) {
    keys.push(monthKey(current));
  }
  return keys;
}

/** Diz se todos os meses do período estão dentro do intervalo de dados disponível. */
export function isPeriodWithin(period: Period, firstAvailable: MonthRef, lastAvailable: MonthRef): boolean {
  const { first, last } = periodBounds(period);
  return compareMonths(first, firstAvailable) >= 0 && compareMonths(last, lastAvailable) <= 0;
}

/** {2026, 11} → "novembro de 2026" */
export function monthLabel({ year, month }: MonthRef): string {
  return `${MONTH_NAMES[month - 1]} de ${year}`;
}

/**
 * Nome do período para exibição:
 * - "novembro de 2026"
 * - "2025" (ano completo)
 * - "2026 (jan. a nov.)" (ano parcial)
 */
export function periodLabel(period: Period): string {
  if (period.kind === "month") return monthLabel(period);
  if (period.toMonth === 12) return String(period.year);
  if (period.toMonth === 1) return `janeiro de ${period.year}`;
  return `${period.year} (jan. a ${MONTH_ABBR[period.toMonth - 1]})`;
}
