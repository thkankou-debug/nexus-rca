import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { ContenusSiteManager, type ContenuSiteItem } from "@/components/dashboard/ContenusSiteManager";

export const metadata = {
  title: "Contenus de page | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function ContenusSitePage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contenus_site")
    .select("id, cle, section, contenu, updated_at")
    .order("section", { ascending: true })
    .order("cle", { ascending: true });

  if (error) console.error("[CONTENUS_SITE_PAGE] chargement:", error.message);
  const contenus = (data as ContenuSiteItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Contenus de page</h1>
          <p className="mt-1 text-slate-600">Textes et appels à l&apos;action du site public.</p>
        </div>
      </div>

      <ContenusSiteManager initialContenus={contenus} />
    </DashboardShell>
  );
}
