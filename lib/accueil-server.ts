// ============================================================================
// LIB SERVER — Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md
// Partie 3). Lectures via le client service-role APRÈS garde requireProfile
// dans la page appelante : le rôle accueil_caisse n'est pas couvert par
// is_staff() (volontairement non élargi — voir migration 080 et docs/
// DETTE.md), la RLS lui refuserait toute lecture directe. Même patron que
// les routes /api/caisse-sessions.
// ============================================================================

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export function getAccueilAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface SessionSnapshot {
  id: string;
  status: "ouverte" | "a_cloturer";
  opened_at: string;
  opening_balance: number;
  /** Ventes rapides en espèces depuis l'ouverture. */
  especes_encaissees: number;
  /** Ventes rapides hors espèces depuis l'ouverture (jamais dans le tiroir). */
  paiements_electroniques: number;
  /** opening_balance + especes_encaissees. */
  especes_theoriques: number;
}

/**
 * Session de caisse active (ouverte ou soumise) de l'utilisateur, avec le
 * contrôle de session du poste de réception : fonds d'ouverture, espèces
 * encaissées, paiements électroniques (suivis séparément — maquette ACCEUIL),
 * espèces théoriques. Même calcul que lib/caisse-server.ts, une seule source
 * de vérité pour les espèces.
 */
export async function getOwnSessionSnapshot(userId: string): Promise<SessionSnapshot | null> {
  const admin = getAccueilAdminClient();

  const { data: session } = await admin
    .from("caisse_sessions")
    .select("id, status, opened_at, opening_balance")
    .eq("agent_id", userId)
    .in("status", ["ouverte", "a_cloturer"])
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) return null;

  const row = session as {
    id: string;
    status: "ouverte" | "a_cloturer";
    opened_at: string;
    opening_balance: number;
  };

  const { data: ventes } = await admin
    .from("quick_sales")
    .select("montant_total, mode_paiement, nature")
    .eq("agent_id", userId)
    .gte("created_at", row.opened_at);

  // Même convention que lib/caisse-server.ts : cautions dans le tiroir,
  // remboursements de caution soustraits (montants stockés positifs).
  let especes = 0;
  let electroniques = 0;
  for (const v of (ventes || []) as { montant_total: number; mode_paiement: string; nature?: string | null }[]) {
    const signed = v.nature === "caution_remboursement" ? -Number(v.montant_total) : Number(v.montant_total);
    if (v.mode_paiement === "especes") especes += signed;
    else electroniques += signed;
  }

  return {
    id: row.id,
    status: row.status,
    opened_at: row.opened_at,
    opening_balance: Number(row.opening_balance),
    especes_encaissees: especes,
    paiements_electroniques: electroniques,
    especes_theoriques: Number(row.opening_balance) + especes,
  };
}

/** Téléphone normalisé pour la détection de similitude (§3.2 : première barrière contre les doublons). */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^236/, "");
}
