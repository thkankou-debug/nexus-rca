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
import { Home, Users, Wallet, Megaphone, ReceiptText, Banknote, Printer, FileText } from "lucide-react";
import { AdminShell } from "@/components/admin/ui/AdminShell";
import { BrandMark } from "@/components/admin/ui/BrandMark";
import { TopbarSearch, TopbarNotifications } from "@/components/admin/ui/TopbarTools";
import { SidebarGroup, SidebarItem } from "@/components/admin/ui/SidebarGroup";
import { UserMenu } from "@/components/admin/ui/UserMenu";
import { Breadcrumb, type BreadcrumbItem } from "@/components/admin/ui/Breadcrumb";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

// Reprise Accueil & caisse (12/09/2026, §1/§3) : UNE entrée Caisse (les deux
// modes de saisie sont des onglets de la même page — plus de menus
// redondants), toutes les fonctions existantes conservées, chaque entrée
// mène à une fonction opérationnelle. Les anciennes URL /encaissement et
// /pos redirigent vers la Caisse unifiée. Factures et Agenda entreront dans
// la nav avec leur module (pas de bouton sans effet).
const NAV = [
  {
    key: "caisse",
    label: "Caisse",
    items: [
      { key: "caisse", label: "Caisse (encaissement)", href: "/dashboard/accueil/caisse", icon: Banknote },
      { key: "factures", label: "Factures", href: "/dashboard/accueil/factures", icon: FileText },
      { key: "recus", label: "Paiements & reçus", href: "/dashboard/accueil/recus", icon: ReceiptText },
      { key: "session", label: "Session & clôture", href: "/dashboard/accueil/session", icon: Wallet },
      { key: "imprimante", label: "Imprimante", href: "/dashboard/accueil/imprimante", icon: Printer },
    ],
  },
  {
    key: "accueil",
    label: "Accueil",
    items: [
      { key: "reception", label: "Poste de réception", href: "/dashboard/accueil", icon: Home },
      { key: "clients", label: "Clients & dossiers", href: "/dashboard/accueil/clients", icon: Users },
      // §10 : consignes d'accueil descendantes — la caissière accuse
      // réception et rend compte depuis le module unique.
      { key: "instructions", label: "Instructions", href: "/dashboard/instructions", icon: Megaphone },
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
      sidebarHeader={<BrandMark espace="Accueil & caisse" />}
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
      sidebarFooter={
        // accueil_caisse n'a pas d'espace classique (« /dashboard » le
        // ramènerait ici) — le lien n'existe que pour la supervision
        // admin/super_admin.
        profile.role === "super_admin" || profile.role === "admin" ? (
          <SidebarItem
            label="Retour à l'espace classique"
            href={profile.role === "super_admin" ? "/dashboard/super-admin" : "/dashboard/admin"}
          />
        ) : null
      }
      topbarCenter={
        ["super_admin", "admin"].includes(profile.role as string) ? <TopbarSearch /> : undefined
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
