import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { RecusList, type RecuSale } from "@/components/accueil/RecusList";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const metadata = {
  title: "Tickets & reçus | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

// CAI-06/CAI-07 : les encaissements du poste restent retrouvables et
// réimprimables (duplicata identifiable) après une interruption ou un échec
// d'impression. La caissière ne voit que ses propres encaissements ;
// admin/super_admin supervisent les leurs (chaque poste ses tickets).
export default async function RecusPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  const { data: sales } = await admin
    .from("quick_sales")
    .select(
      "id, reference, description, quantite, prix_unitaire, montant_total, devise, mode_paiement, client_nom, date_paiement, ticket_key, ligne_index, demande_id, nature, caution_ref"
    )
    .eq("agent_id", profile.id)
    .order("date_paiement", { ascending: false })
    .limit(200);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Tickets & reçus" },
      ]}
      title="Tickets & reçus"
      description="Chaque encaissement reste retrouvable — la réimpression émet un duplicata, jamais un nouveau paiement."
    >
      <RecusList
        sales={(sales || []) as RecuSale[]}
        caissiereNom={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
      />
    </AccueilShell>
  );
}
