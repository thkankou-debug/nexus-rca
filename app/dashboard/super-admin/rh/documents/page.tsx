import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { AllDocumentsView } from "@/components/dashboard/rh/AllDocumentsView";

export const dynamic = "force-dynamic";

export default async function SuperAdminAllDocumentsPage() {
  const profile = await requireProfile(["super_admin"]);

  return (
    <>
      <BackButton
        fallbackHref="/dashboard/super-admin/rh"
        label="Retour à l'aperçu RH"
      />
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
          Ressources humaines
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
          Documents RH
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tous les contrats, diplômes, pièces d&apos;identité et autres
          documents, tous employés confondus.
        </p>
      </div>
      <AllDocumentsView basePath="/dashboard/super-admin/rh" />
    </>
  );
}
