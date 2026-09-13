"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AdminShellProps {
  sidebarHeader?: React.ReactNode;
  sidebarContent: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topbarCenter?: React.ReactNode;
  topbarRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Shell commun de l'administration (cahier des charges §4.1) : barre
// latérale 240 px repliable à 64 px, barre supérieure (contexte, recherche,
// notifications, menu utilisateur fournis par l'appelant). Partagé par tous
// les espaces métiers — DashboardShell (gelé) reste l'ancien shell.
export function AdminShell({
  sidebarHeader,
  sidebarContent,
  sidebarFooter,
  topbarCenter,
  topbarRight,
  children,
  className,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn("flex min-h-screen bg-surface-sunken", className)}>
      <Sidebar
        header={sidebarHeader}
        footer={sidebarFooter}
        open={mobileOpen}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      >
        {sidebarContent}
      </Sidebar>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={cn("flex flex-1 flex-col", collapsed ? "lg:ml-16" : "lg:ml-[240px]")}>
        <Topbar
          onMenuClick={() => setMobileOpen((o) => !o)}
          center={topbarCenter}
          right={topbarRight}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
