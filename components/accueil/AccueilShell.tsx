"use client";

// ============================================================================
// ACCUEIL SHELL — Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md
// Partie 3, maquettes ACCEUIL / POS ECRAN 1-3).
// Même patron que ModuleAdminShell (AdminShell + SidebarGroup + UserMenu),
// mais avec une navigation fixe : l'espace est réservé au poste physique
// (rôle accueil_caisse, supervision admin/super_admin) — pas de calcul
// getEffectiveNav ici, les pages sont déjà gardées par requireProfile et
// chaque action sensible par assertPermission côté serveur.
// Toutes les entrées mènent à de vraies pages ("une entrée qui ne mène
// nulle part n'existe pas").
// ============================================================================

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, ShoppingCart, Wallet } from "lucide-react";
import { AdminShell } from "@/components/admin/ui/AdminShell";
import { SidebarGroup, SidebarItem } from "@/components/admin/ui/SidebarGroup";
import { UserMenu } from "@/components/admin/ui/UserMenu";
import { Breadcrumb, type BreadcrumbItem } from "@/components/admin/ui/Breadcrumb";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const NAV = [
  {
    key: "accueil",
    label: "Accueil",
    items: [
      { key: "reception", label: "Poste de réception", href: "/dashboard/accueil", icon: Home },
      { key: "clients", label: "Clients", href: "/dashboard/accueil/clients", icon: Users },
    ],
  },
  {
    key: "caisse",
    label: "Caisse",
    items: [
      { key: "pos", label: "Comptoir POS", href: "/dashboard/accueil/pos", icon: ShoppingCart },
      { key: "session", label: "Session de caisse", href: "/dashboard/accueil/session", icon: Wallet },
    ],
  },
];

export function AccueilShell({
  profile,
  breadcrumb,
  title,
  description,
  showHeader = true,
  children,
}: {
  profile: Profile;
  breadcrumb: BreadcrumbItem[];
  title?: string;
  description?: string;
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

  return (
    <AdminShell
      sidebarHeader={
        <div>
          <p className="font-display text-title font-bold text-ink">Nexus RCA</p>
          <p className="text-caption text-ink-muted">Accueil &amp; caisse</p>
        </div>
      }
      sidebarContent={
        <>
          {NAV.map((group) => (
            <SidebarGroup key={group.key} label={group.label}>
              {group.items.map((item) => (
                <SidebarItem
                  key={item.key}
                  icon={<item.icon />}
                  label={item.label}
                  href={item.href}
                  active={
                    item.href === "/dashboard/accueil"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  }
                />
              ))}
            </SidebarGroup>
          ))}
        </>
      }
      sidebarFooter={<SidebarItem label="Retour à l'espace classique" href="/dashboard" />}
      topbarRight={
        <UserMenu
          name={[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
          email={profile.email}
          onLogout={handleLogout}
        />
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
