"use client";

// L3 Étape 3 — premier raccordement réel de AdminShell (A2/A3), jamais
// branché avant ce jour (voir docs/DETTE.md, A3 #1). Généralisé en L4-2
// (renommé depuis components/dossiers/DossiersAdminShell.tsx) pour être
// partagé par tous les modules unifiés (Dossiers, Clients, et les suivants)
// plutôt que dupliqué à chaque lot. Seuls les modules dont le href est un
// vrai chemin (pas une ancre de démo #...) apparaissent : "une entrée qui ne
// mène nulle part n'existe pas" (BRIEF_L2_L3_POUR_CLAUDE_CODE.md, Étape 3).
//
// Pas de recherche globale ni de centre de notifications ici : les deux
// exigeraient une vraie source de données (index de recherche, notifications
// réelles) — un chantier séparé, pas une UI décorative non branchée.

import { useRouter, usePathname } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { AdminShell } from "@/components/admin/ui/AdminShell";
import { BrandMark } from "@/components/admin/ui/BrandMark";
import { TopbarSearch, TopbarNotifications } from "@/components/admin/ui/TopbarTools";
import { SidebarGroup, SidebarItem } from "@/components/admin/ui/SidebarGroup";
import { UserMenu } from "@/components/admin/ui/UserMenu";
import { Breadcrumb, type BreadcrumbItem } from "@/components/admin/ui/Breadcrumb";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import type { AdminNavGroup } from "@/lib/admin-nav";
import type { Profile } from "@/types";

export function ModuleAdminShell({
  profile,
  effectiveNav,
  breadcrumb,
  title,
  description,
  showHeader = true,
  children,
}: {
  profile: Profile;
  effectiveNav: AdminNavGroup[];
  breadcrumb: BreadcrumbItem[];
  title?: string;
  description?: string;
  /** Faux pour les pages (fiche, assigner) qui ont déjà leur propre en-tête riche. */
  showHeader?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const realNav = effectiveNav
    .map((group) => ({
      ...group,
      modules: group.modules.filter((m) => !m.href.startsWith("#")),
    }))
    .filter((group) => group.modules.length > 0);

  return (
    <AdminShell
      sidebarHeader={
        <BrandMark
          espace={
            {
              super_admin: "Administration",
              admin: "Administration",
              dg: "Direction générale",
              daf: "Finance & trésorerie",
              comptable: "Comptabilité",
              chef_service: "Responsable de service",
              agent: "Espace agent",
            }[profile.role as string] ?? "Administration"
          }
        />
      }
      sidebarContent={
        <>
          {realNav.map((group) => (
            <SidebarGroup key={group.key} label={group.label}>
              {group.modules.map((m) => (
                <SidebarItem
                  key={m.key}
                  icon={<FolderOpen />}
                  label={m.label}
                  href={m.href}
                  active={pathname === m.href || pathname.startsWith(`${m.href}/`)}
                />
              ))}
            </SidebarGroup>
          ))}
        </>
      }
      sidebarFooter={
        // « /dashboard » redirige désormais super_admin/admin/daf/comptable
        // vers leur écran d'accueil du nouveau shell (§1.2) : pointer
        // directement l'ancien tableau de bord du rôle pour que ce lien
        // reste un vrai retour, pas une boucle. Les rôles sans espace
        // classique (daf, comptable…) n'ont pas ce lien — une entrée qui ne
        // mène nulle part n'existe pas.
        profile.role === "super_admin" || profile.role === "admin" || profile.role === "agent" ? (
          <SidebarItem
            label="Retour à l'espace classique"
            href={
              profile.role === "super_admin"
                ? "/dashboard/super-admin"
                : profile.role === "admin"
                ? "/dashboard/admin"
                : "/dashboard/agent"
            }
          />
        ) : null
      }
      topbarCenter={
        // La route /api/search ne porte aujourd'hui que les portées
        // agent/admin/super_admin — la proposer à un rôle qu'elle refuse
        // serait un champ mort (voir docs/AUDIT_CDC.md).
        ["super_admin", "admin", "agent"].includes(profile.role as string) ? (
          <TopbarSearch />
        ) : undefined
      }
      topbarRight={
        <>
          <TopbarNotifications />
          <UserMenu
            name={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
            email={profile.email}
            onLogout={handleLogout}
          />
        </>
      }
    >
      {showHeader ? (
        <>
          <PageHeader
            breadcrumb={<Breadcrumb items={breadcrumb} />}
            title={title ?? ""}
            description={description}
          />
          <div className="mt-6">{children}</div>
        </>
      ) : (
        <>
          <div className="mb-2">
            <Breadcrumb items={breadcrumb} />
          </div>
          {children}
        </>
      )}
    </AdminShell>
  );
}
