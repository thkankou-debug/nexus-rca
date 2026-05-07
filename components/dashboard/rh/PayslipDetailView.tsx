"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Download,
  CheckCircle2,
  XCircle,
  Send,
  Pencil,
  History,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Employee,
  Payslip,
  PayslipHistoryAction,
  PayslipValidationHistory,
} from "@/types";
import { PayslipForm } from "./PayslipForm";
import { PayslipStatusBadge } from "./PayslipStatusBadge";
import { formatFcfa, formatDateShort, formatDateTimeShort } from "./format";

interface PayslipDetailViewProps {
  payslipId: string;
  /** Si true → super-admin : peut valider/refuser */
  canValidate: boolean;
}

type PayslipFull = Payslip & {
  employees?: Pick<
    Employee,
    | "id"
    | "nom_complet"
    | "email"
    | "poste"
    | "departement"
    | "type_contrat"
    | "date_embauche"
    | "telephone"
    | "numero_cni"
  >;
};

type HistoryEntry = PayslipValidationHistory & {
  profiles?: { id: string; nom: string | null; prenom: string | null; email: string } | null;
};

const ACTION_LABEL: Record<PayslipHistoryAction, string> = {
  created: "Création",
  edited: "Modification",
  submitted: "Soumis pour validation",
  validated: "Validée",
  rejected: "Refusée (retour brouillon)",
};

