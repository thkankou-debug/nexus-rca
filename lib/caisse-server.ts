// ============================================================================
// LIB SERVER — Calcul du solde théorique d'une session de caisse.
// Une seule source pour /submit (caissière) et /close (DAF/admin) — même
// calcul, pas de dérive entre les deux étapes de la chaîne.
//
// Caisse ouverte (addendum 12/09/2026, G3) : convention d'espèces UNIQUE —
//   espèces théoriques = fonds d'ouverture
//     + Σ espèces (prestations, montants NETS de monnaie rendue)
//     + Σ espèces (cautions reçues — dans le tiroir, jamais une recette)
//     − Σ espèces (remboursements de caution — sortie du tiroir, stockés
//       en montant positif avec nature='caution_remboursement').
// Les règlements électroniques n'entrent jamais dans ce calcul.
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";

export function signedCashAmount(row: { montant_total: number; nature?: string | null }): number {
  const amount = Number(row.montant_total);
  return row.nature === "caution_remboursement" ? -amount : amount;
}

export async function computeExpectedBalance(
  admin: SupabaseClient,
  agentId: string,
  openedAt: string,
  openingBalance: number
): Promise<number> {
  const { data: ventes } = await admin
    .from("quick_sales")
    .select("montant_total, nature")
    .eq("agent_id", agentId)
    .eq("mode_paiement", "especes")
    .gte("created_at", openedAt);

  const totalEspeces = (ventes || []).reduce(
    (sum, v) => sum + signedCashAmount(v as { montant_total: number; nature?: string | null }),
    0
  );

  return openingBalance + totalEspeces;
}
