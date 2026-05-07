"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCircle,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CalendarCheck,
  Wallet,
  Receipt,
  PieChart,
  Send,
  Trophy,
  ShoppingCart,
  Briefcase,
  FileBarChart,
  Sparkles,
  Search,
  Globe,
  Sun,
  Moon,
  Monitor,
  Plus,
  CalendarPlus,
  UserPlus,
  Inbox,
  ClipboardCheck,
  FolderOpen,
  Network,
  Library,
  BarChart3,
  Plane,
  CalendarDays,
  Rocket,
  ListChecks,
  Award,
  Sliders,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/dashboard/CommandPalette";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { PageTransition } from "@/components/dashboard/PageTransition";
import { RoleProvider } from "@/components/rbac/RoleGate";
import { createClient } from "@/lib/supabase/client";
import { setTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}

interface NavGroup {
  /** Si absent, le groupe est rendu sans header (top items). */
  label?: string;
  items: NavItem[];
}

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  client: [
    {
      items: [
        { href: "/dashboard/client", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/dashboard/client/demandes", label: "Mes demandes", icon: FileText },
        { href: "/dashboard/client/rdv", label: "Mes rendez-vous", icon: Calendar },
      ],
    },
  ],
  agent: [
    {
      items: [
        { href: "/dashboard/agent", label: "Tableau de bord", icon: LayoutDashboard },
      ],
    },
    {
      label: "Mon activité",
      items: [
        { href: "/dashboard/agent/clients", label: "Mes clients", icon: UserCircle },
        { href: "/dashboard/agent/demandes", label: "Mes dossiers", icon: FileText },
        { href: "/dashboard/agent/demandes-visa", label: "Demandes visa", icon: FileText },
        { href: "/dashboard/agent/rdv", label: "Mon agenda", icon: CalendarCheck },
        { href: "/dashboard/agent/notes", label: "Mes notes", icon: FileBarChart },
      ],
    },
    {
      label: "Caisse & paiements",
      items: [
        { href: "/dashboard/agent/caisse", label: "Caisse", icon: ShoppingCart },
        { href: "/dashboard/agent/paiements", label: "Mes paiements", icon: Wallet },
        { href: "/dashboard/agent/transferts", label: "Transferts", icon: Send },
        { href: "/dashboard/agent/depenses", label: "Mes dépenses", icon: Receipt },
      ],
    },
    {
      label: "Mon RH",
      items: [
        { href: "/dashboard/agent/mes-rh", label: "Mon espace RH", icon: Briefcase },
        { href: "/dashboard/agent/mes-rh/conges", label: "Mes congés", icon: Plane },
        { href: "/dashboard/agent/mes-rh/onboarding", label: "Mon onboarding", icon: Rocket },
        { href: "/dashboard/agent/mes-rh/evaluations", label: "Mes évaluations", icon: Award },
      ],
    },
  ],
  admin: [
    {
      items: [
        { href: "/dashboard/admin", label: "Tableau de bord", icon: LayoutDashboard },
      ],
    },
    {
      label: "Opérations",
      items: [
        { href: "/dashboard/admin/demandes", label: "Demandes", icon: FileText },
        { href: "/dashboard/admin/demandes-visa", label: "Demandes visa", icon: FileText },
        { href: "/dashboard/admin/clients", label: "Clients", icon: UserCircle },
        { href: "/dashboard/admin/agents", label: "Agents", icon: Users },
        { href: "/dashboard/admin/rdv", label: "Rendez-vous", icon: CalendarCheck },
        { href: "/dashboard/super-admin/contacts", label: "Messages contact", icon: Inbox },
      ],
    },
    {
      label: "Paiements & rapports",
      items: [
        { href: "/dashboard/admin/paiements", label: "Paiements", icon: Wallet },
        { href: "/dashboard/admin/rapports", label: "Rapports mensuels", icon: FileBarChart },
      ],
    },
    {
      label: "Ressources humaines",
      items: [
        { href: "/dashboard/admin/rh/employes", label: "Employés", icon: Users },
        { href: "/dashboard/admin/rh/paie", label: "Fiches de paie", icon: Wallet },
        { href: "/dashboard/admin/rh/conges", label: "Congés", icon: Plane },
        { href: "/dashboard/admin/rh/documents", label: "Documents RH", icon: FolderOpen },
        { href: "/dashboard/admin/rh/onboarding", label: "Onboarding", icon: ListChecks },
        { href: "/dashboard/admin/rh/evaluations", label: "Évaluations", icon: Award },
      ],
    },
  ],
  super_admin: [
    {
      items: [
        { href: "/dashboard/super-admin", label: "Tableau de bord", icon: LayoutDashboard },
      ],
    },
    {
      label: "Pilotage",
      items: [
        { href: "/dashboard/super-admin/finances", label: "Finances", icon: PieChart },
        { href: "/dashboard/super-admin/stats-agents", label: "Performances équipe", icon: Trophy },
        { href: "/dashboard/super-admin/rapports", label: "Rapports financiers", icon: FileBarChart },
        { href: "/dashboard/super-admin/rapports-mensuels", label: "Rapports mensuels (CRON)", icon: FileBarChart },
      ],
    },
    {
      label: "Opérations",
      items: [
        { href: "/dashboard/super-admin/clients", label: "Clients (CRM)", icon: UserCircle },
        { href: "/dashboard/super-admin/demandes", label: "Toutes les demandes", icon: FileText },
        { href: "/dashboard/super-admin/demandes-visa", label: "Demandes visa express", icon: FileText, highlight: true },
        { href: "/dashboard/super-admin/rdv", label: "Rendez-vous", icon: CalendarCheck },
        { href: "/dashboard/super-admin/comptes-clients", label: "Comptes clients", icon: Users },
        { href: "/dashboard/super-admin/contacts", label: "Messages contact", icon: Inbox, highlight: true },
      ],
    },
    {
      label: "Paiements & caisse",
      items: [
        { href: "/dashboard/super-admin/paiements/nouveau-lien", label: "Nouveau lien paiement", icon: Sparkles, highlight: true },
        { href: "/dashboard/super-admin/paiements/en-attente", label: "Paiements en attente", icon: Wallet },
        { href: "/dashboard/super-admin/paiements", label: "Tous les paiements", icon: Wallet },
        { href: "/dashboard/super-admin/caisse", label: "Caisse rapide", icon: ShoppingCart },
        { href: "/dashboard/super-admin/transferts", label: "Transferts", icon: Send },
        { href: "/dashboard/super-admin/depenses", label: "Dépenses", icon: Receipt },
      ],
    },
    {
      label: "Ressources humaines",
      items: [
        { href: "/dashboard/super-admin/rh", label: "Vue d'ensemble", icon: Briefcase },
        { href: "/dashboard/super-admin/rh/annuaire", label: "Annuaire", icon: Network },
        { href: "/dashboard/super-admin/rh/employes", label: "Employés", icon: Users },
        { href: "/dashboard/super-admin/rh/paie", label: "Fiches de paie", icon: Wallet },
        { href: "/dashboard/super-admin/rh/paie/a-valider", label: "À valider", icon: ClipboardCheck, highlight: true },
        { href: "/dashboard/super-admin/rh/conges", label: "Congés", icon: Plane },
        { href: "/dashboard/super-admin/rh/calendrier", label: "Calendrier RH", icon: CalendarDays },
        { href: "/dashboard/super-admin/rh/onboarding", label: "Onboarding", icon: ListChecks },
        { href: "/dashboard/super-admin/rh/evaluations", label: "Évaluations", icon: Award },
        { href: "/dashboard/super-admin/rh/documents", label: "Documents RH", icon: FolderOpen },
        { href: "/dashboard/super-admin/rh/documents-entreprise", label: "Documents entreprise", icon: Library },
        { href: "/dashboard/super-admin/rh/statistiques", label: "Statistiques RH", icon: BarChart3 },
        { href: "/dashboard/super-admin/rh/parametres", label: "Paramètres RH", icon: Sliders },
      ],
    },
    {
      label: "Gouvernance",
      items: [
        { href: "/dashboard/super-admin/equipe", label: "Équipe Nexus", icon: Briefcase },
        { href: "/dashboard/super-admin/roles", label: "Rôles & permissions", icon: ShieldCheck },
        { href: "/dashboard/super-admin/i18n", label: "Multi-langue", icon: Globe },
        { href: "/dashboard/super-admin/audit-log", label: "Audit log", icon: ShieldCheck },
        { href: "/dashboard/super-admin/parametres", label: "Paramètres agence", icon: Settings },
      ],
    },
  ],
};

