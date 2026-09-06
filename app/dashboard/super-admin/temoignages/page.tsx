import { MessageSquareQuote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { TemoignagesManager, type TemoignageItem } from "@/components/dashboard/TemoignagesManager";

export const metadata = {
  title: "Témoignages | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function TemoignagesPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("temoignages")
    .select("id, auteur_nom, auteur_role, contenu, note, source, is_verified, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) console.error("[TEMOIGNAGES_PAGE] chargement:", error.message);
  const temoignages = (data as TemoignageItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <MessageSquareQuote className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Témoignages</h1>
          <p className="mt-1 text-slate-600">Vérification obligatoire avant publication sur le site public.</p>
        </div>
      </div>

      <TemoignagesManager initialTemoignages={temoignages} />
    </DashboardShell>
  );
}
