import { cn } from "@/lib/utils";

interface SidebarProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  className?: string;
}

// Conteneur générique — la navigation (SidebarGroup/SidebarItem) est fournie
// par l'appelant. Bleu nuit FIXE (tokens --sidebar-*, maquettes Dashboard
// Administration) : la barre latérale est toujours navy, le contenu suit le
// thème — c'est la signature visuelle de l'espace d'administration.
export function Sidebar({ header, children, footer, open = true, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-sidebar transition-transform duration-200 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {header && <div className="shrink-0 border-b border-sidebar-line px-4 py-4">{header}</div>}
        <nav className="flex-1 overflow-y-auto p-3">{children}</nav>
        {footer && <div className="shrink-0 border-t border-sidebar-line p-3">{footer}</div>}
      </div>
    </aside>
  );
}
