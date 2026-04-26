import Link from "next/link";
import {
  ShieldCheck,
  Users,
  FileText,
  TrendingUp,
  CalendarCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemandesManager } from "@/components/dashboard/DemandesManager";
import { cn } from "@/lib/utils";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

interface RecentAppointment {
  id: string;
  reference: string | null;
  full_name: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  urgency: string;
  status: string;
  created_at: string;
}

const URGENCY_COLORS: Record<string, string> = {
  normal: "bg-slate-100 text-slate-700",
  prioritaire: "bg-nexus-orange-100 text-nexus-orange-700",
  tres_urgent: "bg-red-100 text-red-700",
};

const URGENCY_LABELS: Record<string, string> = {
  normal: "Normal",
  prioritaire: "Prioritaire",
  tres_urgent: "Très urgent",
};

const STATUS_COLORS: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  confirme: "bg-green-100 text-green-700",
  en_attente: "bg-yellow-100 text-yellow-700",
  annule: "bg-red-100 text-red-700",
  termine: "bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  confirme: "Confirmé",
  en_attente: "En attente",
  annule: "Annulé",
  termine: "Terminé",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function SuperAdminPage() {
  const profile = await requireProfile(["super_admin"]);
  const supabase = createClient();

  const [
    { count: usersCount },
    { count: clientsCount },
    { count: staffCount },
    { count: demandesCount },
    { count: rdvCount },
    { count: rdvNouveauCount },
    { data: latest },
    { data: latestRdv },
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
      .from("appointment_requests")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("appointment_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "nouveau"),
    supabase
      .from("demandes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("appointment_requests")
      .select(
        "id, reference, full_name, service, preferred_date, preferred_time, urgency, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const list = (latest || []) as Demande[];
  const appointments = (latestRdv || []) as RecentAppointment[];

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

      {/* Statistiques cliquables */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Utilisateurs"
          value={usersCount ?? 0}
          icon={Users}
          accent="blue"
          href="/dashboard/super-admin/utilisateurs"
        />
        <StatCard
          label="Clients"
          value={clientsCount ?? 0}
          icon={Users}
          accent="orange"
          href="/dashboard/super-admin/utilisateurs?filter=clients"
        />
        <StatCard
          label="Staff"
          value={staffCount ?? 0}
          icon={ShieldCheck}
          accent="red"
          href="/dashboard/super-admin/utilisateurs?filter=staff"
        />
        <StatCard
          label="Demandes"
          value={demandesCount ?? 0}
          icon={FileText}
          accent="green"
          href="/dashboard/super-admin/demandes"
        />
        <StatCard
          label="Rendez-vous"
          value={rdvCount ?? 0}
          icon={CalendarCheck}
          accent="blue"
          href="/dashboard/super-admin/rendez-vous"
        />
      </div>

      {/* Alerte super admin */}
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

      {/* Section accès rapides */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/super-admin/rendez-vous"
          className="group relative overflow-hidden rounded-2xl border-2 border-nexus-blue-200 bg-gradient-to-br from-nexus-blue-50 to-white p-6 shadow-sm transition hover:border-nexus-blue-400 hover:shadow-md"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-blue-500/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-blue-900 text-white">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Gérer les rendez-vous
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {rdvCount ?? 0} demandes au total
                  {(rdvNouveauCount ?? 0) > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {rdvNouveauCount} nouvelle{(rdvNouveauCount ?? 0) > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-nexus-blue-700 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/super-admin/demandes"
          className="group relative overflow-hidden rounded-2xl border-2 border-nexus-orange-200 bg-gradient-to-br from-nexus-orange-50 to-white p-6 shadow-sm transition hover:border-nexus-orange-400 hover:shadow-md"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-orange-500/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-orange-500 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Gérer les demandes
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {demandesCount ?? 0} dossiers au total
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-nexus-orange-700 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Derniers rendez-vous */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-nexus-blue-950">
            Derniers rendez-vous
          </h2>
          <Link
            href="/dashboard/super-admin/rendez-vous"
            className="text-sm font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
          >
            Voir tout →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm text-slate-600">
              Aucune demande de rendez-vous pour le moment.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-200">
              {appointments.map((rdv) => (
                <Link
                  key={rdv.id}
                  href="/dashboard/super-admin/rendez-vous"
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-nexus-blue-700">
                        {rdv.reference || "sans-ref"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          STATUS_COLORS[rdv.status] || "bg-slate-100 text-slate-700"
                        )}
                      >
                        {STATUS_LABELS[rdv.status] || rdv.status}
                      </span>
                      {rdv.urgency !== "normal" && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            URGENCY_COLORS[rdv.urgency] || "bg-slate-100 text-slate-700"
                          )}
                        >
                          {URGENCY_LABELS[rdv.urgency] || rdv.urgency}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-nexus-blue-950">
                      {rdv.full_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {rdv.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-xs text-slate-600">
                      <Clock className="h-3 w-3" />
                      {formatDate(rdv.preferred_date)}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {rdv.preferred_time}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dernières demandes */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-nexus-blue-950">
          Dernières demandes
        </h2>
        <DemandesManager initialDemandes={list} canDelete />
      </div>
    </DashboardShell>
  );
}
