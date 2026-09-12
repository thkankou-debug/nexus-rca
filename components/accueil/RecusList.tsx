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
          total: sorted.reduce((s2, r) => s2 + Number(r.montant_total), 0),
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
            </div>
          </div>
          <ul className="mt-2 space-y-0.5 border-t border-line pt-2">
            {t.sales.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-caption text-ink-muted">
                <span>
                  {s.description || "Prestation"} × {s.quantite}
                </span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatMoney(Number(s.montant_total), s.devise)}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
