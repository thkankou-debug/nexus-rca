"use client";

// ============================================================================
// CHAÎNE DE VALIDATION DES PAIEMENTS (§4.3) — liste partagée entre l'écran
// Comptable (mode "reconcile" : déclaré → à valider) et l'écran Trésorerie
// DAF (mode "validate" : à valider → encaissé). Un seul composant, deux
// permissions distinctes côté serveur — aucun rôle ne franchit deux étapes.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, ReceiptText } from "lucide-react";

export interface ChainPayment {
  id: string;
  reference: string | null;
  client_nom: string;
  service: string;
  montant_recu: number;
  devise: string;
  method: string | null;
  date_paiement: string;
}

const METHOD_LABELS: Record<string, string> = {
  especes: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement",
  carte: "Carte",
  cheque: "Chèque",
  stripe: "Stripe",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  express_union: "Express Union",
  autre: "Autre",
};

function formatMoney(n: number, devise: string): string {
  return `${Math.round(n).toLocaleString("fr-FR")} ${devise === "XAF" ? "FCFA" : devise}`;
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export function PaiementsChainList({
  payments,
  mode,
  emptyText,
}: {
  payments: ChainPayment[];
  mode: "reconcile" | "validate";
  emptyText: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/paiements/${id}/${mode}`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec de l'opération");
        return;
      }
      toast.success(mode === "reconcile" ? "Paiement rapproché — transmis au DAF" : "Paiement validé (encaissé)");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (payments.length === 0) {
    return (
      <div className="mt-3 rounded-sm border border-dashed border-line px-4 py-8 text-center">
        <ReceiptText className="mx-auto h-6 w-6 text-ink-subtle" aria-hidden />
        <p className="mt-2 text-body-sm text-ink-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="mt-3 divide-y divide-line">
      {payments.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-ink">
              {p.client_nom}
              <span className="font-normal text-ink-muted"> · {p.service}</span>
            </p>
            <p className="text-caption text-ink-muted">
              {[
                p.reference,
                p.method ? METHOD_LABELS[p.method] || p.method : null,
                formatDate(p.date_paiement),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
              {formatMoney(Number(p.montant_recu), p.devise)}
            </span>
            <button
              type="button"
              disabled={busyId === p.id}
              onClick={() => act(p.id)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
            >
              {busyId === p.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {mode === "reconcile" ? "Marquer rapproché" : "Valider l'encaissement"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
