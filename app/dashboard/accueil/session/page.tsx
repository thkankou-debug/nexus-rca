import { requireProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import {
  CaisseSessionsManager,
  type CaisseSessionListItem,
} from "@/components/dashboard/CaisseSessionsManager";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const metadata = {
  title: "Ma journée de caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

// "Ma journée de caisse" (maquette POS ECRAN 2) dans l'espace Accueil &
// caisse. Réutilise CaisseSessionsManager tel quel (ouverture, journal des
// mouvements, rapprochement par coupures, chaîne soumission → validation) —
// même composant que /dashboard/{agent,super-admin}/caisse-sessions, pas une
// troisième implémentation. La caissière ne voit que ses propres sessions ;
// elle soumet, elle ne clôture pas (canClose réservé à caisse.close).
export default async function AccueilSessionPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  let query = admin
    .from("caisse_sessions")
    .select(
      "id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes, created_at, profiles(nom, prenom)"
    )
    .order("opened_at", { ascending: false });
  if (profile.role === "accueil_caisse") {
    query = query.eq("agent_id", profile.id);
  }
  const { data: sessions } = await query;

  const canClose = profile.role === "accueil_caisse" ? false : await hasPermission("caisse.close");

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Session de caisse" },
      ]}
      title="Ma journée de caisse"
      description="Ouvrir, contrôler les mouvements et préparer la clôture."
    >
      <CaisseSessionsManager
        initialSessions={(sessions || []) as unknown as CaisseSessionListItem[]}
        currentUserId={profile.id}
        canClose={canClose}
      />
    </AccueilShell>
  );
}
