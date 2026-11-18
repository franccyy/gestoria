/**
 * Leitura e gravação seguras no sessionStorage do navegador.
 * Os dados duram enquanto a aba estiver aberta e somem ao fechá-la.
 * Se o navegador bloquear o armazenamento, o app continua funcionando
 * (apenas não lembra os dados ao recarregar a página).
 */

const PREFIX = "gestoria:";

export function readSession<T>(key: string, isValid: (value: unknown) => value is T): T | undefined {
  try {
    const raw = window.sessionStorage.getItem(PREFIX + key);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function writeSession(key: string, value: unknown): void {
  try {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponível: ignora.
  }
}

export function removeSession(key: string): void {
  try {
    window.sessionStorage.removeItem(PREFIX + key);
  } catch {
    // Armazenamento indisponível: ignora.
  }
}
