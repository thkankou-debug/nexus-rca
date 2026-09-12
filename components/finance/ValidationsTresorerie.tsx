"use client";

// ============================================================================
// À VALIDER — panneaux interactifs de l'écran Trésorerie DAF (§2.4) :
// dépenses en attente (valider / rejeter avec motif), rapprochements de
// caisse soumis (valider et clôturer — route /close existante), commissions
// calculées (valider — route /status existante). Le DAF valide, il ne
// saisit pas : aucune création ici.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, Lock, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

// ── Dépenses en attente ─────────────────────────────────────────────────────

export interface PendingExpense {
  id: string;
  reference: string | null;
  employee_nom: string;
  categorie: string;
  motif: string;
  montant: number;
  date_depense: string;
  preuve_path: string | null;
}

export function DepensesValidationList({ expenses }: { expenses: PendingExpense[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingExpense | null>(null);
  const [motifRejet, setMotifRejet] = useState("");

  async function decide(id: string, decision: "valide" | "rejete", motif?: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/depenses/${id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, motif_rejet: motif }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'opération");
        return;
      }
      toast.success(decision === "valide" ? "Dépense validée" : "Dépense rejetée");
      setRejectTarget(null);
      setMotifRejet("");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (expenses.length === 0) {
    return <p className="mt-3 text-body-sm text-ink-muted">Aucune dépense en attente de validation.</p>;
  }

  return (
    <>
      <ul className="mt-3 divide-y divide-line">
        {expenses.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-ink">
                {e.motif}
                <span className="font-normal text-ink-muted"> · {e.employee_nom}</span>
              </p>
              <p className="text-caption text-ink-muted">
                {[e.reference, e.categorie, formatDate(e.date_depense), e.preuve_path ? "justificatif joint" : "sans justificatif"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                {formatMoney(Number(e.montant))}
              </span>
              <button
                type="button"
                disabled={busyId === e.id}
                onClick={() => decide(e.id, "valide")}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
              >
                {busyId === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Valider
              </button>
              <button
                type="button"
                disabled={busyId === e.id}
                onClick={() => setRejectTarget(e)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink-muted hover:border-line-strong disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Rejeter
              </button>
            </div>
          </li>
        ))}
      </ul>

      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-title font-bold text-ink">Rejeter la dépense</h3>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="rounded-sm p-1 text-ink-subtle hover:bg-surface-sunken"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-body-sm text-ink-muted">
              {rejectTarget.motif} · {formatMoney(Number(rejectTarget.montant))}
            </p>
            <label className="mt-4 block">
              <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Motif du rejet (obligatoire)
              </span>
              <textarea
                rows={2}
                value={motifRejet}
                onChange={(ev) => setMotifRejet(ev.target.value)}
                className={cn(inputClass, "mt-1")}
              />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!motifRejet.trim() || busyId === rejectTarget.id}
                onClick={() => decide(rejectTarget.id, "rejete", motifRejet.trim())}
                className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Rapprochements de caisse soumis ─────────────────────────────────────────

export interface PendingSession {
  id: string;
  agent_nom: string;
  opened_at: string;
  expected_balance: number | null;
  actual_balance: number | null;
  discrepancy: number | null;
}

export function SessionsValidationList({ sessions }: { sessions: PendingSession[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function close(id: string, actualBalance: number | null) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/caisse-sessions/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual_balance: actualBalance ?? 0 }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la clôture");
        return;
      }
      toast.success("Session validée et clôturée");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (sessions.length === 0) {
    return <p className="mt-3 text-body-sm text-ink-muted">Aucun rapprochement de caisse soumis.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-line">
      {sessions.map((s) => (
        <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-body-sm font-medium text-ink">{s.agent_nom}</p>
            <p className="text-caption text-ink-muted">
              Ouverte le {formatDate(s.opened_at)} · Théorique{" "}
              {s.expected_balance !== null ? formatMoney(Number(s.expected_balance)) : "—"} · Compté{" "}
              {s.actual_balance !== null ? formatMoney(Number(s.actual_balance)) : "—"}
              {s.discrepancy !== null && Math.abs(Number(s.discrepancy)) > 0 && (
                <span className="font-semibold text-status-failure">
                  {" "}
                  · Écart {formatMoney(Number(s.discrepancy))}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            disabled={busyId === s.id}
            onClick={() => close(s.id, s.actual_balance)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
          >
            {busyId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            Valider et clôturer
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── Commissions calculées ───────────────────────────────────────────────────

export interface PendingCommission {
  id: string;
  agent_nom: string;
  amount: number;
  period_label: string | null;
}

export function CommissionsValidationList({ commissions }: { commissions: PendingCommission[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function validate(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/commissions/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "validee" }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de la validation");
        return;
      }
      toast.success("Commission validée");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (commissions.length === 0) {
    return <p className="mt-3 text-body-sm text-ink-muted">Aucune commission calculée en attente.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-line">
      {commissions.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-body-sm font-medium text-ink">{c.agent_nom}</p>
            {c.period_label && <p className="text-caption text-ink-muted">{c.period_label}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
              {formatMoney(Number(c.amount))}
            </span>
            <button
              type="button"
              disabled={busyId === c.id}
              onClick={() => validate(c.id)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
            >
              {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Valider
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
