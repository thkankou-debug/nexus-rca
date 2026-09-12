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
    case "super_admin":
      redirect("/dashboard/super-admin");
    case "admin":
      redirect("/dashboard/admin");
    case "agent":
      redirect("/dashboard/agent");
    case "client":
      redirect("/dashboard/client");
    // Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md §1.2) :
    // chaque métier arrive sur son poste de travail — la caissière sur le
    // Poste de réception.
    case "accueil_caisse":
      redirect("/dashboard/accueil");
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
