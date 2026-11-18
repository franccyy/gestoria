/**
 * Gera um identificador único.
 * crypto.randomUUID só existe em HTTPS/localhost; ao testar pelo
 * endereço de rede local (celular) usamos uma alternativa simples.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
