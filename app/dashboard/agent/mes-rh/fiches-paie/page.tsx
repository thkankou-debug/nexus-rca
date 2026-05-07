import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { DownloadButton } from "@/components/dashboard/rh/DownloadButton";
import type { Payslip } from "@/types";

export const metadata = {
  title: "Mes fiches de paie | Mon espace RH",
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

function formatFcfa(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

export default async function MesFichesPaiePage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  // RLS filtre auto : statut=validee + employees.profile_id = auth.uid()
  const { data: payslips } = await supabase
    .from("payslips")
    .select("*")
    .eq("statut", "validee")
    .order("periode_debut", { ascending: false });

  const list = (payslips ?? []) as Payslip[];

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/agent/mes-rh" label="Retour" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mes fiches de paie
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Bulletins validés et téléchargeables au format PDF.
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Aucune fiche de paie validée pour le moment.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3 text-right">Net reçu</th>
                <th className="px-4 py-3 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-nexus-blue-950">
                    {p.reference}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{p.mois_libelle}</p>
                    <p className="text-xs text-slate-400">
                      {formatDateShort(p.periode_debut)} →{" "}
                      {formatDateShort(p.periode_fin)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-700">
                    {formatFcfa(p.salaire_net)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DownloadButton
                      url={`/api/rh/payslips/${p.id}/pdf-url`}
                      label="PDF"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
