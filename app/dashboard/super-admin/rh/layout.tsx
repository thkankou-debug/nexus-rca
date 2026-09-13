import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";

// L7 : RH "rhabillé dans le shell unique, pas réécrit" — aucune page RH
// n'est réécrite ni fusionnée, seul le shell change (DashboardShell ->
// ModuleAdminShell, partagé avec Dossiers/Clients/Rendez-vous). Toutes les
// pages RH sont réservées super_admin (vérifié avant d'écrire : les 19
// pages utilisent déjà `requireProfile(["super_admin"])`, malgré
// `rh.user.read` seedé aussi pour admin côté role_permissions — écart de
// catalogue préexistant, non corrigé ici, pas dans le périmètre de ce lot).
export default async function RhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile(["super_admin"]);
  const effectiveNav = await getEffectiveNav();

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "RH" }]}
      showHeader={false}
    >
      {children}
    </ModuleAdminShell>
  );
}
