/** Identificadores dos perfis de acesso. */
export type ProfileId = "funcionario" | "encarregado" | "gerente" | "administrador";

/**
 * Nível de acesso às informações:
 * - "operational": produtos, saldos, quantidades vendidas.
 * - "commercial": tudo do operacional + faturamento, variação e representatividade.
 */
export type AccessLevel = "operational" | "commercial";

export interface Profile {
  id: ProfileId;
  label: string;
  description: string;
  access: AccessLevel;
}
