import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { AgendaEquipe } from "@/components/accueil/AgendaEquipe";

export const metadata = {
  title: "Agenda de l'équipe | Nexus RCA",
};

export const dynamic = "force-dynamic";

// AGENDA DE L'ÉQUIPE (demande Thierry 12/09/2026, maquette « espace acceui
// et caisse.png ») : la réceptionniste consulte les disponibilités de toute
// l'équipe, crée/attribue/reprogramme les rendez-vous ; conflits signalés,
// collaborateurs notifiés, détails confidentiels non exposés.
export default async function AgendaPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[{ label: "Accueil & caisse" }, { label: "Agenda de l'équipe" }]}
      title="Agenda de l'équipe"
      description="Disponibilités et rendez-vous de toute l'équipe — attribution et reprogrammation."
    >
      <AgendaEquipe />
    </AccueilShell>
  );
}
