import { Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { CategoriesComptaManager, type CategorieComptaItem } from "@/components/dashboard/CategoriesComptaManager";

export const metadata = {
  title: "Catégories comptables | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function CategoriesComptaPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories_compta")
    .select("id, code, label, type, status, created_at")
    .order("type", { ascending: true })
    .order("code", { ascending: true });

  if (error) console.error("[CATEGORIES_COMPTA_PAGE] chargement:", error.message);
  const categories = (data as CategorieComptaItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">Catégories comptables</h1>
          <p className="mt-1 text-slate-600">Classement des revenus et dépenses pour les rapports financiers.</p>
        </div>
      </div>

      <CategoriesComptaManager initialCategories={categories} />
    </DashboardShell>
  );
}
