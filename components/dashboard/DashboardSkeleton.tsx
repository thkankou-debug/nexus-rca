import { Skeleton } from "@/components/ui/Skeleton";

type DashboardSkeletonProps = {
  /** Affiche le header eyebrow + title + sub-line */
  header?: boolean;
  /** Affiche un pill d'alerte à droite du header */
  headerAction?: boolean;
  /** Nombre de quick-actions à afficher, 0 pour cacher la rangée */
  quickActions?: number;
  /** Nombre de cartes KPI riches (label/value/icon + sparkline + delta) */
  statCards?: number;
  /** Nombre de cartes opérationnelles compactes (mini-sparkline) */
  opCards?: number;
  /** Nombre de cartes plus larges (équipe / sections) */
  wideCards?: number;
  /** Nombre de lignes dans la liste finale (RDV, demandes…) */
  listRows?: number;
};

/**
 * DashboardSkeleton — squelette générique partagé par les loading.tsx
 * du dashboard. Configurable via props pour s'adapter à la structure
 * réelle de chaque rôle (super_admin, agent, client, admin).
 */
export function DashboardSkeleton({
  header = true,
  headerAction = false,
  quickActions = 0,
  statCards = 0,
  opCards = 0,
  wideCards = 0,
  listRows = 0,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      {header && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
          {headerAction && <Skeleton className="h-9 w-44 rounded-full" />}
        </div>
      )}

      {/* Quick actions */}
      {quickActions > 0 && (
        <div>
          <Skeleton className="mb-3 h-3 w-28" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: quickActions }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Stat cards riches */}
      {statCards > 0 && (
        <div>
          <Skeleton className="mb-3 h-3 w-32" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: statCards }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface-elevated p-4 shadow-elev-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-5 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Op cards compactes */}
      {opCards > 0 && (
        <div>
          <Skeleton className="mb-3 h-3 w-40" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: opCards }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface-elevated p-4 shadow-elev-1"
              >
                <Skeleton className="h-5 w-5" />
                <Skeleton className="mt-2 h-7 w-12" />
                <Skeleton className="mt-1 h-3 w-24" />
                <Skeleton className="mt-2 h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cartes larges (équipe / sections) */}
      {wideCards > 0 && (
        <div>
          <Skeleton className="mb-3 h-3 w-28" />
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: wideCards }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-elev-1"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="mt-3 h-8 w-20" />
                <Skeleton className="mt-2 h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-40" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste */}
      {listRows > 0 && (
        <div>
          <Skeleton className="mb-3 h-3 w-32" />
          <div className="overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-elev-1">
            <div className="divide-y divide-line">
              {Array.from({ length: listRows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
