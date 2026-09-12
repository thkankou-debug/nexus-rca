import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import {
  ContenusSiteManager,
  type ContenuSiteItem,
} from "@/components/dashboard/ContenusSiteManager";

export const metadata = {
  title: "Contenus du site | Nexus RCA",
};

export const dynamic = "force-dynamic";

// §5.9 — réutilise ContenusSiteManager (P8) tel quel : les écritures
// passent par /api/contenus-site, gardée par cms.content.write
// (moderateur + admin, super_admin passe).
export default async function ModerationContenusPage() {
  const profile = await requireProfile(["moderateur", "admin", "super_admin"]);
  const supabase = createClient();

  const [{ data }, effectiveNav] = await Promise.all([
    supabase
      .from("contenus_site")
      .select("id, cle, section, contenu, updated_at")
      .order("section", { ascending: true })
      .order("cle", { ascending: true }),
    getEffectiveNav(),
  ]);

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[
        { label: "Contenus" },
        { label: "Modération", href: "/dashboard/moderation" },
        { label: "Contenus du site" },
      ]}
      title="Contenus du site"
      description="Textes des pages publiques — chaque modification est datée et tracée."
    >
      <ContenusSiteManager initialContenus={(data || []) as ContenuSiteItem[]} />
    </ModuleAdminShell>
  );
}
