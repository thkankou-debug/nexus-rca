import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { FinancementAccueilForm } from "@/components/accueil/FinancementAccueilForm";
import type { AccueilClient } from "@/components/accueil/NewClientModal";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { isFinancementService } from "@/lib/accueil-forms";

export const metadata = {
  title: "Financement | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function FinancementAccueilPage({
  searchParams,
}: {
  searchParams?: { client?: string };
}) {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  const [servicesRes, clientRes] = await Promise.all([
    admin.from("services").select("id, nom").eq("status", "actif"),
    searchParams?.client
      ? admin
          .from("clients")
          .select(
            "id, reference, type, nom, prenom, raison_sociale, email, telephone, adresse, ville, pays"
          )
          .eq("id", searchParams.client)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const services = (servicesRes.data || []) as { id: string; nom: string }[];
  const finance =
    services.find((s) => isFinancementService(s.nom)) || {
      id: "",
      nom: "Incubateur & Financement en partenariat",
    };

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Financement" },
      ]}
      title="Financement & Incubateur"
      description="Identité du porteur, projet, budget, incubation. L'immatriculation n'est pas bloquante en création."
    >
      <FinancementAccueilForm
        initialClient={(clientRes.data as AccueilClient | null) || null}
        serviceNom={finance.nom}
        serviceId={finance.id || null}
      />
    </AccueilShell>
  );
}
