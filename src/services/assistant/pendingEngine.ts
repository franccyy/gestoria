import type { AssistantEngine } from "./types";

/**
 * PROVISÓRIO (Etapa 3): motor que ainda não consulta dados.
 * Responde de forma transparente, sem inventar números.
 * Será substituído pelo motor de regras na Etapa 5.
 */
export const pendingEngine: AssistantEngine = {
  async answer() {
    return {
      status: "unavailable",
      text:
        "Recebi sua pergunta, mas ainda não consigo consultar os dados: " +
        "a base fictícia e o mecanismo de consultas serão ativados nas próximas etapas.",
    };
  },
};
