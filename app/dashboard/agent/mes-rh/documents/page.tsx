import { Folder } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import {
  HrDocumentTypeBadge,
  HR_DOCUMENT_TYPE_LABELS,
} from "@/components/dashboard/rh/HrDocumentTypeBadge";
import { DownloadButton } from "@/components/dashboard/rh/DownloadButton";
import type { HrDocument, HrDocumentType } from "@/types";

export const metadata = {
  title: "Mes documents | Mon espace RH",
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

const ORDER: HrDocumentType[] = ["contrat", "diplome", "piece_identite", "autre"];

export default async function MesDocumentsRhPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  let docs: HrDocument[] = [];
  if (employee) {
    const { data } = await supabase
      .from("hr_documents")
      .select("*")
      .eq("employee_id", (employee as { id: string }).id)
      .order("created_at", { ascending: false });
    docs = (data ?? []) as HrDocument[];
  }

  const byType = ORDER.reduce<Record<HrDocumentType, HrDocument[]>>(
    (acc, t) => {
      acc[t] = docs.filter((d) => d.type === t);
      return acc;
    },
    { contrat: [], diplome: [], piece_identite: [], autre: [] }
  );

  return (
    <>
      <BackButton fallbackHref="/dashboard/agent/mes-rh" label="Retour" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
          <Folder className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes documents
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tous vos documents RH (contrats, diplômes, pièces…).
          </p>
        </div>
      </div>

      {!employee ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Aucun profil employé associé à votre compte.
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Aucun document RH enregistré.
        </div>
      ) : (
        <div className="space-y-6">
          {ORDER.map((type) => {
            const list = byType[type];
            if (list.length === 0) return null;
            return (
              <div
                key={type}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-slate-200 p-4">
                  <HrDocumentTypeBadge type={type} />
                  <h2 className="font-display text-base font-bold text-nexus-blue-950">
                    {HR_DOCUMENT_TYPE_LABELS[type]} ({list.length})
                  </h2>
                </div>
                <ul className="divide-y divide-slate-100">
                  {list.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center gap-3 p-4 hover:bg-slate-50/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-nexus-blue-950">
                          {doc.nom}
                        </p>
                        {doc.description && (
                          <p className="truncate text-xs text-slate-500">
                            {doc.description}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Ajouté le {formatDateShort(doc.created_at)}
                        </p>
                      </div>
                      <DownloadButton
                        url={`/api/rh/documents/${doc.id}/url`}
                        label="Télécharger"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
