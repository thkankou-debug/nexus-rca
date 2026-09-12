import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardRootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  switch (profile.role) {
    // §1.2 du document Dashboard Administration : super-admin et admin
    // arrivent sur la Vue d'ensemble (supervision), pas sur l'ancien
    // tableau de bord — qui reste accessible via « Retour à l'espace
    // classique » dans la barre latérale du nouveau shell.
    case "super_admin":
      redirect("/dashboard/vue-ensemble");
    case "admin":
      redirect("/dashboard/vue-ensemble");
    case "agent":
      redirect("/dashboard/agent");
    case "client":
      redirect("/dashboard/client");
    // Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md §1.2) :
    // chaque métier arrive sur son poste de travail — la caissière sur le
    // Poste de réception.
    case "accueil_caisse":
      // Page d'arrivée = Caisse unifiée (reprise 12/09/2026) : « Ouvrir ma
      // caisse » en priorité si aucune session, sinon les deux onglets.
      redirect("/dashboard/accueil/caisse");
    // Étape 5 (§1.2) : DAF → Trésorerie, comptable → Saisie du jour.
    case "daf":
      redirect("/dashboard/tresorerie");
    case "comptable":
      redirect("/dashboard/compta");
    // Étape 6 (§1.2) : DG → Pilotage, chef de service → Mon service.
    case "dg":
      redirect("/dashboard/pilotage");
    case "chef_service":
      redirect("/dashboard/mon-service");
    // §5.9/§5.10 : modérateur → contenus, partenaire → dossiers partagés.
    case "moderateur":
      redirect("/dashboard/moderation");
    case "partenaire":
      redirect("/dashboard/partenaire");
  }

  // dg, daf, chef_service, comptable, moderateur, partenaire : aucune section
  // dédiée pour l'instant (P2 — arrive avec A3). Pas de redirect ici :
  // rediriger vers une section gardée par rôle créerait une boucle avec le
  // middleware (voir lib/rbac.ts, requiredPermissionForPath).
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <div className="max-w-md rounded-sm border border-line bg-surface-elevated p-8 text-center">
        <h1 className="font-display text-xl font-bold text-ink">
          Espace en préparation
        </h1>
        <p className="mt-2 text-body-sm text-ink-muted">
          Aucun tableau de bord n&apos;est encore disponible pour votre rôle.
          Contactez un administrateur.
        </p>
      </div>
    </div>
  );
}
