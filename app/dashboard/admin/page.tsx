import { Users, FileText, Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemandesManager } from "@/components/dashboard/DemandesManager";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const [{ count: usersCount }, { count: demandesCount }, { count: enCoursCount }, { count: doneCount }, { data: latest }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("demandes").select("*", { count: "exact", head: true }),
      supabase
        .from("demandes")
        .select("*", { count: "exact", head: true })
        .eq("statut", "en_cours"),
      supabase
        .from("demandes")
        .select("*", { count: "exact", head: true })
        .eq("statut", "complete"),
      supabase
        .from("demandes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const list = (latest || []) as Demande[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Espace administrateur
        </h1>
        <p className="mt-1 text-slate-600">
          Vue globale sur l'activité et les performances de l'agence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={usersCount ?? 0} icon={Users} accent="blue" />
        <StatCard label="Demandes totales" value={demandesCount ?? 0} icon={FileText} accent="orange" />
        <StatCard label="En cours" value={enCoursCount ?? 0} icon={Clock} accent="orange" />
        <StatCard label="Complétées" value={doneCount ?? 0} icon={CheckCircle2} accent="green" />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-nexus-blue-950">
          10 dernières demandes
        </h2>
        <DemandesManager initialDemandes={list} canDelete />
      </div>
    </DashboardShell>
  );
}
