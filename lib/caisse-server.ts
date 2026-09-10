// ============================================================================
// LIB SERVER — Calcul du solde théorique d'une session de caisse.
// Extrait de app/api/caisse-sessions/[id]/close/route.ts (Espace Accueil &
// Caisse, NEXUS_RCA_DASHBOARD_ADMINISTRATION.md) pour être réutilisé
// identiquement par /submit (caissière) et /close (DAF/admin) — même calcul,
// une seule source, pas de dérive entre les deux étapes de la chaîne.
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";

export async function computeExpectedBalance(
  admin: SupabaseClient,
  agentId: string,
  openedAt: string,
  openingBalance: number
): Promise<number> {
  const { data: ventes } = await admin
    .from("quick_sales")
    .select("montant_total")
    .eq("agent_id", agentId)
    .eq("mode_paiement", "especes")
    .gte("created_at", openedAt);

  const totalVentesEspeces = (ventes || []).reduce(
    (sum, v) => sum + Number((v as { montant_total: number }).montant_total),
    0
  );

  return openingBalance + totalVentesEspeces;
}
