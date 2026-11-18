"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Janela de confirmação (ex.: "Limpar histórico?").
 * Usa o elemento nativo <dialog>, que já cuida do foco do teclado
 * e fecha com a tecla Esc.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // Clique fora da caixa (no fundo escurecido) cancela.
        if (event.target === dialogRef.current) onCancel();
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-sm rounded-lg bg-background p-card text-foreground shadow-raised backdrop:bg-foreground/40"
    >
      <h2 id="confirm-dialog-title" className="text-xl font-semibold">
        {title}
      </h2>
      {description && <p className="mt-2 text-body text-muted">{description}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
