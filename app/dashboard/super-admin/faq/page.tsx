import { HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { FaqManager, type FaqItem } from "@/components/dashboard/FaqManager";

export const metadata = {
  title: "FAQ | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("id, question, reponse, categorie, ordre_affichage, status")
    .order("categorie", { ascending: true, nullsFirst: false })
    .order("ordre_affichage", { ascending: true });

  if (error) console.error("[FAQ_PAGE] chargement:", error.message);
  const faqs = (data as FaqItem[]) || [];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin" label="Retour au tableau de bord" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white shadow-lg">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">FAQ</h1>
          <p className="mt-1 text-slate-600">Questions fréquentes affichées sur le site public.</p>
        </div>
      </div>

      <FaqManager initialFaqs={faqs} />
    </DashboardShell>
  );
}
