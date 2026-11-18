/**
 * Encontra os períodos citados numa pergunta já normalizada (sem acentos, minúsculas).
 *
 * Entende: "neste mês", "mês passado", "neste ano", "ano passado",
 * nomes de meses ("outubro", "outubro de 2025"), "10/2025" e anos ("2025").
 * Os períodos relativos usam o mês de referência da base, não o relógio.
 */
import {
  addMonths,
  fullYearPeriod,
  MONTH_NAMES,
  monthPeriod,
  yearToDatePeriod,
  type MonthRef,
  type Period,
} from "@/lib/periods";
import { normalizeText } from "@/lib/text";

export interface DetectedPeriod {
  period: Period;
  /** Posição na frase, para saber a ordem em que os períodos foram citados. */
  index: number;
  /** Veio de "ano passado" (permite comparar o mesmo intervalo do ano). */
  relativeLastYear?: boolean;
}

export interface PeriodParseResult {
  periods: DetectedPeriod[];
  /** A pergunta pede dia ou semana, mas a base só tem dados mensais. */
  asksUnsupportedGranularity: boolean;
  /** A pergunta pede o período inteiro ("de sempre", "histórico"), que atravessa anos. */
  asksAllTime: boolean;
}

const MONTHS = MONTH_NAMES.map((name) => normalizeText(name));

type Rule = { pattern: RegExp; build: (match: RegExpExecArray, reference: MonthRef) => Omit<DetectedPeriod, "index"> | null };

/** A ordem importa: frases mais longas primeiro ("mês passado" antes de "mês"). */
const RULES: Rule[] = [
  {
    pattern: /\b(?:no |do )?(?:mes passado|mes anterior|ultimo mes)\b/g,
    build: (_, ref) => ({ period: monthPeriod(addMonths(ref, -1)) }),
  },
  {
    pattern: /\b(?:ano passado|ano anterior|ultimo ano)\b/g,
    build: (_, ref) => ({ period: fullYearPeriod(ref.year - 1), relativeLastYear: true }),
  },
  {
    pattern: new RegExp(`\\b(${MONTHS.join("|")})(?: (?:de )?(\\d{4}))?\\b`, "g"),
    build: (match, ref) => {
      const month = MONTHS.indexOf(match[1]) + 1;
      // Sem ano: o mês mais recente até o mês de referência (ex.: "dezembro" → dezembro/2025).
      const year = match[2] ? Number(match[2]) : month <= ref.month ? ref.year : ref.year - 1;
      return { period: monthPeriod({ year, month }) };
    },
  },
  {
    // "10/2025" vira "10 2025" na normalização.
    pattern: /\b(\d{1,2}) (20\d{2})\b/g,
    build: (match) => {
      const month = Number(match[1]);
      return month >= 1 && month <= 12 ? { period: monthPeriod({ year: Number(match[2]), month }) } : null;
    },
  },
  {
    pattern: /\b(?:este|neste|esse|nesse|deste|desse) mes\b|\bmes atual\b|\b(?:no|do) mes\b|\bmensal\b/g,
    build: (_, ref) => ({ period: monthPeriod(ref) }),
  },
  {
    pattern: /\b(?:este|neste|esse|nesse|deste|desse) ano\b|\bano atual\b|\b(?:no|do) ano\b|\bacumulado\b/g,
    build: (_, ref) => ({ period: yearToDatePeriod(ref) }),
  },
  {
    pattern: /\b(20\d{2})\b/g,
    build: (match, ref) => {
      const year = Number(match[1]);
      return { period: year === ref.year ? yearToDatePeriod(ref) : fullYearPeriod(year) };
    },
  },
];

export function parsePeriods(normalizedQuestion: string, reference: MonthRef): PeriodParseResult {
  let text = normalizedQuestion;
  const periods: DetectedPeriod[] = [];

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = rule.pattern.exec(text)) !== null) {
      const found = rule.build(match, reference);
      if (found) periods.push({ ...found, index: match.index });
      // Apaga o trecho já usado, para outra regra não reaproveitá-lo.
      text = text.slice(0, match.index) + " ".repeat(match[0].length) + text.slice(match.index + match[0].length);
    }
  }

  return {
    periods: periods.sort((a, b) => a.index - b.index),
    asksUnsupportedGranularity: /\b(hoje|ontem|semana|semanal|diario|dia)\b/.test(text),
    asksAllTime: /\b(de|desde) sempre\b|\bde todos os tempos\b|\bhistorico\b|\bdesde o inicio\b|\btodo o periodo\b|\btodos os meses\b/.test(text),
  };
}
