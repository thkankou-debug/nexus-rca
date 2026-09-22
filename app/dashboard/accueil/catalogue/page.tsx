import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { CatalogueTarifs, type CatalogueRow } from "@/components/accueil/CatalogueTarifs";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const metadata = {
  title: "Catalogue tarifs | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function CatalogueAccueilPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();
  const { data } = await admin
    .from("services")
    .select("id, nom, categorie, slug, tarif_type, tarif_montant, status, visibilite_publique")
    .eq("status", "actif")
    .order("categorie", { ascending: true })
    .order("ordre_affichage", { ascending: true })
    .order("nom", { ascending: true });

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Catalogue tarifs" },
      ]}
      title="Catalogue tarifs"
      description="Prestations d'accompagnement et de guichet. Aucun prix n'est inventé ici."
    >
      <CatalogueTarifs rows={(data || []) as CatalogueRow[]} />
    </AccueilShell>
  );
}
