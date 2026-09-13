import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { FacturesManager, type FactureRow } from "@/components/accueil/FacturesManager";
import type { RaccourciService } from "@/components/accueil/CaisseLibre";
import { getAccueilAdminClient, getOwnSessionSnapshot } from "@/lib/accueil-server";
import { FACTURE_CONDITIONS_DEFAUT } from "@/lib/facture-config";

export const metadata = {
  title: "Factures | Nexus RCA",
};

export const dynamic = "force-dynamic";

// FACTURES — Espace Accueil & caisse (cahier §8-§9, 12/09/2026). La
// réceptionniste crée et émet les factures courantes ; les règlements
// passent par la caisse (session ouverte) et produisent leurs reçus ; les
// corrections passent par un avoir tracé.
export default async function FacturesPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();
  const isTest = Boolean(profile.is_test);

  const [session, facturesRes, catalogueRes] = await Promise.all([
    getOwnSessionSnapshot(profile.id),
    admin
      .from("invoices")
      .select(
        "id, reference, type, parent_id, motif, client_nom, client_coordonnees, lignes, total, total_regle, echeance, conditions, status, emitted_at, created_at"
      )
      .eq("is_test", isTest)
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("services")
      .select("id, nom, tarif_type, tarif_montant")
      .eq("status", "actif")
      .order("nom", { ascending: true }),
  ]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[{ label: "Accueil & caisse" }, { label: "Factures" }]}
      title="Factures"
      description="La facture décrit le dû ; le reçu atteste le paiement."
    >
      <FacturesManager
        initialFactures={(facturesRes.data || []) as FactureRow[]}
        catalogue={(catalogueRes.data || []) as RaccourciService[]}
        conditionsDefaut={FACTURE_CONDITIONS_DEFAUT}
        caissiereNom={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
        sessionOuverte={session?.status === "ouverte"}
      />
    </AccueilShell>
  );
}
