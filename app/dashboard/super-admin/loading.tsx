import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Loading pour /dashboard/super-admin — Centre de pilotage.
// Layout le plus dense : header + 6 quick actions + finance (4) +
// ops (4) + équipe (3 cartes larges) + liste alertes.
export default function Loading() {
  return (
    <DashboardSkeleton
      headerAction
      quickActions={6}
      statCards={4}
      opCards={4}
      wideCards={3}
      listRows={4}
    />
  );
}
