"use client";

// ============================================================================
// COMPOSANT — RapprochementFinancier
// P6, dernier lot. Compare ce qui PEUT être vérifié mécaniquement
// aujourd'hui (facture ↔ échéanciers via la FK réelle echeanciers.
// facture_id) et affiche honnêtement ce qui ne l'est pas (facture ↔
// payments, aucune FK — voir docs/DETTE.md #14). Aucun nombre inventé :
// chaque total vient d'une requête réelle passée en props depuis la page
// serveur (§I.6).
// ============================================================================

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Info } from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";
import { cn } from "@/lib/utils";

export interface FactureRapprochement {
  reference: string | null;
  client: string;
  montant: number;
  currency: string;
  echeance_total: number;
  echeance_payee: number;
  a_echeancier: boolean;
}

export interface SessionEcart {
  agent: string;
  closed_at: string;
  opening_balance: number;
  expected_balance: number;
  actual_balance: number;
  discrepancy: number;
}

export interface CommissionParAgent {
  agent: string;
  du: number;
  paye: number;
}

function formatMoney(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} XAF`;
}

export function RapprochementFinancier({
  facturesPayeesAvecEcheancier,
  anomalies,
  sessionsAvecEcart,
  commissionsParAgent,
}: {
  facturesPayeesAvecEcheancier: FactureRapprochement[];
  anomalies: FactureRapprochement[];
  sessionsAvecEcart: SessionEcart[];
  commissionsParAgent: CommissionParAgent[];
}) {
  const [showAll, setShowAll] = useState(false);

  const totalEcartCaisse = sessionsAvecEcart.reduce((sum, s) => sum + Math.abs(s.discrepancy), 0);
  const totalCommissionsDu = commissionsParAgent.reduce((sum, c) => sum + c.du, 0);
  const totalCommissionsPaye = commissionsParAgent.reduce((sum, c) => sum + c.paye, 0);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-900">
            <strong>Limite connue :</strong> <code>factures</code> n&apos;a pas de lien direct vers <code>payments</code> —
            le rapprochement facture ↔ paiement encaissé n&apos;est pas mesurable ici. Ce qui suit compare uniquement ce
            que le schéma permet de vérifier mécaniquement : factures ↔ échéanciers (lien réel), sessions de caisse, et
            commissions.
          </p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">Factures payées vs échéanciers</h2>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `Rapprochement_factures_${new Date().toISOString().split("T")[0]}.csv`,
                ["Reference", "Client", "Montant facture", "Total echeance", "Total paye", "Ecart"],
                facturesPayeesAvecEcheancier.map((f) => [
                  f.reference || "",
                  f.client,
                  String(f.montant),
                  String(f.echeance_total),
                  String(f.echeance_payee),
                  String(f.montant - f.echeance_payee),
                ])
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {anomalies.length === 0 ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Aucune anomalie : chaque facture payée avec échéancier a un total échéancé payé égal à son montant.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {anomalies.length} facture(s) marquée(s) payée(s) dont l&apos;échéancier n&apos;est pas entièrement soldé
            </div>
            {anomalies.map((f, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-nexus-blue-700">{f.reference || "—"}</span>
                  <span className="text-sm text-slate-600">{f.client}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Montant facture</p>
                    <p className="font-semibold text-nexus-blue-950">{formatMoney(f.montant)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Échéances payées</p>
                    <p className="font-semibold text-nexus-blue-950">{formatMoney(f.echeance_payee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Écart</p>
                    <p className="font-semibold text-amber-600">{formatMoney(f.montant - f.echeance_payee)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {facturesPayeesAvecEcheancier.length === 0 && anomalies.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">
            Pas encore mesurable : aucune facture payée ne porte d&apos;échéancier à ce jour.
          </p>
        )}

        {facturesPayeesAvecEcheancier.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="mt-3 text-xs font-semibold text-nexus-orange-600 hover:underline"
          >
            {showAll ? "Masquer" : "Voir"} les {facturesPayeesAvecEcheancier.length} facture(s) avec échéancier
          </button>
        )}
        {showAll && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Référence</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Client</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-600">Montant</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-600">Échéancé payé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facturesPayeesAvecEcheancier.map((f, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 font-mono text-xs">{f.reference || "—"}</td>
                    <td className="px-4 py-2">{f.client}</td>
                    <td className="px-4 py-2 text-right">{formatMoney(f.montant)}</td>
                    <td className="px-4 py-2 text-right">{formatMoney(f.echeance_payee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-nexus-blue-950">Écarts de caisse</h2>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total des écarts absolus</p>
          <p className="mt-1 font-display text-xl font-bold text-nexus-blue-950">{formatMoney(totalEcartCaisse)}</p>
        </div>
        {sessionsAvecEcart.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucune session clôturée avec écart à ce jour.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {sessionsAvecEcart.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <span>
                  {s.agent} · clôturée le {new Date(s.closed_at).toLocaleDateString("fr-FR")}
                </span>
                <span className={cn("font-semibold", s.discrepancy < 0 ? "text-red-600" : "text-amber-600")}>
                  {formatMoney(s.discrepancy)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-nexus-blue-950">Commissions dues vs payées, par agent</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total dû (calculée + validée)</p>
            <p className="mt-1 font-display text-xl font-bold text-nexus-blue-950">{formatMoney(totalCommissionsDu)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total payé</p>
            <p className="mt-1 font-display text-xl font-bold text-nexus-blue-950">{formatMoney(totalCommissionsPaye)}</p>
          </div>
        </div>
        {commissionsParAgent.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucune commission enregistrée à ce jour.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Agent</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-600">Dû</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-600">Payé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissionsParAgent.map((c, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{c.agent}</td>
                    <td className="px-4 py-2 text-right">{formatMoney(c.du)}</td>
                    <td className="px-4 py-2 text-right">{formatMoney(c.paye)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
