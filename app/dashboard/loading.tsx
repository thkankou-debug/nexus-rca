import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Fallback générique : couvre /dashboard/page.tsx (router de rôles)
// et toute future route sans loading dédié.
export default function Loading() {
  return (
    <DashboardSkeleton
      statCards={3}
      opCards={3}
      listRows={4}
    />
  );
}
