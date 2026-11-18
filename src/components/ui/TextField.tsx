import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Rótulo do campo (sempre existe, por acessibilidade). */
  label: string;
  /** Esconde o rótulo visualmente, mantendo-o para leitores de tela. */
  hideLabel?: boolean;
  /** Conteúdo dentro do campo, à esquerda (ex.: ícone de busca). */
  startAdornment?: ReactNode;
  /** Conteúdo dentro do campo, à direita (ex.: botão de enviar). */
  endAdornment?: ReactNode;
  /** Texto de ajuda abaixo do campo. */
  hint?: string;
  /** Mensagem de erro (deixa a borda vermelha). */
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Campo de texto com contorno grosso, como o campo de perguntas do assistente. */
export function TextField({ label, hideLabel, startAdornment, endAdornment, hint, error, className, id, ref, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={className}>
      <label htmlFor={inputId} className={cn("mb-2 block text-body text-foreground", hideLabel && "sr-only")}>
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-card border-thick bg-surface py-2 pr-2 pl-5 transition-colors",
          error ? "border-danger" : "border-input-border focus-within:border-primary",
        )}
      >
        {startAdornment}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className="min-h-11 w-full min-w-0 bg-transparent text-body text-foreground outline-none placeholder:text-subtle"
          {...rest}
        />
        {endAdornment}
      </div>
      {message && (
        <p id={messageId} className={cn("mt-2 text-caption", error ? "text-danger" : "text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}
