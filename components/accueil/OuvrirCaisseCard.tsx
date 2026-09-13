"use client";

// ============================================================================
// OUVERTURE DE CAISSE — bandeau du Poste de réception (maquette ACCEUIL).
// Saisie du fonds de caisse constaté avant le premier encaissement, puis
// POST /api/caisse-sessions (permission caisse.session.open côté serveur).
// Tant que la session n'est pas ouverte, l'encaissement est bloqué avec le
// motif visible (§3.1 — règle d'ordre).
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, LockOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

export function OuvrirCaisseCard({
  sessionStatus,
}: {
  sessionStatus: "ouverte" | "a_cloturer" | "correction_demandee" | null;
}) {
  const router = useRouter();
  const [fonds, setFonds] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleOpen() {
    const value = parseFloat(fonds);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Saisissez le fonds de caisse constaté (nombre positif)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/caisse-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opening_balance: value }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'ouverture");
        return;
      }
      toast.success("Session de caisse ouverte");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (sessionStatus === "ouverte") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-surface-elevated p-5">
        <div className="flex items-center gap-3">
          <LockOpen className="h-5 w-5 text-ink-muted" aria-hidden />
          <div>
            <p className="font-display text-title text-ink">Caisse ouverte</p>
            <p className="text-body-sm text-ink-muted">
              Les encaissements sont actifs au Comptoir POS.
            </p>
          </div>
        </div>
        <a
          href="/dashboard/accueil/session"
          className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
        >
          Préparer le rapprochement
        </a>
      </div>
    );
  }

  if (sessionStatus === "a_cloturer") {
    return (
      <div className="flex items-center gap-3 rounded-sm border border-line bg-surface-elevated p-5">
        <Lock className="h-5 w-5 text-ink-muted" aria-hidden />
        <div>
          <p className="font-display text-title text-ink">Rapprochement soumis</p>
          <p className="text-body-sm text-ink-muted">
            En attente de validation par le responsable habilité — encaissements bloqués.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-line bg-surface-elevated p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <Lock className="mt-1 h-5 w-5 text-ink-muted" aria-hidden />
          <div>
            <p className="font-display text-title text-ink">Ouverture de caisse</p>
            <p className="text-body-sm text-ink-muted">
              Saisissez le fonds de caisse constaté avant le premier encaissement.
            </p>
            <p className="mt-0.5 text-caption text-ink-subtle">
              Le fonds d&rsquo;ouverture est distinct des encaissements.
            </p>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
              Fonds de caisse · FCFA
            </span>
            <input
              type="number"
              min={0}
              value={fonds}
              onChange={(e) => setFonds(e.target.value)}
              placeholder="—"
              className={cn(inputClass, "mt-1 w-44")}
            />
          </label>
          <button
            type="button"
            onClick={handleOpen}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Ouvrir ma caisse
          </button>
        </div>
      </div>
      <p className="mt-3 text-right text-caption text-ink-muted">
        Encaissements bloqués jusqu&rsquo;à l&rsquo;ouverture de la session.
      </p>
    </div>
  );
}