const ACTION_COLOR: Record<PayslipHistoryAction, string> = {
  created: "bg-slate-100 text-slate-700",
  edited: "bg-blue-100 text-blue-700",
  submitted: "bg-amber-100 text-amber-800",
  validated: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export function PayslipDetailView({
  payslipId,
  canValidate,
}: PayslipDetailViewProps) {
  const [payslip, setPayslip] = useState<PayslipFull | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [actionType, setActionType] = useState<"validate" | "reject" | null>(
    null
  );

  const refresh = () => {
    setLoading(true);
    fetch(`/api/rh/payslips/${payslipId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setPayslip(json.payslip as PayslipFull);
          setHistory((json.history as HistoryEntry[]) ?? []);
        } else {
          setError(json.error || "Introuvable");
        }
      })
      .catch((e) => {
        console.error("[RH_PAYSLIP_DETAIL] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payslipId]);

  const handleSubmitForValidation = async () => {
    if (!payslip) return;
    if (
      !confirm(
        "Soumettre cette fiche au super-admin pour validation ? Vous ne pourrez plus la modifier."
      )
    )
      return;
    setActionBusy(true);
    try {
      const res = await fetch(`/api/rh/payslips/${payslip.id}/submit`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      refresh();
    } catch (e) {
      console.error("[RH_PAYSLIP_DETAIL] submit", e);
      alert((e as Error).message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleValidate = async () => {
    if (!payslip) return;
    setActionBusy(true);
    try {
      const res = await fetch(`/api/rh/payslips/${payslip.id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: actionNote.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      setActionType(null);
      setActionNote("");
      refresh();
    } catch (e) {
      console.error("[RH_PAYSLIP_DETAIL] validate", e);
      alert((e as Error).message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleReject = async () => {
    if (!payslip) return;
    if (!actionNote.trim()) {
      if (!confirm("Refuser sans note ? Une note est recommandée.")) return;
    }
    setActionBusy(true);
    try {
      const res = await fetch(`/api/rh/payslips/${payslip.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: actionNote.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      setActionType(null);
      setActionNote("");
      refresh();
    } catch (e) {
      console.error("[RH_PAYSLIP_DETAIL] reject", e);
      alert((e as Error).message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!payslip) return;
    try {
      const res = await fetch(`/api/rh/payslips/${payslip.id}/pdf-url`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("[RH_PAYSLIP_DETAIL] pdf", e);
      alert((e as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }
  if (error || !payslip) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error ?? "Fiche introuvable."}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs font-semibold text-slate-500 hover:text-nexus-blue-950"
        >
          ← Retour à la fiche
        </button>
        <PayslipForm
          payslip={payslip}
          onSuccess={() => {
            setEditing(false);
            refresh();
          }}
        />
      </div>
    );
  }

  const isBrouillon = payslip.statut === "brouillon";
  const isEnAttente = payslip.statut === "en_attente_validation";
  const isValidee = payslip.statut === "validee";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">
              {payslip.reference}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
              {payslip.employees?.nom_complet ?? "—"}
            </h2>
            <p className="text-sm text-slate-600">
              {payslip.employees?.poste} · {payslip.employees?.departement}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Période : {payslip.mois_libelle} (
              {formatDateShort(payslip.periode_debut)} →{" "}
              {formatDateShort(payslip.periode_fin)})
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PayslipStatusBadge status={payslip.statut} />
            {isEnAttente && !canValidate && (
              <p className="max-w-xs text-right text-xs text-amber-700">
                En attente de validation par le Super-Admin.
              </p>
            )}
          </div>
        </div>

        {/* Montants */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Salaire brut
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-700">
              {formatFcfa(payslip.salaire_brut)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Salaire net
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-800">
              {formatFcfa(payslip.salaire_net)}
            </p>
          </div>
        </div>

        {payslip.notes_admin && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Note admin
            </p>
            <p className="mt-1 text-sm text-slate-700">{payslip.notes_admin}</p>
          </div>
        )}

        {payslip.notes_super_admin && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Note super-admin
            </p>
            <p className="mt-1 text-sm text-amber-900">
              {payslip.notes_super_admin}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isBrouillon && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-nexus-blue-950 shadow-sm transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
            <button
              type="button"
              onClick={handleSubmitForValidation}
              disabled={actionBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:opacity-60"
            >
              {actionBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Soumettre pour validation
            </button>
          </>
        )}

        {isEnAttente && canValidate && (
          <>
            <button
              type="button"
              onClick={() => {
                setActionType("validate");
                setActionNote("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Valider
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType("reject");
                setActionNote("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              <XCircle className="h-4 w-4" />
              Refuser
            </button>
          </>
        )}

        {isValidee && payslip.pdf_url && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-blue-900"
          >
            <Download className="h-4 w-4" />
            Télécharger le PDF
          </button>
        )}
      </div>

      {/* Modal validation/refus inline */}
      {actionType && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            {actionType === "validate" ? (
              <Sparkles className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            )}
            <h3 className="font-display text-base font-bold text-nexus-blue-950">
              {actionType === "validate"
                ? "Valider la fiche de paie"
                : "Refuser la fiche de paie"}
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            {actionType === "validate"
              ? "Le PDF officiel sera généré et envoyé à l'employé. Cette action est définitive."
              : "La fiche reviendra en brouillon. L'admin pourra la modifier puis re-soumettre."}
          </p>
          <textarea
            rows={3}
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            placeholder={
              actionType === "validate"
                ? "Note (optionnel)…"
                : "Motif du refus (recommandé)…"
            }
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setActionType(null);
                setActionNote("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={actionType === "validate" ? handleValidate : handleReject}
              disabled={actionBusy}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60",
                actionType === "validate"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {actionBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmer
            </button>
          </div>
        </div>
      )}

      {/* Audit trail */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <History className="h-4 w-4 text-slate-500" />
          <h3 className="font-display text-base font-bold text-nexus-blue-950">
            Historique de validation
          </h3>
        </div>
        {history.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucun événement.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((h) => {
              const who = h.profiles
                ? [h.profiles.prenom, h.profiles.nom]
                    .filter(Boolean)
                    .join(" ") || h.profiles.email
                : "Système";
              return (
                <li key={h.id} className="flex items-start gap-3 p-4">
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      ACTION_COLOR[h.action]
                    )}
                  >
                    {ACTION_LABEL[h.action]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-nexus-blue-950">
                      {who}
                    </p>
                    {h.note && (
                      <p className="mt-1 text-sm text-slate-700">{h.note}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-[10px] text-slate-400">
                    {formatDateTimeShort(h.created_at)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
