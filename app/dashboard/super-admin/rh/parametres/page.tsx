import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { RhSettingsManager } from "@/components/dashboard/rh/RhSettingsManager";

export const dynamic = "force-dynamic";

export default async function RhSettingsPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh"
        label="Retour à l'aperçu RH"
      />
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Paramètres RH
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Configuration du module RH
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Cotisations, contrat type, paie, congés, notifications. Modifications
          appliquées immédiatement aux nouveaux documents générés.
        </p>
      </div>
      <RhSettingsManager />
    </>
  );
}
