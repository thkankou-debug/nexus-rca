import { Globe2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PaysDestinationsManager, type PaysDestinationItem } from "@/components/dashboard/PaysDestinationsManager";

export const metadata = {
  title: "Pays & destinations | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function PaysDestinationsPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pays_destinations")
    .select("id, nom, code_iso, continent, status, ordre_affichage")
    .order("continent", { ascending: true, nullsFirst: false })
    .order("ordre_affichage", { ascending: true });

  if (error) console.error("[PAYS_DESTINATIONS_PAGE] chargement:", error.message);
  const pays = (data as PaysDestinationItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Globe2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Pays & destinations</h1>
          <p className="mt-1 text-slate-600">Destinations proposées, affichées sur le site public.</p>
        </div>
      </div>

      <PaysDestinationsManager initialPays={pays} />
    </DashboardShell>
  );
}
