"use client";

import { Toaster, toast } from "react-hot-toast";

export { toast };

// Fine enveloppe sur react-hot-toast (déjà une dépendance approuvée,
// utilisée dans 10+ fichiers du site public) — pas de système parallèle.
// Une seule instance à monter dans AdminShell.
export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgb(var(--surface-elevated))",
          color: "rgb(var(--ink))",
          border: "1px solid rgb(var(--line))",
          borderRadius: "0.5rem",
          fontSize: "0.9375rem",
          boxShadow: "none",
        },
        success: {
          iconTheme: {
            primary: "rgb(var(--status-success))",
            secondary: "rgb(var(--surface-elevated))",
          },
        },
        error: {
          iconTheme: {
            primary: "rgb(var(--status-failure))",
            secondary: "rgb(var(--surface-elevated))",
          },
        },
      }}
    />
  );
}
