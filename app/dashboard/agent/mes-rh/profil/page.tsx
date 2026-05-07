import { UserCircle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import type { Employee } from "@/types";

export const metadata = {
  title: "Mon profil | Mon espace RH",
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

export default async function MesRhProfilPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!employee) {
    return (
      <DashboardShell profile={profile}>
        <BackButton fallbackHref="/dashboard/agent/mes-rh" label="Retour" />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Aucun profil employé associé à votre compte.
        </div>
      </DashboardShell>
    );
  }

  const emp = employee as Employee;

  return (
    <DashboardShell profile={profile}>
      <BackButton fallbackHref="/dashboard/agent/mes-rh" label="Retour" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
          <UserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Mon profil
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Informations personnelles enregistrées par l'administration.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="Nom complet" value={emp.nom_complet} />
          <Field label="Email" value={emp.email} />
          <Field label="Téléphone" value={emp.telephone ?? "—"} />
          <Field label="N° CNI" value={emp.numero_cni ?? "—"} />
          <Field
            label="Date de naissance"
            value={formatDateShort(emp.date_naissance)}
          />
          <Field label="Adresse" value={emp.adresse ?? "—"} />
          <Field label="Poste" value={emp.poste} />
          <Field label="Département" value={emp.departement} />
          <Field
            label="Date d'embauche"
            value={formatDateShort(emp.date_embauche)}
          />
          <Field label="Type de contrat" value={emp.type_contrat ?? "—"} />
          <Field label="Statut" value={emp.statut} />
          <Field label="Salaire de base" value={formatFcfa(emp.salaire_base)} />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="h-5 w-5 shrink-0 text-blue-700" />
        <p>
          Pour modifier ces informations, contactez votre administrateur.
        </p>
      </div>
    </DashboardShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-nexus-blue-950">
        {value}
      </p>
    </div>
  );
}
