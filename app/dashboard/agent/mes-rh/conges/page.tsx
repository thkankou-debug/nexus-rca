import { AlertTriangle, Plane } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/BackButton";
import { MyLeavesClient } from "@/components/dashboard/rh/MyLeavesClient";
import type { Employee } from "@/types";

export const metadata = {
  title: "Mes congés | Nexus RCA",
};

export const dynamic = "force-dynamic";

export default async function AgentMyLeavesPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("[AGENT_MES_CONGES] fetch employee", error);
  }

  if (!employee) {
    return (
      <>
        <BackButton
          fallbackHref="/dashboard/agent/mes-rh"
          label="Retour à mon espace RH"
        />
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              Mes congés
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Soldes et demandes de congés.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold">
                Aucun profil employé associé à votre compte.
              </p>
              <p className="mt-1">
                Contactez votre administrateur pour qu&apos;il rattache votre
                compte à votre fiche employé.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const emp = employee as Employee;

  return (
    <>
      <BackButton
        fallbackHref="/dashboard/agent/mes-rh"
        label="Retour à mon espace RH"
      />
      <MyLeavesClient employeeId={emp.id} employeeName={emp.nom_complet} />
    </>
  );
}
