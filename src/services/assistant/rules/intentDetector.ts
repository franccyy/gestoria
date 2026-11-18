/**
 * Identifica a intenção da pergunta por palavras-chave.
 * Recebe a pergunta normalizada (sem acentos, minúsculas).
 */
import type { AssistantIntent } from "@/types/assistant";

export type RankingCriterion = "quantity" | "revenue";

export interface DetectedIntent {
  intent: AssistantIntent | null;
  /** A pergunta fala de faturamento/valores em reais. */
  mentionsRevenue: boolean;
  ranking: { by: RankingCriterion; direction: "desc" | "asc"; limit: number };
  /** Começa com "e ..." (ex.: "E no mês passado?"): continua a pergunta anterior. */
  isFollowUp: boolean;
}

/** Regras em ordem de prioridade: a primeira que combinar define a intenção. */
const INTENT_RULES: Array<[AssistantIntent, RegExp]> = [
  ["lowStock", /estoque (baixo|minimo|critico)|abaixo do (estoque )?minimo|acabando|em falta|faltando|ruptura|repor|reposicao|sem estoque|zerad/],
  ["ranking", /mais vendid|menos vendid|\btop\b|ranking|campea|maior(es)? (faturamento|venda)|menor(es)? (faturamento|venda)|que mais (vend|fatur)|que menos (vend|fatur)/],
  ["representativeness", /representa|participacao|percentual|porcentagem/],
  ["comparison", /compar|versus|\bvs\b|em relacao|diferenca|cresceu|crescimento|caiu|queda|variacao|aumentou|diminuiu|evolucao/],
  ["price", /preco|quanto custa|\bcusta\b/],
  ["stock", /saldo|estoque|quant[oa]s? (tem|temos|ha)\b|disponive/],
  ["revenue", /fatur|receita|em reais|quanto rendeu|arrecad/],
  ["sales", /vend|saiu|sairam|saida/],
  ["help", /^(oi|ola|bom dia|boa tarde|boa noite|ajuda)\b|o que (voce|vc) (faz|sabe|pode)|como (funciona|usar|te usar)|^ajuda/],
];

const NUMBER_WORDS: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
};

function detectLimit(text: string): number {
  const numeric = /\btop ?(\d{1,2})\b/.exec(text) ??
    /\b(\d{1,2}|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez) (?:produtos|itens|mais|menos|primeiros|principais)\b/.exec(text);
  if (numeric) {
    const value = NUMBER_WORDS[numeric[1]] ?? Number(numeric[1]);
    return Math.min(Math.max(value, 1), 20);
  }
  // Singular: "qual produto...", "o mais vendido", "o campeão".
  if (/\bqual (e o |foi o )?produto\b|\bo (produto )?(mais|menos) vendido\b|\bo (produto )?de (maior|menor)\b|\bcampea/.test(text)) return 1;
  return 5;
}

export function detectIntent(normalizedQuestion: string): DetectedIntent {
  const text = normalizedQuestion;
  const intent = INTENT_RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
  const mentionsRevenue = /fatur|receita|em reais|valor|rendeu|arrecad/.test(text);

  return {
    intent,
    mentionsRevenue,
    ranking: {
      by: mentionsRevenue ? "revenue" : "quantity",
      direction: /menos vendid|menor(es)? (faturamento|venda)|que menos/.test(text) ? "asc" : "desc",
      limit: detectLimit(text),
    },
    isFollowUp: /^(e|mas|agora|e quanto|e sobre)\b/.test(text),
  };
}

/**
 * Palavras que fazem parte do jeito de perguntar (não são nome de produto).
 * Usadas para perceber quando o usuário citou um produto que não existe na base.
 */
const KNOWN_PREFIXES = [
  "qual", "quais", "quant", "foram", "estao", "esta", "temos", "possui", "teve", "tiveram", "mostr", "diga", "inform",
  "sobre", "como", "isso", "este", "esta", "esse", "essa", "neste", "nesta", "nesse", "nessa", "deste", "desta", "desse",
  "dessa", "pelo", "pela", "favor", "agora", "entao", "ainda", "tamb", "voce", "pode", "poder", "gostar", "saber", "quero",
  "preciso", "dado", "geral", "total", "todo", "toda", "lista", "liste", "listar", "cada", "loja", "nossa", "nosso", "produt",
  "item", "iten", "unidad", "vend", "fatur", "estoq", "sald", "compar", "represent", "particip", "percent", "porcent",
  "preco", "cust", "passad", "anterior", "atual", "ultim", "acumul", "ranking", "mais", "menos", "maior", "menor", "baix",
  "minim", "critic", "acaband", "falt", "ruptur", "repor", "reposi", "zerad", "dispon", "receit", "rend", "arrecad", "cresc",
  "caiu", "qued", "varia", "aument", "diminu", "evolu", "difer", "relac", "versus", "mensal", "semana", "hoje", "ontem",
  "cinco", "quatro", "seis", "sete", "oito", "nove", "tres", "dois", "duas", "primeir", "principa", "campea", "periodo",
  "saiu", "sairam", "saida", "existe", "algum", "alguma", "ajuda", "obrigad", "valor", "reais", "momento", "mesmo",
  "categ", "setor", "seco", "secao", "depart", "bebid", "mercear", "laticin", "higien", "limpez", "hortifrut", "hortali",
  "padar", "frut", "verdur", "sempre", "inteir", "complet", "geral",
  ...["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
];

export function isKnownWord(token: string): boolean {
  return KNOWN_PREFIXES.some((prefix) => token.startsWith(prefix));
}
