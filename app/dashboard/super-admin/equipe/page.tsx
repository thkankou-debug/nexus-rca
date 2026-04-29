import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { UsersManager } from "@/components/dashboard/UsersManager";
import type { Profile } from "@/types";

export const metadata = {
  title: "Équipe Nexus | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function EquipeNexusPage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();

  // On charge UNIQUEMENT les comptes staff (agent, admin, super_admin)
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["agent", "admin", "super_admin"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement equipe :", error);
  }
  const team = (data || []) as Profile[];

  // Stats rapides
  const counts = {
    total: team.length,
    actifs: team.filter((u) => (u as Profile & { actif?: boolean }).actif !== false).length,
    super_admins: team.filter((u) => u.role === "super_admin").length,
    admins: team.filter((u) => u.role === "admin").length,
    agents: team.filter((u) => u.role === "agent").length,
  };

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/super-admin"
        label="Retour au tableau de bord"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-nexus-blue-950">
              Équipe Nexus
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Agents, administrateurs et super-admins de l'agence.
            </p>
          </div>
        </div>

        {profile.role === "super_admin" && (
          <Link
            href="/dashboard/super-admin/equipe/nouveau"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Créer un employé Nexus
          </Link>
        )}
      </div>

      {/* Stats rapides */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total membres"
          value={counts.total}
          accent="from-nexus-blue-600 to-nexus-blue-800"
        />
        <StatCard
          label="Actifs"
          value={counts.actifs}
          accent="from-emerald-400 to-emerald-600"
        />
        <StatCard
          label="Admins / Super admins"
          value={counts.admins + counts.super_admins}
          accent="from-rose-400 to-rose-600"
        />
        <StatCard
          label="Agents"
          value={counts.agents}
          accent="from-nexus-orange-400 to-nexus-orange-600"
        />
      </div>

      {/* Bandeau d'info */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>👥 Équipe interne uniquement :</strong> cette page n'affiche que
        les comptes <strong>agent</strong>, <strong>admin</strong> et{" "}
        <strong>super-admin</strong>. Les comptes clients sont gérés dans la page{" "}
        <Link
          href="/dashboard/super-admin/comptes-clients"
          className="font-semibold underline hover:text-blue-700"
        >
          Comptes clients
        </Link>
        .
      </div>

      {/* Liste de l'equipe */}
      <UsersManager
        initialUsers={team}
        canChangeRoles={profile.role === "super_admin"}
        canDeleteUsers={profile.role === "super_admin"}
        currentUserId={profile.id}
        initialFilter="staff"
      />
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-nexus-blue-950">
        {value}
      </p>
      <div
        className={`mt-3 h-1 w-12 rounded-full bg-gradient-to-r ${accent}`}
      />
    </div>
  );
}
