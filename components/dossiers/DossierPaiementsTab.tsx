import { Wallet } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface DossierPayment {
  id: string;
  reference: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  method: string | null;
  created_at: string;
}

// A5 : lien reel via payments.demande_id — verifie sur les donnees reelles,
// non renseigne sur les 3 paiements existants (meme defaut que
// demandes.client_record_id avant P3, voir docs/DETTE.md). Vide honnete
// tant que le flux de creation de paiement ne renseigne pas cette colonne.
export function DossierPaiementsTab({ payments }: { payments: DossierPayment[] }) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <Wallet className="mx-auto h-6 w-6 text-slate-400" />
        <p className="mt-3 text-sm text-slate-500">Aucun paiement lié à ce dossier.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {payments.map((p) => (
        <li key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold text-nexus-orange-700">
              {p.reference ?? p.id.slice(0, 8)}
            </span>
            <span className="text-sm font-bold text-nexus-blue-950">
              {p.amount != null ? `${p.amount.toLocaleString("fr-FR")} ${p.currency ?? "XAF"}` : "—"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {p.method ?? "méthode non précisée"} · {p.status ?? "statut inconnu"} · {formatDate(p.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
