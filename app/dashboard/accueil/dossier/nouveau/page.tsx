import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { NouveauDossierForm } from "@/components/accueil/NouveauDossierForm";
import type { AccueilClient } from "@/components/accueil/NewClientModal";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const metadata = {
  title: "Nouveau dossier | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function NouveauDossierPage({
  searchParams,
}: {
  searchParams?: { client?: string };
}) {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();
  const isTest = Boolean(profile.is_test);

  const [servicesRes, agentsRes, clientRes] = await Promise.all([
    admin
      .from("services")
      .select("id, nom, categorie, slug")
      .eq("status", "actif")
      .order("ordre_affichage", { ascending: true })
      .order("nom", { ascending: true }),
    admin
      .from("profiles")
      .select("id, nom, prenom")
      .eq("role", "agent")
      .eq("actif", true)
      .eq("is_test", isTest)
      .order("nom", { ascending: true }),
    searchParams?.client
      ? admin
          .from("clients")
          .select(
            "id, reference, type, nom, prenom, raison_sociale, email, telephone, adresse, ville, pays, numero_identification"
          )
          .eq("id", searchParams.client)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Nouveau dossier" },
      ]}
      title="Ouvrir un nouveau dossier"
      description="Client existant ou nouveau, service, objet, pièces. Référence unique à l'enregistrement."
    >
      <NouveauDossierForm
        services={(servicesRes.data || []) as { id: string; nom: string; categorie: string; slug: string }[]}
        agents={(agentsRes.data || []) as { id: string; nom: string; prenom: string | null }[]}
        initialClient={(clientRes.data as AccueilClient | null) || null}
      />
    </AccueilShell>
  );
}
