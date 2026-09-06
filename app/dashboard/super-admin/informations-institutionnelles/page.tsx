import { Landmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { AgencySettingsManager, type AgencySettingItem } from "@/components/dashboard/AgencySettingsManager";

export const metadata = {
  title: "Informations institutionnelles | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function InformationsInstitutionnellesPage() {
  // Reserve super_admin uniquement : la RLS "Super admin manages
  // agency_settings" (migration 046) ne permet deja l'ecriture qu'a ce
  // role, meme admin ne peut que lire.
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("agency_settings")
    .select("id, cle, valeur, is_verified, is_published, updated_at")
    .order("cle", { ascending: true });

  if (error) console.error("[AGENCY_SETTINGS_PAGE] chargement:", error.message);
  const settings = (data as AgencySettingItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Landmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Informations institutionnelles</h1>
          <p className="mt-1 text-slate-600">
            Dénomination, RCCM, mentions légales... Vérification obligatoire avant publication sur le site public.
          </p>
        </div>
      </div>

      <AgencySettingsManager initialSettings={settings} />
    </DashboardShell>
  );
}
