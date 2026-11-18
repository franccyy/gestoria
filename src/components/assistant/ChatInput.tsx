"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import { useSpeechRecognition, type SpeechSupport } from "@/hooks/useSpeechRecognition";
import { MicButton } from "./MicButton";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  /** Bloqueia o envio (ex.: enquanto o assistente responde). */
  disabled?: boolean;
  /** Texto inicial (ex.: sugestão escolhida no Início). */
  initialValue?: string;
}

const SUPPORT_HINTS: Record<SpeechSupport, string | undefined> = {
  checking: undefined,
  supported: "Digite ou toque no microfone. O texto falado aparece aqui para você revisar antes de enviar.",
  unsupported: "Este navegador não oferece reconhecimento de voz. Você pode continuar digitando normalmente.",
  insecure: "O microfone só funciona em conexão segura (HTTPS) ou em localhost. Você pode continuar digitando.",
};

/** Campo de pergunta com microfone (quando suportado) e botão de enviar. */
export function ChatInput({ onSubmit, disabled, initialValue = "" }: ChatInputProps) {
  const [text, setText] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Texto que já estava no campo quando o microfone foi ligado. */
  const textBeforeSpeechRef = useRef("");

  const speech = useSpeechRecognition({
    onTranscript: (spoken, isFinal) => {
      const before = textBeforeSpeechRef.current;
      setText(before ? `${before} ${spoken}` : spoken);
      if (isFinal) inputRef.current?.focus();
    },
  });

  // Quando chega uma sugestão nova, ela vai para o campo para revisão.
  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
      inputRef.current?.focus();
    }
  }, [initialValue]);

  const canSend = text.trim().length > 0 && !disabled;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    if (speech.listening) speech.stop();
    speech.clearError();
    onSubmit(text.trim());
    setText("");
  }

  function toggleMic() {
    if (speech.listening) {
      speech.stop();
    } else {
      textBeforeSpeechRef.current = text.trim();
      speech.start();
    }
  }

  const hint = speech.listening ? "Ouvindo… fale sua pergunta. Toque em parar quando terminar." : SUPPORT_HINTS[speech.support];

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        ref={inputRef}
        label="Sua pergunta"
        hideLabel
        placeholder={speech.listening ? "Ouvindo…" : "Digite sua pergunta…"}
        autoComplete="off"
        enterKeyHint="send"
        maxLength={300}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (speech.error) speech.clearError();
        }}
        hint={hint}
        error={speech.error ?? undefined}
        endAdornment={
          <div className="flex gap-2">
            {speech.support === "supported" && <MicButton listening={speech.listening} onToggle={toggleMic} />}
            <IconButton type="submit" icon="arrowUp" label="Enviar pergunta" disabled={!canSend} />
          </div>
        }
      />
    </form>
  );
}
