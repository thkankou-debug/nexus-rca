import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Loading pour /dashboard/client et ses sous-routes
// (demandes, rdv, paiements). Plus léger : focus sur les listes.
export default function Loading() {
  return (
    <DashboardSkeleton
      statCards={3}
      listRows={5}
    />
  );
}
