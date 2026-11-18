"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { AppHeader } from "@/components/layout/AppHeader";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, type CardVariant } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Loader } from "@/components/ui/Loader";
import { TextField } from "@/components/ui/TextField";

/**
 * Vitrine dos componentes reutilizáveis, para conferir visual e comportamento
 * de cada peça isoladamente. Disponível só em desenvolvimento (npm run dev).
 * Serve para conferir visual e comportamento de cada peça isoladamente.
 * As ações aqui são apenas demonstrações locais — nenhuma consulta é feita.
 */

const ICON_NAMES: IconName[] = [
  "home", "chat", "chart", "history", "scanEye", "sparkles", "arrowUpRight", "arrowUp",
  "mic", "stop", "scan", "calendarClock", "packageX", "grid", "user", "check", "close",
  "info", "alert", "trash",
];

const CARD_VARIANTS: CardVariant[] = [
  "surface", "outlined", "muted", "highlight", "primary",
  "tint-green", "tint-peach", "tint-blue", "tint-lilac",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-section">
      <h2 className="text-xl font-medium">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ComponentGallery() {
  const [lastAction, setLastAction] = useState("Nenhuma ação ainda.");
  const [question, setQuestion] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) {
      setFieldError("Digite uma pergunta antes de enviar.");
      return;
    }
    setFieldError(undefined);
    setLastAction(`Campo enviado com: “${question.trim()}”`);
    setQuestion("");
  }

  function simulateLoading() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <>
      <PageHeading
        eyebrow="Desenvolvimento · Biblioteca"
        title="Componentes"
        description="Peças reutilizáveis do GestorIA. Cada uma tem uma única implementação, usada em todas as telas."
      />

      <Card variant="muted" padding="sm" className="mt-6" aria-live="polite">
        <p className="text-caption text-muted">Última ação</p>
        <p className="mt-1 text-body">{lastAction}</p>
      </Card>

      <Section title="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setLastAction("Clicou no botão Primário.")}>Primário</Button>
          <Button variant="accent" iconRight="arrowUpRight" onClick={() => setLastAction("Clicou no botão Destaque.")}>
            Iniciar conversa
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLastAction("Clicou no botão Contorno.")}>
            Trocar perfil
          </Button>
          <Button variant="link" onClick={() => setLastAction("Clicou no botão de texto.")}>
            Limpar histórico
          </Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <div className="mt-4">
          <ButtonLink href="/inicio" variant="outline" size="sm" iconRight="arrowUpRight">
            Ir para Início
          </ButtonLink>
        </div>
      </Section>

      <Section title="Botões de ícone">
        <div className="flex items-center gap-3">
          <IconButton icon="arrowUp" label="Enviar" onClick={() => setLastAction("Clicou em Enviar.")} />
          <IconButton icon="mic" label="Microfone" variant="soft" onClick={() => setLastAction("Clicou no Microfone (sem gravação nesta etapa).")} />
          <IconButton icon="stop" label="Parar" variant="danger" onClick={() => setLastAction("Clicou em Parar.")} />
          <IconButton icon="arrowUp" label="Enviar (desabilitado)" disabled />
        </div>
      </Section>

      <Section title="Campo de texto">
        <form onSubmit={handleSubmit}>
          <TextField
            label="Pergunta"
            hideLabel
            placeholder="Digite sua pergunta…"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            error={fieldError}
            hint="Envie vazio para ver a mensagem de erro."
            endAdornment={<IconButton type="submit" icon="arrowUp" label="Enviar pergunta" />}
          />
        </form>
      </Section>

      <Section title="Chips de sugestão">
        <div className="flex flex-wrap gap-3">
          {["Estoque do produto", "Vendas do mês", "Comparar períodos"].map((label) => (
            <Chip key={label} onClick={() => setQuestion(label)}>
              {label}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-caption text-muted">Clique em um chip: o texto vai para o campo acima.</p>
      </Section>

      <Section title="Etiquetas">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">MVP · DEMO</Badge>
          <Badge tone="highlight">Em breve</Badge>
          <Badge tone="success">+8,3%</Badge>
          <Badge tone="warning">Estoque baixo</Badge>
          <Badge tone="danger">−4,1%</Badge>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-2 gap-3">
          {CARD_VARIANTS.map((variant) => (
            <Card key={variant} variant={variant} padding="sm">
              <p className="text-body">{variant}</p>
            </Card>
          ))}
        </div>
        <Card variant="primary" radius="lg" padding="lg" className="mt-3">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-14 items-center justify-center rounded-sm bg-on-primary/10 text-accent">
              <Icon name="sparkles" className="size-7" />
            </span>
            <Badge tone="accent">MVP · DEMO</Badge>
          </div>
          <h3 className="mt-5 text-xl font-semibold text-on-primary">Card de destaque</h3>
          <p className="mt-2 text-body opacity-90">Exemplo de composição usando Card, Icon e Badge.</p>
        </Card>
      </Section>

      <Section title="Mensagens">
        <div className="flex flex-col gap-3">
          <Alert tone="info" title="Informação">O microfone não é suportado neste navegador. Continue digitando.</Alert>
          <Alert tone="success" title="Sucesso">Histórico limpo.</Alert>
          <Alert tone="warning" title="Atenção">3 produtos com estoque baixo.</Alert>
          <Alert
            tone="danger"
            title="Erro"
            action={
              <Button variant="link" onClick={() => setLastAction("Clicou em Tentar novamente.")}>
                Tentar novamente
              </Button>
            }
          >
            Não encontrei os dados necessários para responder.
          </Alert>
        </div>
      </Section>

      <Section title="Carregamento">
        <div className="flex flex-col items-start gap-4">
          <Loader variant="dots" label="O assistente está consultando os dados…" />
          {loading ? (
            <Loader label="Carregando…" />
          ) : (
            <Button variant="outline" size="sm" onClick={simulateLoading}>
              Simular carregamento (1,5 s)
            </Button>
          )}
        </div>
      </Section>

      <Section title="Estado vazio">
        <EmptyState>Nenhuma pergunta ainda. Abra o assistente para começar uma conversa.</EmptyState>
      </Section>

      <Section title="Confirmação">
        <Button variant="link" onClick={() => setDialogOpen(true)}>
          Abrir confirmação
        </Button>
        <ConfirmDialog
          open={dialogOpen}
          title="Limpar histórico?"
          description="As perguntas desta sessão serão removidas. Esta ação não pode ser desfeita."
          confirmLabel="Limpar"
          onConfirm={() => {
            setDialogOpen(false);
            setLastAction("Confirmou a ação.");
          }}
          onCancel={() => {
            setDialogOpen(false);
            setLastAction("Cancelou a ação.");
          }}
        />
      </Section>

      <Section title="Cabeçalho com perfil">
        <Card variant="outlined" padding="none" className="overflow-hidden">
          <AppHeader profileLabel="Administrador" switchProfileHref="/componentes" />
        </Card>
      </Section>

      <Section title="Ícones">
        <ul className="grid grid-cols-5 gap-3">
          {ICON_NAMES.map((name) => (
            <li key={name} className="flex flex-col items-center gap-1 text-foreground">
              <Icon name={name} className="size-6" />
              <span className="w-full truncate text-center text-caption text-muted">{name}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
