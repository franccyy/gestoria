import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";

interface MicButtonProps {
  listening: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/** Botão do microfone: toque para falar, toque de novo para parar. */
export function MicButton({ listening, onToggle, disabled }: MicButtonProps) {
  return (
    <IconButton
      icon={listening ? "stop" : "mic"}
      label={listening ? "Parar gravação" : "Falar pergunta"}
      variant={listening ? "danger" : "soft"}
      aria-pressed={listening}
      onClick={onToggle}
      disabled={disabled}
      className={cn(listening && "motion-safe:animate-pulse")}
    />
  );
}
