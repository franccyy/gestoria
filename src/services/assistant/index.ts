import { ruleEngine } from "./rules/ruleEngine";
import type { AssistantEngine } from "./types";

export type { AssistantEngine, AssistantReply, AssistantRequest } from "./types";

/**
 * Ponto único de escolha do motor do assistente.
 * Para trocar por outro motor (ex.: Claude API pelo servidor), altere só esta linha.
 */
export const assistantEngine: AssistantEngine = ruleEngine;
