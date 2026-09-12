import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { ImprimantePanel } from "@/components/accueil/ImprimantePanel";

export const metadata = {
  title: "Imprimante | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

// Imprimante thermique 80 mm (instruction §9/§10) : état RÉEL du poste,
// test d'impression (document marqué TEST, aucune transaction), et
// prérequis matériels à fournir pour activer l'impression silencieuse.
// Aucun composant n'est installé sur le poste sans présentation préalable
// des changements (§9).
export default async function ImprimantePage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil/encaissement" },
        { label: "Imprimante" },
      ]}
      title="Imprimante thermique · 80 mm"
      description="État du poste, test d'impression et prérequis pour l'impression silencieuse."
    >
      <ImprimantePanel
        caissiereNom={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
      />
    </AccueilShell>
  );
}
