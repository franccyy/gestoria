"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reconhecimento de voz com a Web Speech API do navegador (gratuita, sem chave).
 * Funciona no Chrome, no Edge e no Safari; o Firefox não oferece esse recurso.
 * Exige HTTPS ou localhost.
 *
 * Observação: no Chrome, o áudio é enviado aos servidores do Google para
 * ser transcrito; por isso o recurso também precisa de internet.
 */

// Tipos mínimos: a Web Speech API ainda não faz parte dos tipos padrão do TypeScript.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** "checking" até o navegador ser verificado (evita diferença entre servidor e navegador). */
export type SpeechSupport = "checking" | "supported" | "unsupported" | "insecure";

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Permissão do microfone negada. Libere o acesso nas configurações do navegador ou continue digitando.",
  "service-not-allowed": "O navegador bloqueou o reconhecimento de voz. Você pode continuar digitando.",
  "no-speech": "Não ouvi nenhuma fala. Toque no microfone e tente de novo.",
  "audio-capture": "Nenhum microfone foi encontrado neste aparelho.",
  network: "O reconhecimento de voz do navegador precisa de conexão com a internet.",
};

interface Options {
  /** Recebe o texto reconhecido; `isFinal` = a frase terminou. */
  onTranscript: (text: string, isFinal: boolean) => void;
  lang?: string;
}

export function useSpeechRecognition({ onTranscript, lang = "pt-BR" }: Options) {
  const [support, setSupport] = useState<SpeechSupport>("checking");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (!getRecognitionConstructor()) setSupport("unsupported");
    else if (!window.isSecureContext) setSupport("insecure");
    else setSupport("supported");
    return () => recognitionRef.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition || recognitionRef.current) return;
    setError(null);

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = true; // mostra o texto enquanto a pessoa fala
    recognition.continuous = false; // para sozinho ao fim da frase
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      onTranscriptRef.current(transcript.trim(), isFinal);
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setError(ERROR_MESSAGES[event.error] ?? "Não foi possível reconhecer a fala. Você pode continuar digitando.");
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setError("Não foi possível iniciar o microfone. Você pode continuar digitando.");
    }
  }, [lang]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);
  const clearError = useCallback(() => setError(null), []);

  return { support, listening, error, start, stop, clearError };
}
