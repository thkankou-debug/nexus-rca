import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { AccueilDevisWorkspace, type AccueilDevisItem } from "@/components/accueil/AccueilDevisWorkspace";
import type { AccueilClient } from "@/components/accueil/NewClientModal";
import type { RaccourciService } from "@/components/accueil/CaisseLibre";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const metadata = {
  title: "Devis | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function AccueilDevisPage({
  searchParams,
}: {
  searchParams?: { client?: string; demande?: string };
}) {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  const [devisRes, servicesRes, clientRes] = await Promise.all([
    admin
      .from("devis")
      .select(
        "id, reference, status, amount, currency, valid_until, created_at, demande_id, demandes(reference, nom_complet, service)"
      )
      .order("created_at", { ascending: false })
      .limit(80),
    admin
      .from("services")
      .select("id, nom, tarif_type, tarif_montant")
      .eq("status", "actif")
      .order("nom", { ascending: true }),
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

  const devis = (devisRes.data || []) as unknown as AccueilDevisItem[];

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[{ label: "Accueil & caisse", href: "/dashboard/accueil" }, { label: "Devis" }]}
      title="Devis"
      description="Devis lié à un dossier. Accepté → facture sans re-saisie. La facture n'est pas un paiement."
    >
      <AccueilDevisWorkspace
        initialDevis={devis}
        initialClient={(clientRes.data as AccueilClient | null) || null}
        initialDemandeId={searchParams?.demande || null}
        catalogue={(servicesRes.data || []) as RaccourciService[]}
      />
    </AccueilShell>
  );
}
