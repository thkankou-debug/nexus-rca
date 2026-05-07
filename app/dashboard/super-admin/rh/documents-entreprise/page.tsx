import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { CompanyDocumentsManager } from "@/components/dashboard/rh/CompanyDocumentsManager";

export const metadata = {
  title: "RH — Documents entreprise | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function CompanyDocumentsPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/super-admin/rh" label="Retour RH" />

      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Documents entreprise
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Documents officiels
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Règlement intérieur, chartes, conventions, guides — partagés selon
          la visibilité choisie.
        </p>
      </div>

      <CompanyDocumentsManager canManage={profile.role === "super_admin"} />
    </DashboardShell>
  );
}
