"use client";

// ============================================================================
// COMPOSANT — Onglets de la fiche dossier (A5)
// [Résumé] [Documents] [Messages] [Paiements] [Rendez-vous] [Historique]
// Contenu fourni par le parent (server component) — ce composant ne fait que
// gérer l'onglet actif.
// ============================================================================

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DossierTab {
  id: string;
  label: string;
  badge?: number;
  content: ReactNode;
}

export function DossierTabs({ tabs, defaultTab }: { tabs: DossierTab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "border-nexus-orange-500 text-nexus-blue-950"
                  : "border-transparent text-slate-500 hover:text-nexus-blue-950"
              )}
            >
              {t.label}
              {typeof t.badge === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    isActive ? "bg-nexus-orange-100 text-nexus-orange-700" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-5">{activeTab?.content}</div>
    </div>
  );
}
