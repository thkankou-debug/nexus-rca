import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { PosComptoir, type PosService, type PosAgent } from "@/components/accueil/PosComptoir";
import { getAccueilAdminClient, getOwnSessionSnapshot } from "@/lib/accueil-server";

export const metadata = {
  title: "Comptoir POS | Nexus RCA",
};

export const dynamic = "force-dynamic";

// Espace Accueil & Caisse (maquette POS ECRAN 1). Lectures via service-role
// après garde requireProfile : accueil_caisse n'est pas couvert par
// is_staff(), voir lib/accueil-server.ts. admin/super_admin y accèdent pour
// supervision.
export default async function ComptoirPosPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  const [{ data: services }, { data: agents }, session] = await Promise.all([
    admin
      .from("services")
      .select("id, slug, nom, categorie, tarif_type, tarif_montant")
      .eq("status", "actif")
      .order("ordre_affichage", { ascending: true })
      .order("nom", { ascending: true }),
    admin
      .from("profiles")
      .select("id, nom, prenom")
      .eq("role", "agent")
      .eq("actif", true)
      .eq("is_test", Boolean(profile.is_test))
      .order("nom", { ascending: true }),
    getOwnSessionSnapshot(profile.id),
  ]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Comptoir POS" },
      ]}
      title="Comptoir POS"
      description="Client, prestations, dossier, paiement — dans cet ordre."
    >
      <PosComptoir
        services={(services || []) as PosService[]}
        agents={(agents || []) as PosAgent[]}
        session={session}
        caissiereNom={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
      />
    </AccueilShell>
  );
}
