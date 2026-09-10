// ============================================================================
// LIB SERVER — Module Rendez-vous unique (L5-1)
//
// Contrairement à demandes/clients, le RLS de `appointments` scope déjà
// correctement par rôle ("Agents see assigned appointments" : agent_id =
// auth.uid() OR admin/super_admin) — aucun filtre own/all à reproduire ici.
// Seul is_test reste à gérer (même règle qu'en L2/L3/L4) : un compte réel ne
// voit jamais de donnée de test, un compte TEST_ voit les siennes.
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import type { Appointment } from "@/types";

export async function getAllRdvForRole(profile: {
  is_test?: boolean;
}): Promise<Appointment[]> {
  const supabase = createClient();
  const includeTestRows = Boolean(profile.is_test);

  let query = supabase
    .from("appointments")
    .select("*")
    .order("rdv_date", { ascending: true })
    .order("rdv_heure", { ascending: true });
  if (!includeTestRows) query = query.eq("is_test", false);

  const { data } = await query;
  return (data || []) as Appointment[];
}

export async function getAgentsForAssign(): Promise<
  Array<{ id: string; prenom: string | null; nom: string | null }>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, prenom, nom")
    .eq("role", "agent")
    .eq("actif", true)
    .order("nom", { ascending: true });
  return (data || []) as Array<{ id: string; prenom: string | null; nom: string | null }>;
}
