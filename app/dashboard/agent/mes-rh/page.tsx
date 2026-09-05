import Link from "next/link";
import {
  Briefcase,
  UserCircle,
  FileText,
  Wallet,
  Folder,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import type { Employee } from "@/types";

export const metadata = {
  title: "Mon espace RH | Agent",
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

export default async function MesRhPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  // Cherche le row employee lié au profil — RLS autorise SELECT si profile_id = auth.uid()
  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("[RH_MES_RH] fetch employee", error);
  }

  if (!employee) {
    return (
      <DashboardShell profile={profile}>
        <BackButton
          fallbackHref="/dashboard/agent"
          label="Retour au tableau de bord"
        />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              Mon espace RH
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Profil employé, contrat, fiches de paie et documents.
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
                Contactez votre administrateur pour qu&apos;il rattache votre compte
                à votre fiche employé.
              </p>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const emp = employee as Employee;

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent"
        label="Retour au tableau de bord"
      />

      {/* Hero */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-7 shadow-lg sm:p-9">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-base font-bold text-white shadow-md">
            {emp.nom_complet[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
              Mon espace RH
            </span>
            <h1 className="mt-1.5 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
              {emp.nom_complet}
            </h1>
            <p className="mt-1 text-sm text-slate-300/90">
              {emp.poste} · {emp.departement}
            </p>
          </div>
        </div>

        {/* Mini-stats */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/[0.06] sm:grid-cols-4">
          <HeroMini label="Poste" value={emp.poste} />
          <HeroMini label="Département" value={emp.departement} />
          <HeroMini
            label="Date d'embauche"
            value={formatDateShort(emp.date_embauche)}
          />
          <HeroMini label="Type contrat" value={emp.type_contrat ?? "—"} />
        </div>
      </div>

      {/* Tuiles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TileLink
          href="/dashboard/agent/mes-rh/profil"
          icon={UserCircle}
          title="Mon profil"
          description="Voir mes informations personnelles."
        />
        <TileLink
          href="/dashboard/agent/mes-rh/contrat"
          icon={FileText}
          title="Mon contrat"
          description="Télécharger mon contrat de travail."
        />
        <TileLink
          href="/dashboard/agent/mes-rh/fiches-paie"
          icon={Wallet}
          title="Mes fiches de paie"
          description="Consulter et télécharger mes bulletins."
        />
        <TileLink
          href="/dashboard/agent/mes-rh/documents"
          icon={Folder}
          title="Mes documents"
          description="Tous mes documents RH (diplômes, pièces…)."
        />
      </div>
    </DashboardShell>
  );
}

function HeroMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-nexus-blue-950/60 px-4 py-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 truncate font-display text-base font-bold text-white sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function TileLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50/60"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6 text-nexus-orange-500" />
        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-nexus-blue-950" />
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
