import { Card, type CardVariant } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface AuditFeature {
  title: string;
  description: string;
  icon: IconName;
  tint: Extract<CardVariant, `tint-${string}`>;
}

/**
 * Card de conceito de uma função futura da Auditoria.
 * É apenas informativo: não é clicável e não executa nada.
 */
export function AuditFeatureCard({ feature }: { feature: AuditFeature }) {
  return (
    <Card as="li" variant={feature.tint} padding="sm" className="h-full min-w-0 sm:p-card">
      <Icon name={feature.icon} className="size-6 text-foreground" />
      <h2 className="mt-4 font-sans text-lead font-medium">{feature.title}</h2>
      {/* hyphens/break-words: palavras longas ("Acompanhamento") quebram em telas estreitas */}
      <p className="mt-1 text-body text-foreground/80 break-words hyphens-auto">{feature.description}</p>
    </Card>
  );
}
