import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { AccueilClientsSearch } from "@/components/accueil/AccueilClientsSearch";

export const metadata = {
  title: "Clients | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

// Espace Accueil & caisse — recherche client (§3.2 : la recherche précède
// toujours la création). Distinct du module Clients unique
// (/dashboard/clients) : ici, vue de réception restreinte, pas la fiche 360°.
export default async function AccueilClientsPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Clients" },
      ]}
      title="Clients"
      description="Rechercher un client, ouvrir sa fiche de réception ou créer une fiche."
    >
      <AccueilClientsSearch />
    </AccueilShell>
  );
}
