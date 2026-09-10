import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";

// L7 : "Mes RH" (libre-service agent) rhabillé dans le même shell que le RH
// management — pas de fusion des deux (besoins réellement différents,
// "pas réécrit"). Les 9 pages sont toutes réservées agent.
export default async function MesRhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile(["agent"]);
  const effectiveNav = await getEffectiveNav();

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mes RH" }]}
      showHeader={false}
    >
      {children}
    </ModuleAdminShell>
  );
}
