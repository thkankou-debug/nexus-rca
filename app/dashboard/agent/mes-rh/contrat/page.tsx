import { FileText, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { DownloadButton } from "@/components/dashboard/rh/DownloadButton";
import type { Employee, HrDocument } from "@/types";

export const metadata = {
  title: "Mon contrat | Mon espace RH",
};

export const dynamic = "force-dynamic";

const FRENCH_MONTHS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

function formatDateShort(dateISO: string | null | undefined): string {
  if (!dateISO) return "—";
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${FRENCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function MesRhContratPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("id, type_contrat, date_embauche")
    .eq("profile_id", profile.id)
    .maybeSingle();

  let contrat: HrDocument | null = null;
  if (employee) {
    const { data: docs } = await supabase
      .from("hr_documents")
      .select("*")
      .eq("employee_id", (employee as { id: string }).id)
      .eq("type", "contrat")
      .order("created_at", { ascending: false })
      .limit(1);
    contrat = ((docs ?? [])[0] ?? null) as HrDocument | null;
  }

  return (
    <>
      <BackButton fallbackHref="/dashboard/agent/mes-rh" label="Retour" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mon contrat
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Téléchargez votre contrat de travail signé.
          </p>
        </div>
      </div>

      {!employee ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
            Aucun profil employé associé à votre compte.
          </div>
        </div>
      ) : !contrat ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold">Aucun contrat disponible</p>
              <p className="mt-1">
                Votre contrat n&apos;a pas encore été ajouté par l&apos;administration.
                Contactez votre administrateur.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Contrat de travail
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-nexus-blue-950">
                {contrat.nom}
              </h2>
              {contrat.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {contrat.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>
                  Type :{" "}
                  <span className="font-semibold text-nexus-blue-950">
                    {(employee as Pick<Employee, "type_contrat">).type_contrat ??
                      "—"}
                  </span>
                </span>
                <span>
                  Embauché le :{" "}
                  <span className="font-semibold text-nexus-blue-950">
                    {formatDateShort(
                      (employee as Pick<Employee, "date_embauche">).date_embauche
                    )}
                  </span>
                </span>
                <span>
                  Document ajouté le :{" "}
                  <span className="font-semibold text-nexus-blue-950">
                    {formatDateShort(contrat.created_at)}
                  </span>
                </span>
              </div>
            </div>
            <DownloadButton
              url={`/api/rh/documents/${contrat.id}/url`}
              label="Télécharger mon contrat"
              variant="primary"
            />
          </div>
        </div>
      )}
    </>
  );
}
