"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, PanelLeft, Search, X, type LucideIcon } from "lucide-react";
import { NexusLogoMark } from "@/components/ui/NexusLogoMark";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

type Item = { href: string; label: string; icon: LucideIcon };
type Group = { label?: string; items: Item[] };

export function SuperAdminV4Shell({
  profile,
  navGroups,
  initials,
  open,
  setOpen,
  onSearch,
  onLogout,
  children,
}: {
  profile: Profile;
  navGroups: Group[];
  initials: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onSearch: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [wide, setWide] = useState(false);
  const prenom = profile.prenom || profile.nom || "Direction";

  return (
    <div className="flex min-h-screen bg-[#f4f6fb] text-[#1c2033]">
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-[#f4f6fb] px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <NexusLogoMark size={32} />
          <span className="text-sm font-bold">NEXUS</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button type="button" onClick={onSearch} className="flex h-10 w-10 items-center justify-center" aria-label="Rechercher">
            <Search className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[#eceef6] bg-white transition-transform lg:translate-x-0",
          wide ? "w-72" : "w-64 lg:w-[104px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn("flex items-center gap-2 px-3 py-4", !wide && "lg:flex-col")}>
          <NexusLogoMark size={36} />
          <div className={cn("leading-none", !wide && "lg:hidden")}>
            <p className="font-display text-lg font-bold text-nexus-blue-950">NEXUS</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nexus-orange-600">RCA</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setWide((v) => !v)}
          className="mx-3 mb-2 hidden h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold text-[#8b93a7] lg:flex"
        >
          <PanelLeft className="h-4 w-4" />
          {wide ? "Réduire" : "Libellés"}
        </button>
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
          {navGroups.map((group, gi) => (
            <div key={group.label ?? gi}>
              {group.label && (
                <p className={cn("px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b93a7]", !wide && "lg:hidden")}>
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        title={item.label}
                        className={cn(
                          "flex min-h-10 items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium",
                          !wide && "lg:flex-col lg:gap-0.5 lg:px-1 lg:text-center lg:text-[10px] lg:leading-tight",
                          active ? "text-violet-600" : "text-[#8b93a7]"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
                        <span className={cn(!wide && "lg:line-clamp-2")}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-[#eceef6] p-2">
          <button type="button" onClick={onLogout} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-rose-600">
            <LogOut className="h-4 w-4" />
            <span className={cn(!wide && "lg:hidden")}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {open && <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-20 bg-[#1c2033]/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className={cn("min-w-0 flex-1 pt-14 lg:pt-0", wide ? "lg:ml-72" : "lg:ml-[104px]")}>
        <header className="hidden items-center justify-between px-6 py-4 lg:flex">
          <div>
            <p className="text-sm text-[#8b93a7]">Bonjour,</p>
            <p className="font-display text-2xl font-bold text-[#1c2033]">{prenom}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onSearch} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#eceef6] bg-white px-3 text-sm text-[#8b93a7]">
              <Search className="h-4 w-4" />
              Rechercher
            </button>
            <NotificationBell />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              {initials || "U"}
            </span>
          </div>
        </header>
        <main className="px-4 pb-10 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
