"use client";

// ============================================================================
// TICKETS & REÇUS (CAI-06/CAI-07) — chaque encaissement reste retrouvable
// et réimprimable après coup (échec d'imprimante, coupure). La réimpression
// reconstruit le ticket depuis la BASE (transaction enregistrée, jamais
// l'état de l'écran) et porte le bandeau « DUPLICATA — RÉIMPRESSION » ;
// elle ne crée évidemment aucun paiement.
// Les lignes d'un même ticket sont regroupées par ticket_key (084) ; les
// ventes antérieures à la clé restent réimprimables ligne à ligne.
// ============================================================================

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Loader2, Printer, ReceiptText } from "lucide-react";
import { generatePosTicketPdf, openPdfForPrint, downloadPdf } from "./pos-ticket";

export interface RecuSale {
  id: string;
  reference: string | null;
  description: string | null;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  devise: string;
  mode_paiement: string;
  client_nom: string | null;
  date_paiement: string;
  ticket_key: string | null;
  ligne_index: number | null;
  demande_id: string | null;
  /** Caisse ouverte G3. */
  nature: "prestation" | "caution" | "caution_remboursement";
  caution_ref: string | null;
}

const MODE_LABELS: Record<string, string> = {
  especes: "Espèces",
  mobile_money: "Mobile Money",
  carte: "Carte",
  virement: "Virement",
  cheque: "Chèque",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  autre: "Autre",
};

interface TicketGroup {
  key: string;
  reference: string;
  date: string;
  client_nom: string | null;
  mode_paiement: string;
  total: number;
  devise: string;
  sales: RecuSale[];
}

function formatMoney(n: number, devise: string): string {
  return `${Math.round(n).toLocaleString("fr-FR")} ${devise === "XAF" ? "FCFA" : devise}`;
}

