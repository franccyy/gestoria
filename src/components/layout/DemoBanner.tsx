interface DemoBannerProps {
  label?: string;
  detail?: string;
}

/** Faixa que avisa que os dados são fictícios. Aparece em todas as telas internas. */
export function DemoBanner({ label = "Dados fictícios", detail = "Sem conexão com ERP" }: DemoBannerProps) {
  return (
    <div className="flex items-center gap-2 rounded-sm bg-highlight px-4 py-2.5 text-body text-foreground">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary" />
      <p>
        <span className="uppercase">{label}</span>
        {detail && <> · {detail}</>}
      </p>
    </div>
  );
}
