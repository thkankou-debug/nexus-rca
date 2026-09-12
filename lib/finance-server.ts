// ============================================================================
// LIB SERVER — Espaces DAF et Comptable (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md
// §2.4/§2.5, chaîne §4.3). Lectures via client service-role APRÈS garde
// requireProfile dans la page appelante — même patron que lib/accueil-server
// (les policies RLS de payments/expenses ne couvrent pas daf/comptable de
// façon uniforme ; la garantie applicative est requireProfile +
// assertPermission sur chaque action).
//
// Les agrégats vivent dans les pages ; ce fichier ne porte que la fabrique
// du client et l'état de chaîne partagé entre les écrans et les routes.
// ============================================================================

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export function getFinanceAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** État d'un paiement dans la chaîne §4.3, dérivé des colonnes réelles. */
export type ChainState = "declare" | "a_valider" | "encaisse" | "hors_chaine";

export function paymentChainState(p: {
  status: string | null;
  reconciled_at: string | null;
  metadata?: { legacy?: boolean } | null;
}): ChainState {
  if (p.metadata?.legacy) return "hors_chaine";
  if (p.status === "validated") return "encaisse";
  if (p.status === "refunded" || p.status === "voided") return "hors_chaine";
  if (p.reconciled_at) return "a_valider";
  return "declare";
}

export const CHAIN_LABELS: Record<ChainState, string> = {
  declare: "Déclaré",
  a_valider: "À valider",
  encaisse: "Encaissé",
  hors_chaine: "Hors chaîne",
};
