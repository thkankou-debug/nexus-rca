"use client";

import { createContext, useContext } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// Cahier des charges §4.1 : barre latérale 240 px, repliable à 64 px.
// Le repli est fourni par AdminShell (état) et consommé par les éléments
// (labels masqués, icônes centrées) via ce contexte.
const SidebarCollapsedContext = createContext(false);
export function useSidebarCollapsed(): boolean {
  return useContext(SidebarCollapsedContext);
}

interface SidebarProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
}

// Conteneur générique — la navigation (SidebarGroup/SidebarItem) est fournie
// par l'appelant. Bleu nuit FIXE (tokens --sidebar-*, maquettes Dashboard
// Administration) : la barre latérale est toujours navy, le contenu suit le
// thème — c'est la signature visuelle de l'espace d'administration.
export function Sidebar({
  header,
  children,
  footer,
  open = true,
  collapsed = false,
  onToggleCollapsed,
  className,
}: SidebarProps) {
  return (
    <SidebarCollapsedContext.Provider value={collapsed}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 transform bg-sidebar transition-[transform,width] duration-200 lg:translate-x-0",
          collapsed ? "w-16" : "w-[240px]",
          open ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {header && (
            <div
              className={cn(
                "shrink-0 border-b border-sidebar-line py-4",
                collapsed ? "px-2" : "px-4"
              )}
            >
              {header}
            </div>
          )}
          <nav className={cn("flex-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>{children}</nav>
          {footer && (
            <div className={cn("shrink-0 border-t border-sidebar-line", collapsed ? "p-2" : "p-3")}>
              {footer}
            </div>
          )}
          {onToggleCollapsed && (
            <div className="hidden shrink-0 border-t border-sidebar-line p-2 lg:block">
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xs px-3 py-2 text-body-sm font-medium text-sidebar-ink-muted transition-colors duration-150 hover:bg-sidebar-raised hover:text-sidebar-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  collapsed && "justify-center px-0"
                )}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <>
                    <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">Replier</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </SidebarCollapsedContext.Provider>
  );
}
