import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Loading pour /dashboard/agent et toutes ses sous-routes
// (caisse, demandes, rdv, clients, paiements, transferts, depenses).
// Layout type : header + KPIs perfs + cartes opérationnelles + activité.
export default function Loading() {
  return (
    <DashboardSkeleton
      headerAction
      quickActions={4}
      statCards={4}
      opCards={4}
      listRows={5}
    />
  );
}
