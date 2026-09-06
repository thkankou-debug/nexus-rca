import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { BureauxManager, type BureauItem } from "@/components/dashboard/BureauxManager";

export const metadata = {
  title: "Bureaux | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function BureauxPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bureaux")
    .select("id, nom, adresse, ville, pays, telephone, email, horaires, status")
    .order("created_at", { ascending: true });

  if (error) console.error("[BUREAUX_PAGE] chargement:", error.message);
  const bureaux = (data as BureauItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Bureaux</h1>
          <p className="mt-1 text-slate-600">Adresses, contacts et horaires affichés sur le site public.</p>
        </div>
      </div>

      <BureauxManager initialBureaux={bureaux} />
    </DashboardShell>
  );
}
