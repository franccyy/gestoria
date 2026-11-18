/** Motivos pelos quais uma consulta pode não ter resposta. */
export type QueryFailureReason = "product_not_found" | "no_data_for_period";

/**
 * Resultado de uma consulta: ou traz os dados, ou explica por que não trouxe.
 * Assim, quem usa a consulta é obrigado a tratar a falta de dados,
 * e nunca precisa "chutar" um número.
 */
export type QueryResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: QueryFailureReason; message: string };

export function success<T>(data: T): QueryResult<T> {
  return { ok: true, data };
}

export function failure<T = never>(reason: QueryFailureReason, message: string): QueryResult<T> {
  return { ok: false, reason, message };
}
