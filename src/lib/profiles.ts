import type { AccessLevel, Profile, ProfileId } from "@/types/profile";

/**
 * Perfis disponíveis no protótipo e o que cada um pode consultar.
 * Para mudar permissões, altere apenas esta lista.
 */
export const PROFILES: readonly Profile[] = [
  {
    id: "funcionario",
    label: "Funcionário",
    description: "Consulta produtos, preços e saldos em estoque.",
    access: "operational",
  },
  {
    id: "encarregado",
    label: "Encarregado",
    description: "Acompanha estoque, vendas em unidades e reposição.",
    access: "operational",
  },
  {
    id: "gerente",
    label: "Gerente",
    description: "Consultas operacionais e indicadores comerciais da loja.",
    access: "commercial",
  },
  {
    id: "administrador",
    label: "Administrador",
    description: "Acesso completo à demonstração.",
    access: "commercial",
  },
];

export function findProfile(id: string | null | undefined): Profile | undefined {
  return PROFILES.find((profile) => profile.id === id);
}

export function isProfileId(value: unknown): value is ProfileId {
  return typeof value === "string" && PROFILES.some((profile) => profile.id === value);
}

/** Frase que explica ao usuário o que o perfil dele pode consultar. */
export function accessSummary(profile: Profile): string {
  return profile.access === "commercial"
    ? "Neste perfil, as consultas operacionais e os indicadores comerciais estão disponíveis nesta demonstração."
    : "Neste perfil, estão disponíveis as consultas operacionais (produtos, saldos e vendas em unidades). Indicadores comerciais são exclusivos de Gerente e Administrador.";
}

/** Diz se o perfil pode ver informações de um nível de acesso. */
export function canAccess(profile: Profile, required: AccessLevel): boolean {
  return required === "operational" || profile.access === "commercial";
}
