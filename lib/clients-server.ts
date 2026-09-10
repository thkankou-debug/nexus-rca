// ============================================================================
// LIB SERVER — Portée par rôle pour le module Clients unique (L4)
// Même patron que lib/dossiers-server.ts (L3) : le RLS de `clients` ne filtre
// pas par own/all (is_staff() donne un accès total), le filtre est donc
// appliqué ici. is_test du profil consultant détermine le filtre is_test des
// lignes lues, même règle qu'en L3.
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types/client-types";

export async function getAllClientsForRole(profile: {
  id: string;
  role: string;
  is_test?: boolean;
}): Promise<Client[]> {
  const supabase = createClient();
  const includeTestRows = Boolean(profile.is_test);

  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (!includeTestRows) query = query.eq("is_test", false);

  if (profile.role === "agent") {
    query = query.eq("created_by", profile.id);
  } else if (profile.role !== "super_admin" && profile.role !== "admin") {
    // dg, daf, chef_service, comptable, moderateur, partenaire : aucune
    // permission client.read.* seedée (P2) — liste vide plutôt qu'un accès
    // non écrit nulle part.
    return [];
  }

  const { data } = await query;
  return (data || []) as Client[];
}
