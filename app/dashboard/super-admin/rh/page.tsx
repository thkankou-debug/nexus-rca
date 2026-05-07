import Link from "next/link";
import {
  Briefcase,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { PayslipStatusBadge } from "@/components/dashboard/rh/PayslipStatusBadge";

export const metadata = {
  title: "RH — Vue d'ensemble | Super Admin",
};

export const dynamic = "force-dynamic";

function formatFcfa(n: number): string {
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

export default async function RhOverviewPage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartISO = monthStart.toISOString();

  const [employeesRes, payslipsPendingRes, payslipsValidatedMonthRes] =
    await Promise.all([
      supabase.from("employees").select("id, salaire_base, statut"),
      supabase
        .from("payslips")
        .select("id, reference, mois_libelle, salaire_net, statut, created_at, employees(id, nom_complet, poste)")
        .eq("statut", "en_attente_validation")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("payslips")
        .select("id", { count: "exact", head: true })
        .eq("statut", "validee")
        .gte("validated_at", monthStartISO),
    ]);

  const employees = employeesRes.data ?? [];
  const totalEmployees = employees.length;
  const masseSalariale = employees
    .filter((e) => e.statut === "actif")
    .reduce((s, e) => s + Number(e.salaire_base ?? 0), 0);

  const fichesEnAttente = payslipsPendingRes.data ?? [];
  const nbFichesEnAttente = fichesEnAttente.length;
  const nbFichesValideesMois = payslipsValidatedMonthRes.count ?? 0;

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-md">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              Ressources Humaines
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Pilotage RH : employés, fiches de paie, validation, archivage.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/super-admin/rh/employes/nouveau"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-nexus-blue-950 shadow-sm transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Nouvel employé
          </Link>
          <Link
            href="/dashboard/super-admin/rh/paie/nouvelle"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Nouvelle fiche de paie
          </Link>
        </div>
      </div>

      {/* Stats premium */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total employés"
          value={String(totalEmployees)}
          icon={Users}
          accent="from-nexus-blue-600 to-nexus-blue-800"
        />
        <StatCard
          label="Masse salariale mensuelle"
          value={formatFcfa(masseSalariale)}
          icon={TrendingUp}
          accent="from-emerald-500 to-emerald-700"
          hint="Sum salaire de base · employés actifs"
        />
        <StatCard
          label="Fiches en attente"
          value={String(nbFichesEnAttente)}
          icon={Clock}
          accent="from-amber-500 to-amber-700"
          urgent={nbFichesEnAttente > 0}
        />
        <StatCard
          label="Fiches validées ce mois"
          value={String(nbFichesValideesMois)}
          icon={CheckCircle2}
          accent="from-nexus-orange-400 to-nexus-orange-600"
        />
      </div>

      {/* Fiches en attente */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-600" />
            <h2 className="font-display text-base font-bold text-nexus-blue-950">
              Fiches en attente de validation
            </h2>
          </div>
          <Link
            href="/dashboard/super-admin/rh/paie?statut=en_attente_validation"
            className="text-xs font-semibold text-nexus-orange-600 hover:underline"
          >
            Voir toutes →
          </Link>
        </div>

        {fichesEnAttente.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucune fiche en attente. Tout est validé.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {fichesEnAttente.map((p) => {
              const emp = (p.employees as unknown as { nom_complet?: string; poste?: string } | null) ?? null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/super-admin/rh/paie/${p.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-nexus-blue-950">
                        {emp?.nom_complet ?? "—"}{" "}
                        <span className="font-mono text-xs font-normal text-slate-500">
                          · {p.reference}
                        </span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {emp?.poste} · {p.mois_libelle} ·{" "}
                        <span className="font-semibold text-nexus-blue-950">
                          {formatFcfa(Number(p.salaire_net ?? 0))}
                        </span>
                      </p>
                    </div>
                    <PayslipStatusBadge status={p.statut} />
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/super-admin/rh/employes"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50/60"
        >
          <Users className="h-6 w-6 text-nexus-blue-700" />
          <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
            Employés
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Gérer les fiches employés, contrats, documents RH.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 group-hover:underline">
            Ouvrir →
          </span>
        </Link>
        <Link
          href="/dashboard/super-admin/rh/paie"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50/60"
        >
          <Wallet className="h-6 w-6 text-nexus-orange-600" />
          <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
            Fiches de paie
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Créer, valider, archiver les bulletins de paie mensuels.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-nexus-orange-600 group-hover:underline">
            Ouvrir →
          </span>
        </Link>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
  urgent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  hint?: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border ${urgent ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"} p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-nexus-blue-950">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
