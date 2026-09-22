"use client";

import { NexusLogoMark } from "@/components/ui/NexusLogoMark";
import { useSidebarCollapsed } from "./Sidebar";

// ============================================================================
// BRAND MARK — même logo que la HomePage (NexusLogoMark), sur tous les
// espaces d'administration. Wordmark identique à Logo variant="light".
// L'orange du logo n'est pas remplacé par l'or de l'interface.
// Replié : le carré officiel seul, sans variante inventée.
// ============================================================================

export function NexusMark({ size = 40 }: { size?: number }) {
  return <NexusLogoMark size={size} />;
}

export function BrandMark({ espace }: { espace?: string }) {
  const collapsed = useSidebarCollapsed();
  return (
    <div className={collapsed ? "flex justify-center" : "flex items-center gap-2.5"}>
      <NexusLogoMark size={collapsed ? 36 : 40} />
      {!collapsed && (
        <div className="min-w-0">
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight text-white">NEXUS</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nexus-orange-300">
              RCA
            </span>
          </div>
          <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-ink-subtle">
            {espace ?? "International Agency"}
          </p>
        </div>
      )}
    </div>
  );
}
