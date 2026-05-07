import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PayslipsListView } from "@/components/dashboard/rh/PayslipsListView";

export const dynamic = "force-dynamic";

export default async function SuperAdminPayslipsAValiderPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh/paie"
        label="Retour aux fiches"
      />
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Workflow validation
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Fiches de paie à valider
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Fiches soumises par l&apos;équipe administrative en attente de votre
          décision. Cliquez une ligne pour valider, refuser ou consulter le
          détail.
        </p>
      </div>
      <PayslipsListView
        basePath="/dashboard/super-admin/rh"
        defaultStatutFilter="en_attente_validation"
      />
    </DashboardShell>
  );
}
