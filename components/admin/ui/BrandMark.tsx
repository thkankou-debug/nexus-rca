"use client";

import Image from "next/image";
import { useSidebarCollapsed } from "./Sidebar";

// ============================================================================
// BRAND MARK — logo officiel Nexus RCA + wordmark, affiché en tête de la
// barre latérale de CHAQUE espace d'administration (exigence Thierry,
// 11/09/2026 : « le logo NEXUS RCA doit être affiché sur l'interface de
// chaque compte »). Fichier logo existant (public/icones), aucune nouvelle
// ressource graphique inventée. En mode replié (§4.1), seul le logo reste.
// ============================================================================

export function BrandMark({ espace }: { espace?: string }) {
  const collapsed = useSidebarCollapsed();
  return (
    <div className={collapsed ? "flex justify-center" : "flex items-center gap-3"}>
      <Image
        src="/icones/icon-96.png"
        alt="Nexus RCA"
        width={38}
        height={38}
        className="shrink-0 rounded-sm"
        priority
      />
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-display text-base font-bold leading-tight tracking-wide text-sidebar-ink">
            NEXUS <span className="text-brand">RCA</span>
          </p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-ink-subtle">
            {espace ?? "International Agency"}
          </p>
        </div>
      )}
    </div>
  );
}
