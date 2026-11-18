import { AuditFeatureCard, type AuditFeature } from "@/components/audit/AuditFeatureCard";
import { PageHeading } from "@/components/layout/PageHeading";
import { Badge } from "@/components/ui/Badge";

const FEATURES: AuditFeature[] = [
  { title: "Preços", description: "Conferência planejada entre etiquetas e cadastro.", icon: "scan", tint: "tint-green" },
  { title: "Validade", description: "Acompanhamento planejado de vencimentos.", icon: "calendarClock", tint: "tint-peach" },
  { title: "Rupturas", description: "Registro planejado de produtos ausentes.", icon: "packageX", tint: "tint-blue" },
  { title: "Exposição", description: "Avaliação planejada da apresentação em loja.", icon: "grid", tint: "tint-lilac" },
];

/** Tela 6 — Auditoria inteligente (somente apresentação; nada é executado). */
export default function AuditoriaPage() {
  return (
    <>
      <PageHeading
        eyebrow="Evolução futura"
        title="Auditoria inteligente"
        description="Uma próxima etapa poderá apoiar a prevenção de perdas. Os recursos abaixo são conceitos de layout e ainda não realizam verificações."
      >
        <Badge tone="warning">Não implementado nesta versão</Badge>
      </PageHeading>

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {FEATURES.map((feature) => (
          <AuditFeatureCard key={feature.title} feature={feature} />
        ))}
      </ul>

      <p className="mt-6 text-body text-muted">
        Futuras funções de imagem, OCR e integração empresarial dependerão de implementação e autorização específicas.
      </p>
    </>
  );
}
