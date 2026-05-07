import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { EvaluationsDashboard } from "@/components/dashboard/rh/EvaluationsDashboard";

export const metadata = {
  title: "Évaluations — Admin RH | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function AdminEvaluationsPage() {
  const profile = await requireProfile(["admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/admin" label="Retour" />
      <EvaluationsDashboard
        basePath="/dashboard/admin/rh"
        canCreate={false}
        canLaunch={false}
      />
    </DashboardShell>
  );
}
