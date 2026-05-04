import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Loading pour /dashboard/admin et ses sous-routes (demandes, utilisateurs).
// Layout type : stats globales + tables.
export default function Loading() {
  return (
    <DashboardSkeleton
      headerAction
      statCards={4}
      listRows={6}
    />
  );
}
