import { ShieldCheck, Users, FileText, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemandesManager } from "@/components/dashboard/DemandesManager";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const [
    { count: usersCount },
    { count: clientsCount },
    { count: staffCount },
    { count: demandesCount },
    { data: latest },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", ["agent", "admin", "super_admin"]),
    supabase.from("demandes").select("*", { count: "exact", head: true }),
    supabase
      .from("demandes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const list = (latest || []) as Demande[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Super administration
          </h1>
          <p className="text-slate-600">
            Contrôle total sur la plateforme Nexus RCA.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={usersCount ?? 0} icon={Users} accent="blue" />
        <StatCard label="Clients" value={clientsCount ?? 0} icon={Users} accent="orange" />
        <StatCard label="Staff" value={staffCount ?? 0} icon={ShieldCheck} accent="red" />
        <StatCard label="Demandes" value={demandesCount ?? 0} icon={FileText} accent="green" />
      </div>

      <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-rose-600" />
          <div>
            <h3 className="font-semibold text-rose-900">
              Accès super admin activé
            </h3>
            <p className="mt-1 text-sm text-rose-800">
              Vous pouvez modifier les rôles de tous les utilisateurs, supprimer des demandes et voir toutes les données. Utilisez ces privilèges avec précaution.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-nexus-blue-950">
          Dernières demandes
        </h2>
        <DemandesManager initialDemandes={list} canDelete />
      </div>
    </DashboardShell>
  );
}
