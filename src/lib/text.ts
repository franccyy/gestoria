/**
 * Normaliza um texto para comparação:
 * minúsculas, sem acentos, sem pontuação e com unidades padronizadas.
 *
 * Exemplos:
 *   "Coca-Cola 2L"        → "coca cola 2 litros"
 *   "Água 1.5 lt"         → "agua 1,5 litros"
 *   "Açúcar Refinado 1kg" → "acucar refinado 1 kg"
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, "$1,$2")
    .replace(/(\d+(?:,\d+)?)\s*(?:l|lt|lts|litro|litros)\b/g, "$1 litros")
    .replace(/(\d+(?:,\d+)?)\s*(ml|kg|g)\b/g, "$1 $2")
    .replace(/[^a-z0-9,\s]/g, " ")
    .replace(/(^|\s),|,(\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Palavras muito comuns, ignoradas nas buscas. */
const STOPWORDS = new Set(["a", "o", "as", "os", "de", "da", "do", "das", "dos", "e", "em", "com", "para", "um", "uma"]);

/** Divide o texto normalizado em palavras relevantes. */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}
