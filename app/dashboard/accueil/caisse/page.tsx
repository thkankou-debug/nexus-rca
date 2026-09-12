import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { CaisseWorkspace } from "@/components/accueil/CaisseWorkspace";
import type { RaccourciService } from "@/components/accueil/CaisseLibre";
import type { PosService, PosAgent, PosCredit } from "@/components/accueil/PosComptoir";
import { getAccueilAdminClient, getOwnSessionSnapshot } from "@/lib/accueil-server";

export const metadata = {
  title: "Caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

// CAISSE — page d'arrivée de la réceptionniste (cahier « reprise Accueil &
// caisse » 12/09/2026). UNE caisse, UNE session, deux modes de saisie en
// onglets (Encaissement rapide / Vente catalogue). Ouverture de session
// obligatoire avant tout encaissement : le gate est rendu ici, la garantie
// ultime est le trigger 091 côté base.
export default async function CaissePage({
  searchParams,
}: {
  searchParams?: { onglet?: string };
}) {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();
  const isTest = Boolean(profile.is_test);

  const [session, servicesRes, agentsRes, creditsRes] = await Promise.all([
    getOwnSessionSnapshot(profile.id),
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
      .eq("is_test", isTest)
      .order("nom", { ascending: true }),
    admin
      .from("pos_credits")
      .select("id, client_nom, total_du, total_regle, created_at")
      .eq("status", "ouverte")
      .eq("is_test", isTest)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const services = (servicesRes.data || []) as PosService[];
  // Raccourcis = prestations de proximité ; catalogue = tous les services
  // actifs (la désignation se choisit OU se saisit — caisse ouverte).
  const catalogue = services.map((s) => ({
    id: s.id,
    nom: s.nom,
    tarif_type: s.tarif_type,
    tarif_montant: s.tarif_montant,
  })) as RaccourciService[];
  const raccourcis = services
    .filter((s) => s.categorie === "Services de proximite")
    .map((s) => ({
      id: s.id,
      nom: s.nom,
      tarif_type: s.tarif_type,
      tarif_montant: s.tarif_montant,
    })) as RaccourciService[];

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[{ label: "Accueil & caisse" }, { label: "Caisse" }]}
      showHeader={false}
    >
      <CaisseWorkspace
        session={session}
        caissiereNom={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
        raccourcis={raccourcis}
        catalogue={catalogue}
        credits={(creditsRes.data || []) as PosCredit[]}
        services={services}
        agents={(agentsRes.data || []) as PosAgent[]}
        initialTab={searchParams?.onglet === "catalogue" ? "catalogue" : "rapide"}
      />
    </AccueilShell>
  );
}
