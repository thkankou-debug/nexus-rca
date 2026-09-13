// ============================================================================
// UTILISATEURS & HABILITATIONS — section super-admin (demande Thierry,
// 13/09/2026) : créer les comptes des membres de l'équipe Nexus RCA et
// administrer leurs accréditations (rôle, activation).
// Réservé au super_admin (§2.1 : attribution des rôles). Les comptes
// « client » ne sont pas listés — ils naissent du parcours public.
// ============================================================================

import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import {
  HabilitationsManager,
  type StaffAccount,
} from "@/components/admin/HabilitationsManager";
import { getFinanceAdminClient } from "@/lib/finance-server";

export const metadata = {
  title: "Utilisateurs & habilitations | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function UtilisateursPage() {
  const profile = await requireProfile(["super_admin"]);
  const admin = getFinanceAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id, email, prenom, nom, telephone, role, actif, is_test, created_at")
    .neq("role", "client")
    .order("actif", { ascending: false })
    .order("created_at", { ascending: true });

  const accounts = (data || []) as StaffAccount[];
  const effectiveNav = await getEffectiveNav();

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Organisation" }, { label: "Utilisateurs & habilitations" }]}
      title="Utilisateurs & habilitations"
      description="Créez les comptes de l'équipe et attribuez leur accréditation — chaque changement est tracé."
    >
      <HabilitationsManager accounts={accounts} selfId={profile.id} />
    </ModuleAdminShell>
  );
}
