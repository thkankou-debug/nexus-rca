"use client";

import { useSidebarCollapsed } from "./Sidebar";

// ============================================================================
// BRAND MARK — logo officiel Nexus RCA + wordmark, affiché en tête de la
// barre latérale de CHAQUE espace d'administration (exigences Thierry,
// 11/09 puis 13/09/2026 : « le logo du dashboard admin doit être LE logo
// de Nexus RCA, sur tous les comptes »).
//
// Le visuel est la copie exacte du logo dessiné du site public
// (components/ui/Logo.tsx — fichier GELÉ, conservé tel quel par décision
// de Thierry du 13/09, docs/DECISIONS_AR.md) : carré dégradé navy→orange,
// croix + point, wordmark NEXUS / RCA. Les couleurs orange de ce bloc sont
// l'exception assumée à M11 — c'est LE logo, pas un accent d'interface.
// Seule différence avec le site : pas de rotation au survol (A1 : aucune
// animation décorative dans l'administration).
// En mode replié (§4.1), seul le carré du logo reste.
// ============================================================================

/** Carré du logo officiel, réutilisable hors sidebar (en-tête partenaire…). */
export function NexusMark({ size = 40 }: { size?: number }) {
  return (
    <div className="relative shrink-0">
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 shadow-lg"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
          style={{ width: size * 0.6, height: size * 0.6 }}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3 L21 21" />
          <path d="M21 3 L3 21" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-nexus-orange-500 ring-2 ring-white" />
    </div>
  );
}

export function BrandMark({ espace }: { espace?: string }) {
  const collapsed = useSidebarCollapsed();
  return (
    <div className={collapsed ? "flex justify-center" : "flex items-center gap-3"}>
      <NexusMark size={38} />
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-display text-base font-bold leading-tight tracking-tight text-white">
            NEXUS{" "}
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-nexus-orange-300">
              RCA
            </span>
          </p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-ink-subtle">
            {espace ?? "International Agency"}
          </p>
        </div>
      )}
    </div>
  );
}
