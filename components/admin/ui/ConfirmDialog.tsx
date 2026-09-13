"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  /** Si fourni, l'utilisateur doit retaper exactement ce texte pour confirmer
   * (actions destructives — règle CLAUDE.md). */
  confirmationText?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  destructive = false,
  confirmationText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const canConfirm = !confirmationText || typed === confirmationText;

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm();
    setTyped("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xs border border-line px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={cn(
              "rounded-xs px-4 py-2 text-body-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50",
              destructive
                ? "bg-status-failure hover:bg-status-failure/90"
                : "bg-brand hover:bg-brand-hover"
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-sm text-ink-muted">{description}</p>
      {confirmationText && (
        <div className="mt-4">
          <label className="mb-1.5 block text-body-sm font-medium text-ink">
            Tapez <span className="font-mono font-semibold">{confirmationText}</span>{" "}
            pour confirmer
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="w-full rounded-xs border border-line bg-surface px-3 py-2 text-body-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>
      )}
    </Modal>
  );
}
