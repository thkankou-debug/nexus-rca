import { Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ServicesManager, type ServiceItem } from "@/components/dashboard/ServicesManager";

export const metadata = {
  title: "Services et tarifs | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, slug, nom, categorie, description, tarif_type, tarif_montant, devise, delai_indicatif, status, ordre_affichage")
    .order("categorie", { ascending: true })
    .order("ordre_affichage", { ascending: true });

  if (error) console.error("[SERVICES_PAGE] chargement:", error.message);
  const services = (data as ServiceItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Services et tarifs</h1>
          <p className="mt-1 text-slate-600">Catégorie, description, tarif et statut de chaque service — sans toucher au code.</p>
        </div>
      </div>

      <ServicesManager initialServices={services} />
    </DashboardShell>
  );
}