// Aplatit les groupes en items pour la palette de commandes et autres usages.
function flattenNav(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items);
}

const ROLE_LABELS: Record<UserRole, string> = {
  client: "Espace client",
  agent: "Espace agent",
  admin: "Espace admin",
  super_admin: "Super admin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  client: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  agent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  admin: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  super_admin: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navGroups = NAV_BY_ROLE[profile.role];
  const navItems = useMemo(() => flattenNav(navGroups), [navGroups]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = (profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "");

  // Raccourcis globaux :
  //   ⌘K / Ctrl+K        → recherche globale (data : clients, demandes, RDV, paiements)
  //   ⌘⇧K / Ctrl+Shift+K → palette de commandes (navigation + actions)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      if (e.shiftKey) {
        setPaletteOpen((v) => !v);
      } else {
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Items dérivés de la nav du rôle + actions universelles + actions par rôle
  const commandItems = useMemo<CommandItem[]>(() => {
    const role = profile.role;

    // Navigation : tous les liens du rôle (déjà role-aware via NAV_BY_ROLE)
    const navCmds: CommandItem[] = navItems.map((n) => ({
      id: `nav-${n.href}`,
      label: n.label,
      icon: n.icon,
      group: "Navigation",
      href: n.href,
    }));

    // Création rapide — role-aware
    const create: CommandItem[] = [];
    if (role === "super_admin") {
      create.push({
        id: "create-employee",
        label: "Créer un employé",
        icon: UserPlus,
        group: "Création rapide",
        keywords: "agent admin team add nouveau",
        href: "/dashboard/super-admin/equipe/nouveau",
      });
    }
    if (role === "agent" || role === "admin" || role === "super_admin") {
      create.push({
        id: "create-payment-link",
        label: "Nouveau lien de paiement",
        icon: Sparkles,
        group: "Création rapide",
        keywords: "stripe checkout invoice facture",
        href: "/dashboard/super-admin/paiements/nouveau-lien",
      });
    }
    if (role === "client") {
      create.push({
        id: "create-rdv",
        label: "Prendre un rendez-vous",
        icon: CalendarPlus,
        group: "Création rapide",
        keywords: "appointment book new",
        href: "/dashboard/client/rdv/nouveau",
      });
    }
    // Action universelle "Ouvrir un dossier" (visible côté public)
    create.push({
      id: "open-dossier",
      label: "Ouvrir un dossier (formulaire complet)",
      icon: Plus,
      group: "Création rapide",
      keywords: "demande complete request submit nouveau",
      href: "/demande/complet",
    });

    // Thème — synchronisé via lib/theme (le toggle navbar suit en live).
    // Exclu des récents : le toggle navbar est déjà là pour ça.
    const theme: CommandItem[] = [
      {
        id: "theme-light",
        label: "Thème clair",
        icon: Sun,
        group: "Thème",
        keywords: "light mode jour day",
        onSelect: () => setTheme("light"),
        excludeFromRecent: true,
      },
      {
        id: "theme-dark",
        label: "Thème sombre",
        icon: Moon,
        group: "Thème",
        keywords: "dark mode nuit night",
        onSelect: () => setTheme("dark"),
        excludeFromRecent: true,
      },
      {
        id: "theme-system",
        label: "Suivre le système",
        icon: Monitor,
        group: "Thème",
        keywords: "auto os preference",
        onSelect: () => setTheme("system"),
        excludeFromRecent: true,
      },
    ];

    // Compte
    const account: CommandItem[] = [
      {
        id: "site",
        label: "Voir le site public",
        icon: Globe,
        group: "Compte",
        keywords: "home accueil public site",
        href: "/",
      },
      {
        id: "logout",
        label: "Se déconnecter",
        icon: LogOut,
        group: "Compte",
        keywords: "logout sign out exit",
        onSelect: handleLogout,
      },
    ];

    return [...navCmds, ...create, ...theme, ...account];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navItems, profile.role]);

  return (
    <RoleProvider role={profile.role} userId={profile.id}>
    <div className="flex min-h-screen bg-surface-sunken">
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-surface-elevated px-4 lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform border-r border-line bg-surface-elevated transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-line p-6">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <div className="shrink-0 border-b border-line p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-sm font-bold text-white shadow-elev-2">
                {initials.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-title text-ink">
                  {profile.prenom} {profile.nom}
                </p>
                <p className="truncate text-caption text-ink-muted">{profile.email}</p>
              </div>
              <NotificationBell />
            </div>
            <span
              className={cn(
                "mt-3 inline-block rounded-full px-2.5 py-0.5 text-caption",
                ROLE_COLORS[profile.role]
              )}
            >
              {ROLE_LABELS[profile.role]}
            </span>
          </div>

          {/* Recherche globale (data) + palette de commandes (navigation/actions) */}
          <div className="shrink-0 space-y-2 px-4 pt-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher dans le contenu"
              className="flex w-full items-center gap-2 rounded-2xl border border-line bg-surface-sunken px-3 py-2 text-body-sm text-ink-muted transition-colors hover:border-brand/40 hover:text-ink"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Rechercher contenu…</span>
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-line bg-surface-elevated px-1.5 font-mono text-[10px] text-ink-muted">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Ouvrir la palette de commandes"
              className="flex w-full items-center gap-2 rounded-2xl border border-line bg-surface-sunken px-3 py-2 text-body-sm text-ink-muted transition-colors hover:border-brand/40 hover:text-ink"
            >
              <Sparkles className="h-4 w-4" />
              <span className="flex-1 text-left">Commandes…</span>
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-line bg-surface-elevated px-1.5 font-mono text-[10px] text-ink-muted">
                ⌘⇧K
              </kbd>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4">
            {navGroups.map((group, gi) => (
              <div
                key={`group-${gi}-${group.label ?? "top"}`}
                className={gi > 0 ? "mt-5" : ""}
              >
                {group.label && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-body-sm font-semibold transition-colors",
                            active
                              ? "bg-nexus-blue-950 text-white shadow-elev-2 dark:bg-brand dark:text-white"
                              : item.highlight
                                ? "bg-brand-subtle text-nexus-orange-700 hover:bg-nexus-orange-100 dark:text-brand"
                                : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                          )}
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-line p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-body-sm font-semibold text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              <Settings className="h-5 w-5" />
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-body-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="flex-1 lg:ml-72">
        <div className="px-4 pt-20 pb-10 sm:px-6 lg:px-10 lg:pt-10">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <CommandPalette
        items={commandItems}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
      />

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
    </RoleProvider>
  );
}