function formatDateTime(d: string): string {
  try {
    return new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export function RecusList({ sales, caissiereNom }: { sales: RecuSale[]; caissiereNom: string }) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<{ sale: RecuSale; remboursable: number } | null>(null);

  // G3 : remboursable restant par ligne caution (Σ remboursements liés).
  const refundedByCaution = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sales) {
      if (s.nature === "caution_remboursement" && s.caution_ref) {
        m.set(s.caution_ref, (m.get(s.caution_ref) || 0) + Number(s.montant_total));
      }
    }
    return m;
  }, [sales]);

  const tickets = useMemo<TicketGroup[]>(() => {
    const byKey = new Map<string, RecuSale[]>();
    for (const s of sales) {
      const key = s.ticket_key || `single-${s.id}`;
      const arr = byKey.get(key) || [];
      arr.push(s);
      byKey.set(key, arr);
    }
    return Array.from(byKey.entries())
      .map(([key, rows]) => {
        const sorted = [...rows].sort((a, b) => (a.ligne_index ?? 0) - (b.ligne_index ?? 0));
        const first = sorted[0];
        return {
          key,
          reference: first.reference || "—",
          date: first.date_paiement,
          client_nom: first.client_nom,
          mode_paiement: first.mode_paiement,
          // Total signé : un remboursement de caution est une SORTIE.
          total: sorted.reduce(
            (s2, r) => s2 + (r.nature === "caution_remboursement" ? -1 : 1) * Number(r.montant_total),
            0
          ),
          devise: first.devise,
          sales: sorted,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sales]);

  async function buildPdf(t: TicketGroup): Promise<Uint8Array> {
    return generatePosTicketPdf({
      reference: t.reference,
      date: new Date(t.date),
      clientNom: t.client_nom,
      lignes: t.sales.map((s) => ({
        label: s.description || "Prestation",
        quantite: s.quantite,
        prix_unitaire: Number(s.prix_unitaire),
        montant_total: Number(s.montant_total),
      })),
      total: t.total,
      devise: t.devise === "XAF" ? "FCFA" : t.devise,
      modePaiement: MODE_LABELS[t.mode_paiement] || t.mode_paiement,
      caissiereNom,
      duplicata: true,
    });
  }

  // Cahier §8 : créer la facture d'un ticket déjà encaissé — le serveur
  // référence les ventes existantes (rien n'est doublé) et renvoie la
  // facture déjà créée si la clé a déjà été facturée.
  async function facturerTicket(t: TicketGroup) {
    const ticketKey = t.sales[0]?.ticket_key;
    if (!ticketKey) return;
    setBusyKey(t.key);
    try {
      const res = await fetch("/api/accueil/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_key: ticketKey }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Facturation impossible");
        return;
      }
      toast.success(
        json.replayed
          ? `Ce ticket est déjà facturé (${json.facture.reference}) — aucune seconde facture`
          : `Facture ${json.facture.reference} créée depuis le ticket`
      );
      window.open(`/api/accueil/factures/${json.facture.id}/pdf`, "_blank", "noopener");
    } finally {
      setBusyKey(null);
    }
  }

  async function reprint(t: TicketGroup, mode: "print" | "download") {
    setBusyKey(t.key);
    try {
      const bytes = await buildPdf(t);
      if (mode === "print") openPdfForPrint(bytes);
      else downloadPdf(bytes, `${t.reference}-duplicata.pdf`);
      toast.success("Duplicata généré — aucun nouvel encaissement");
    } finally {
      setBusyKey(null);
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line px-6 py-12 text-center">
        <ReceiptText className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
        <p className="mt-3 text-body-sm text-ink-muted">
          Aucun encaissement — les reçus émis au Comptoir POS apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <>
    <ul className="space-y-3">
      {tickets.map((t) => (
        <li key={t.key} className="rounded-sm border border-line bg-surface-elevated p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-ink">
                <span className="font-mono text-caption text-ink-muted">{t.reference}</span>
                {t.client_nom && <span> · {t.client_nom}</span>}
              </p>
              <p className="mt-0.5 text-caption text-ink-muted">
                {formatDateTime(t.date)} · {MODE_LABELS[t.mode_paiement] || t.mode_paiement} ·{" "}
                {t.sales.length} ligne{t.sales.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                {formatMoney(t.total, t.devise)}
              </span>
              <button
                type="button"
                disabled={busyKey === t.key}
                onClick={() => reprint(t, "print")}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
              >
                {busyKey === t.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                Réimprimer
              </button>
              <button
                type="button"
                disabled={busyKey === t.key}
                onClick={() => reprint(t, "download")}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                aria-label="Télécharger le duplicata"
              >
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
              {/* Cahier §8 : facture depuis un ticket — la facture RÉFÉRENCE
                  les ventes existantes (aucun revenu doublé) ; une même clé
                  ne produit qu'une facture (rejeu = facture existante). */}
              {t.sales[0]?.ticket_key && (
                <button
                  type="button"
                  disabled={busyKey === t.key}
                  onClick={() => facturerTicket(t)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-line px-3 py-1.5 text-caption font-semibold text-ink hover:border-line-strong disabled:opacity-50"
                >
                  Facturer
                </button>
              )}
            </div>
          </div>
          <ul className="mt-2 space-y-0.5 border-t border-line pt-2">
            {t.sales.map((s) => {
              const rembourse = refundedByCaution.get(s.id) || 0;
              const remboursable = s.nature === "caution" ? Number(s.montant_total) - rembourse : 0;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-caption text-ink-muted">
                  <span>
                    {s.description || "Prestation"} × {s.quantite}
                    {s.nature === "caution" && (
                      <span className="ml-1.5 rounded-sm border border-line px-1 py-0.5 font-semibold">
                        Caution{rembourse > 0 && ` · remboursé ${Math.round(rembourse).toLocaleString("fr-FR")}`}
                      </span>
                    )}
                    {s.nature === "caution_remboursement" && (
                      <span className="ml-1.5 rounded-sm border border-line px-1 py-0.5 font-semibold">
                        Remboursement (sortie)
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="[font-variant-numeric:tabular-nums]">
                      {s.nature === "caution_remboursement" ? "−" : ""}
                      {formatMoney(Number(s.montant_total), s.devise)}
                    </span>
                    {remboursable > 0 && (
                      <button
                        type="button"
                        onClick={() => setRefundTarget({ sale: s, remboursable })}
                        className="rounded-sm border border-line px-2 py-0.5 font-semibold text-ink hover:border-line-strong"
                      >
                        Rembourser
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>

    {refundTarget && (
      <CautionRefundModal
        sale={refundTarget.sale}
        remboursable={refundTarget.remboursable}
        onClose={() => setRefundTarget(null)}
      />
    )}
    </>
  );
}

// ── G3 : remboursement de caution par la réceptionniste (tracé, borné) ─────
function CautionRefundModal({
  sale,
  remboursable,
  onClose,
}: {
  sale: RecuSale;
  remboursable: number;
  onClose: () => void;
}) {
  const [montant, setMontant] = useState(String(remboursable));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const keyRef = { current: null as string | null };

  async function submit() {
    const m = parseFloat(montant);
    if (!Number.isFinite(m) || m <= 0 || m > remboursable) {
      toast.error(`Montant entre 1 et ${remboursable} FCFA requis`);
      return;
    }
    if (!keyRef.current) keyRef.current = crypto.randomUUID();
    setSaving(true);
    try {
      const res = await fetch("/api/accueil/caution-remboursement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sale_id: sale.id,
          montant: m,
          notes: notes.trim() || undefined,
          ticket_key: keyRef.current,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Échec du remboursement");
        return;
      }
      toast.success("Caution remboursée — sortie d'espèces enregistrée dans la session");
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-title font-bold text-ink">Rembourser la caution</h3>
        <p className="mt-1 text-caption text-ink-muted">
          {sale.description || "Caution"} · remboursable {Math.round(remboursable).toLocaleString("fr-FR")} FCFA.
          Sortie d&rsquo;espèces du tiroir, liée à la caution d&rsquo;origine et tracée dans l&rsquo;audit.
        </p>
        <label className="mt-4 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Montant FCFA *</span>
          <input
            type="number"
            min={1}
            max={remboursable}
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus"
            autoFocus
          />
        </label>
        <label className="mt-3 block">
          <span className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Note (optionnel)</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex : matériel restitué en bon état"
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </label>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-sm bg-brand px-4 py-2 text-body-sm font-semibold text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "Remboursement…" : "Rembourser"}
          </button>
        </div>
      </div>
    </div>
  );
}
