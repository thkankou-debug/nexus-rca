import { Handshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PartenairesManager, type PartenaireItem } from "@/components/dashboard/PartenairesManager";

export const metadata = {
  title: "Partenaires | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("partenaires")
    .select("id, nom, logo_url, site_url, description, is_verified, is_published, ordre_affichage, created_at")
    .order("ordre_affichage", { ascending: true });

  if (error) console.error("[PARTENAIRES_PAGE] chargement:", error.message);
  const partenaires = (data as PartenaireItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Handshake className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Partenaires</h1>
          <p className="mt-1 text-slate-600">Vérification obligatoire avant publication sur le site public.</p>
        </div>
      </div>

      <PartenairesManager initialPartenaires={partenaires} />
    </DashboardShell>
  );
}
