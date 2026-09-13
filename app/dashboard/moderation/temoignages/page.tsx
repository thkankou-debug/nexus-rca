import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import {
  TemoignagesManager,
  type TemoignageItem,
} from "@/components/dashboard/TemoignagesManager";

export const metadata = {
  title: "Témoignages | Nexus RCA",
};

export const dynamic = "force-dynamic";

// §5.9 — réutilise TemoignagesManager (P8) : écritures via /api/temoignages
// (cms.content.write). Un témoignage non vérifié/publié n'apparaît jamais
// sur le site (policy P8) — aucun faux avis (§5.9).
export default async function ModerationTemoignagesPage() {
  const profile = await requireProfile(["moderateur", "admin", "super_admin"]);
  const supabase = createClient();

  const [{ data }, effectiveNav] = await Promise.all([
    supabase
      .from("temoignages")
      .select("id, auteur_nom, auteur_role, contenu, note, source, is_verified, is_published, created_at")
      .order("created_at", { ascending: false }),
    getEffectiveNav(),
  ]);

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[
        { label: "Contenus" },
        { label: "Modération", href: "/dashboard/moderation" },
        { label: "Témoignages" },
      ]}
      title="Témoignages"
      description="Vérifier puis publier — seuls les témoignages vérifiés et publiés sont visibles du public."
    >
      <TemoignagesManager initialTemoignages={(data || []) as TemoignageItem[]} />
    </ModuleAdminShell>
  );
}
