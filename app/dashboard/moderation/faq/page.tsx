import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { FaqManager, type FaqItem } from "@/components/dashboard/FaqManager";

export const metadata = {
  title: "FAQ | Nexus RCA",
};

export const dynamic = "force-dynamic";

// §5.9 — réutilise FaqManager (P8) : écritures via /api/faq, gardée par
// cms.faq.write (moderateur + admin, super_admin passe).
export default async function ModerationFaqPage() {
  const profile = await requireProfile(["moderateur", "admin", "super_admin"]);
  const supabase = createClient();

  const [{ data }, effectiveNav] = await Promise.all([
    supabase
      .from("faq")
      .select("id, question, reponse, categorie, ordre_affichage, status")
      .order("categorie", { ascending: true, nullsFirst: false })
      .order("ordre_affichage", { ascending: true }),
    getEffectiveNav(),
  ]);

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[
        { label: "Contenus" },
        { label: "Modération", href: "/dashboard/moderation" },
        { label: "FAQ" },
      ]}
      title="FAQ"
      description="Questions fréquentes affichées sur le site public."
    >
      <FaqManager initialFaqs={(data || []) as FaqItem[]} />
    </ModuleAdminShell>
  );
}
