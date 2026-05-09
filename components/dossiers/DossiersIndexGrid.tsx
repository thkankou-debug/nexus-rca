// ============================================================================
// COMPOSANT — Grille de 9 cartes catégories (page index dossiers staff)
// Server component (pas d'interactivité). Reçoit compteurs + spécialités.
// ============================================================================

import { CategoryCard } from "./CategoryCard";
import {
  CATEGORIES_DOSSIER,
  CATEGORIE_META,
  type CategorieDossier,
} from "@/lib/demande-categories";

export function DossiersIndexGrid({
  counters,
  baseHref,
  agentSpecialites,
}: {
  counters: Record<
    CategorieDossier,
    { actifs: number; nouveaux: number; urgents: number }
  >;
  /** Préfixe URL : /dashboard/[role]/dossiers (la catégorie est ajoutée) */
  baseHref: string;
  /** Liste des spécialités de l'agent connecté (pour badge "Votre spécialité"). Vide si admin/super_admin */
  agentSpecialites?: string[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES_DOSSIER.map((slug) => {
        const meta = CATEGORIE_META[slug];
        const c = counters[slug];
        return (
          <CategoryCard
            key={slug}
            href={`${baseHref}/${slug}`}
            icon={meta.icon}
            iconBg={meta.iconBg}
            iconColor={meta.iconColor}
            label={meta.label}
            totalActifs={c.actifs}
            nouveaux={c.nouveaux}
            urgents={c.urgents}
            isSpecialite={(agentSpecialites || []).includes(slug)}
          />
        );
      })}
    </div>
  );
}
