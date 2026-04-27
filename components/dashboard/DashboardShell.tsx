"use client";

import { useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  client: [
    { href: "/dashboard/client", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/client/demandes", label: "Mes demandes", icon: FileText },
    { href: "/dashboard/client/rdv", label: "Mes rendez-vous", icon: Calendar },
  ],
  agent: [
    { href: "/dashboard/agent", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/agent/demandes", label: "Demandes clients", icon: FileText },
    { href: "/dashboard/agent/depenses", label: "Mes dépenses", icon: Receipt },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/admin/demandes", label: "Demandes", icon: FileText },
    { href: "/dashboard/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  ],
  super_admin: [
    { href: "/dashboard/super-admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/super-admin/finances", label: "Finances", icon: PieChart },
    { href: "/dashboard/super-admin/clients", label: "Clients", icon: UserCircle },
    { href: "/dashboard/super-admin/demandes", label: "Toutes les demandes", icon: FileText },
    { href: "/dashboard/super-admin/rendez-vous", label: "Rendez-vous", icon: CalendarCheck },
    { href: "/dashboard/super-admin/paiements", label: "Paiements", icon: Wallet },
    { href: "/dashboard/super-admin/depenses", label: "Dépenses", icon: Receipt },
    { href: "/dashboard/super-admin/utilisateurs", label: "Utilisateurs", icon: Users },
    { href: "/dashboard/super-admin/roles", label: "Rôles", icon: ShieldCheck },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  client: "Espace client",
  agent: "Espace agent",
  admin: "Espace admin",
  super_admin: "Super admin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  client: "bg-blue-100 text-blue-700",
  agent: "bg-emerald-100 text-emerald-700",
  admin: "bg-amber-100 text-amber-700",
  super_admin: "bg-rose-100 text-rose-700",
};

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = NAV_BY_ROLE[profile.role];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = (profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "");

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="shrink-0 border-b border-slate-200 p-6">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          {/* User card */}
          <div className="shrink-0 border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 text-sm font-bold text-white">
                {initials.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-nexus-blue-950">
                  {profile.prenom} {profile.nom}
                </p>
                <p className="truncate text-xs text-slate-500">{profile.email}</p>
              </div>
            </div>
            <span
              className={cn(
                "mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                ROLE_COLORS[profile.role]
              )}
            >
              {ROLE_LABELS[profile.role]}
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-nexus-blue-950 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="shrink-0 border-t border-slate-200 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Settings className="h-5 w-5" />
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-72">
        <div className="px-4 pt-20 pb-10 sm:px-6 lg:px-10 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
