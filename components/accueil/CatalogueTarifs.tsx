"use client";

import { tarifLabel } from "@/lib/accueil-forms";

export interface CatalogueRow {
  id: string;
  nom: string;
  categorie: string;
  slug: string;
  tarif_type: string | null;
  tarif_montant: number | null;
  status: string;
  visibilite_publique?: boolean | null;
}

export function CatalogueTarifs({ rows }: { rows: CatalogueRow[] }) {
  const groups = Array.from(new Set(rows.map((r) => r.categorie || "Autre")));
  return (
    <div className="space-y-6">
      <p className="text-body-sm text-ink-muted">
        Catalogue issu de la table services. Les montants n&rsquo;apparaissent que s&rsquo;ils sont
        validés. « Sur devis » = saisie au poste, jamais un prix inventé. Les tarifs se configurent
        dans Services et tarifs (direction).
      </p>
      {groups.map((g) => (
        <section key={g} className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">{g}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-3">Désignation</th>
                  <th className="py-2 pr-3">Unité / type</th>
                  <th className="py-2 pr-3">Tarif</th>
                  <th className="py-2">Disponibilité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows
                  .filter((r) => (r.categorie || "Autre") === g)
                  .map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 text-body-sm font-medium text-ink">{r.nom}</td>
                      <td className="py-2.5 pr-3 text-body-sm text-ink-muted">
                        {r.tarif_type === "fixe" ? "forfait" : "saisie au poste"}
                      </td>
                      <td className="py-2.5 pr-3 text-body-sm text-ink">
                        {tarifLabel(r.tarif_type, r.tarif_montant)}
                      </td>
                      <td className="py-2.5 text-body-sm text-ink-muted">
                        {r.status === "actif" ? "Disponible" : r.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <a
        href="/dashboard/accueil/caisse?onglet=catalogue"
        className="inline-flex rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
      >
        Vendre depuis la caisse
      </a>
    </div>
  );
}
