import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";

// Rhabillage de l'espace agent (GO Thierry, 12/09/2026) — même patron que
// L7 (RH) : « rhabillé dans le shell unique, pas réécrit ». Aucune page
// agent n'est réécrite ni fusionnée : ce layout porte ModuleAdminShell une
// seule fois, les 21 pages perdent leur <DashboardShell> (fragments).
// admin/super_admin conservent leur accès de supervision (préfixe RBAC
// inchangé). Le sous-arbre mes-rh/ avait déjà son shell (L7) : son layout
// devient un simple garde de rôle pour éviter le double shell.
export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const effectiveNav = await getEffectiveNav();

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Espace agent" }]}
      showHeader={false}
    >
      {children}
    </ModuleAdminShell>
  );
}
