import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { CaisseLibre, type RaccourciService } from "@/components/accueil/CaisseLibre";
import type { PosCredit } from "@/components/accueil/PosComptoir";
import { getAccueilAdminClient, getOwnSessionSnapshot } from "@/lib/accueil-server";

export const metadata = {
  title: "Encaissement libre | Nexus RCA",
};

export const dynamic = "force-dynamic";

// Page d'arrivée de la réceptionniste (maquette « page d'encaissement
// libre.png ») : poste de caisse professionnel. Les autres fonctions de
// l'espace (réception, clients/dossiers, POS catalogue, reçus, session)
// restent accessibles par la navigation — rien n'est supprimé.
export default async function EncaissementLibrePage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  const [session, raccourcisRes, catalogueRes, creditsRes] = await Promise.all([
    getOwnSessionSnapshot(profile.id),
    // Raccourcis configurables : les prestations de proximité (services
    // internes, catégorie dédiée) — gérées dans « Services et tarifs ».
    admin
      .from("services")
      .select("id, nom, tarif_type, tarif_montant")
      .eq("status", "actif")
      .eq("categorie", "Services de proximite")
      .order("nom", { ascending: true }),
    // Catalogue complet des services actifs : la désignation se CHOISIT ou se
    // SAISIT librement (caisse ouverte — jamais limitée au catalogue).
    admin
      .from("services")
      .select("id, nom, tarif_type, tarif_montant")
      .eq("status", "actif")
      .order("nom", { ascending: true }),
    admin
      .from("pos_credits")
      .select("id, client_nom, total_du, total_regle, created_at")
      .eq("status", "ouverte")
      .eq("is_test", Boolean(profile.is_test))
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[{ label: "Accueil & caisse" }, { label: "Encaissement libre" }]}
      showHeader={false}
    >
      <CaisseLibre
        session={session}
        caissiereNom={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
        raccourcis={(raccourcisRes.data || []) as RaccourciService[]}
        catalogue={(catalogueRes.data || []) as RaccourciService[]}
        credits={(creditsRes.data || []) as PosCredit[]}
      />
    </AccueilShell>
  );
}
