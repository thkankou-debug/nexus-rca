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

// Compose Sidebar + Topbar. Bibliothèque de démonstration (A2) — n'est PAS
// branché sur les pages existantes ni sur DashboardShell (gelé par CLAUDE.md).
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

  return (
    <div className={cn("flex min-h-screen bg-surface-sunken", className)}>
      <Sidebar header={sidebarHeader} footer={sidebarFooter} open={mobileOpen}>
        {sidebarContent}
      </Sidebar>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:ml-64">
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
